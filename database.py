import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'expenses.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            type TEXT DEFAULT 'expense'
        )
    ''')
    try:
        conn.execute('ALTER TABLE expenses ADD COLUMN type TEXT DEFAULT "expense"')
    except: pass

    conn.execute('''
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT UNIQUE NOT NULL,
            amount_limit REAL NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS recurring_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            frequency TEXT NOT NULL,
            next_date TEXT NOT NULL,
            last_date TEXT,
            type TEXT DEFAULT 'expense'
        )
    ''')
    try:
        conn.execute('ALTER TABLE recurring_expenses ADD COLUMN last_date TEXT')
    except:
        pass
    try:
        conn.execute('ALTER TABLE recurring_expenses ADD COLUMN type TEXT DEFAULT "expense"')
    except: pass
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT DEFAULT '#8b949e'
        )
    ''')
    try:
        conn.execute('ALTER TABLE categories ADD COLUMN color TEXT DEFAULT "#8b949e"')
    except: pass
    
    defaults = [
        ('Alimentari', '#58a6ff'),
        ('Trasporti', '#f1e05a'),
        ('Svago', '#d2a8ff'),
        ('Casa', '#2ea043'),
        ('Salute', '#f85149'),
        ('Altro', '#8b949e')
    ]
    for cat, color in defaults:
        conn.execute('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)', (cat, color))
        # Update just in case the ALTER added NULL
        conn.execute('UPDATE categories SET color = ? WHERE name = ? AND (color IS NULL OR color = "#8b949e")', (color, cat))
        
    conn.commit()
    conn.close()

def add_expense(amount, category, description, date, exp_type='expense'):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO expenses (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)',
                   (amount, category, description, date, exp_type))
    conn.commit()
    exp_id = cursor.lastrowid
    conn.close()
    return exp_id

def get_all_expenses(start_date=None, end_date=None, category=None):
    conn = get_db_connection()
    sql = 'SELECT * FROM expenses WHERE 1=1'
    params = []
    
    if category and category != "__all__":
        sql += ' AND category = ?'
        params.append(category)
        
    if start_date:
        sql += ' AND date >= ?'
        params.append(start_date)
    if end_date:
        sql += ' AND date <= ?'
        params.append(end_date)
    sql += ' ORDER BY date DESC'
    expenses = conn.execute(sql, tuple(params)).fetchall()
    conn.close()
    return [dict(ix) for ix in expenses]

def delete_expense(exp_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM expenses WHERE id = ?', (exp_id,))
    conn.commit()
    conn.close()

def search_expenses(query, start_date=None, end_date=None, category=None):
    conn = get_db_connection()
    q = f"%{query}%"
    sql = '''
        SELECT * FROM expenses 
        WHERE (category LIKE ? OR description LIKE ? OR date LIKE ?)
    '''
    params = [q, q, q]
    
    if category and category != "__all__":
        sql += ' AND category = ?'
        params.append(category)
        
    if start_date:
        sql += ' AND date >= ?'
        params.append(start_date)
    if end_date:
        sql += ' AND date <= ?'
        params.append(end_date)
    sql += ' ORDER BY date DESC'
    expenses = conn.execute(sql, tuple(params)).fetchall()
    conn.close()
    return [dict(ix) for ix in expenses]

def get_all_budgets():
    conn = get_db_connection()
    budgets = conn.execute('SELECT * FROM budgets').fetchall()
    conn.close()
    return [dict(ix) for ix in budgets]

def set_budget(category, amount_limit):
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM budgets WHERE category = ?', (category,)).fetchone()
    if existing:
        conn.execute('UPDATE budgets SET amount_limit = ? WHERE id = ?', (amount_limit, existing['id']))
    else:
        conn.execute('INSERT INTO budgets (category, amount_limit) VALUES (?, ?)', (category, amount_limit))
    conn.commit()
    conn.close()

def add_recurring_expense(amount, category, description, frequency, next_date, exp_type='expense'):
    from datetime import date
    conn = get_db_connection()
    last_date = date.today().isoformat()
    conn.execute('INSERT INTO recurring_expenses (amount, category, description, frequency, next_date, last_date, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                 (amount, category, description, frequency, next_date, last_date, exp_type))
    conn.commit()
    conn.close()

def process_recurring_expenses():
    from datetime import datetime, date, timedelta
    import calendar
    
    def add_months(sourcedate, months):
        month = sourcedate.month - 1 + months
        year = sourcedate.year + month // 12
        month = month % 12 + 1
        day = min(sourcedate.day, calendar.monthrange(year, month)[1])
        return sourcedate.replace(year=year, month=month, day=day)

    conn = get_db_connection()
    today_str = date.today().isoformat()
    due_recurring = conn.execute('SELECT * FROM recurring_expenses WHERE next_date <= ?', (today_str,)).fetchall()
    
    for rec in due_recurring:
        # Aggiungi alle spese normali
        exp_type = rec['type'] if 'type' in rec.keys() else 'expense'
        conn.execute('INSERT INTO expenses (amount, category, description, date, type) VALUES (?, ?, ?, ?, ?)',
                     (rec['amount'], rec['category'], rec['description'], rec['next_date'], exp_type))
        
        # Calcola prossima data
        curr_obj = datetime.strptime(rec['next_date'], '%Y-%m-%d').date()
        if rec['frequency'] == 'Mensile':
            next_obj = add_months(curr_obj, 1)
        elif rec['frequency'] == 'Settimanale':
            next_obj = curr_obj + timedelta(days=7)
        else:
            next_obj = add_months(curr_obj, 1) # default
            
        # Aggiorna il record ricorrente
        conn.execute('UPDATE recurring_expenses SET next_date = ?, last_date = ? WHERE id = ?',
                     (next_obj.isoformat(), rec['next_date'], rec['id']))
                     
    if due_recurring:
        conn.commit()
    conn.close()

def get_all_recurring():
    conn = get_db_connection()
    recs = conn.execute('SELECT * FROM recurring_expenses ORDER BY next_date ASC').fetchall()
    conn.close()
    return [dict(ix) for ix in recs]

def delete_recurring(rec_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM recurring_expenses WHERE id = ?', (rec_id,))
    conn.commit()
    conn.close()

def get_categories():
    conn = get_db_connection()
    cats = conn.execute('SELECT name, color FROM categories ORDER BY name').fetchall()
    conn.close()
    return [{'name': c['name'], 'color': c['color']} for c in cats]

def add_category(name, color='#8b949e'):
    import sqlite3
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO categories (name, color) VALUES (?, ?)', (name, color))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def update_category_color(name, color):
    conn = get_db_connection()
    conn.execute('UPDATE categories SET color = ? WHERE name = ?', (color, name))
    conn.commit()
    conn.close()

def delete_category(name):
    conn = get_db_connection()
    exp = conn.execute('SELECT id FROM expenses WHERE category = ? LIMIT 1', (name,)).fetchone()
    if exp:
        conn.close()
        return False, "Categoria in uso (transazioni associate)."
        
    rec = conn.execute('SELECT id FROM recurring_expenses WHERE category = ? LIMIT 1', (name,)).fetchone()
    if rec:
        conn.close()
        return False, "Categoria in uso (spese ricorrenti)."
        
    bud = conn.execute('SELECT id FROM budgets WHERE category = ? LIMIT 1', (name,)).fetchone()
    if bud:
        conn.close()
        return False, "Categoria in uso (budget impostato)."
        
    conn.execute('DELETE FROM categories WHERE name = ?', (name,))
    conn.commit()
    conn.close()
    return True, ""

def delete_budget(category):
    conn = get_db_connection()
    conn.execute('DELETE FROM budgets WHERE category = ?', (category,))
    conn.commit()
    conn.close()
