from flask import Flask, render_template, request, jsonify
import database
import chatbot
from dotenv import load_dotenv
import io
import csv
from flask import Response

load_dotenv()

app = Flask(__name__)

# Initialize database on startup
database.init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    database.process_recurring_expenses()
    query = request.args.get('q', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    category = request.args.get('category', '')
    if query:
        expenses = database.search_expenses(query, start_date, end_date, category)
    else:
        expenses = database.get_all_expenses(start_date, end_date, category)
    return jsonify({'success': True, 'data': expenses})

@app.route('/api/export', methods=['GET'])
def export_csv():
    query = request.args.get('q', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    category = request.args.get('category', '')
    if query:
        expenses = database.search_expenses(query, start_date, end_date, category)
    else:
        expenses = database.get_all_expenses(start_date, end_date, category)
        
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Importo', 'Categoria', 'Descrizione', 'Data'])
    for exp in expenses:
        cw.writerow([exp['id'], exp['amount'], exp['category'], exp['description'], exp['date']])
        
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=spese.csv"}
    )

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    try:
        amount = float(data.get('amount', 0))
        category = data.get('category', 'Sconosciuta')
        date = data.get('date', '')
        description = data.get('description', '')
        exp_type = data.get('type', 'expense')
        
        if not amount or not date:
            return jsonify({'success': False, 'error': 'Dati mancanti'}), 400
            
        database.add_expense(amount, category, description, date, exp_type)
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/expenses/<int:exp_id>', methods=['DELETE'])
def delete_expense(exp_id):
    try:
        database.delete_expense(exp_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    if not message:
        return jsonify({'success': False, 'error': 'Messaggio vuoto'}), 400
    
    reply = chatbot.chat_with_assistant(message)
    return jsonify({'success': True, 'reply': reply})

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    budgets = database.get_all_budgets()
    return jsonify({'success': True, 'data': budgets})

@app.route('/api/budgets', methods=['POST'])
def save_budget():
    data = request.json
    category = data.get('category')
    amount_limit = data.get('amount_limit', 0)
    try:
        amount_limit = float(amount_limit)
        if not category or amount_limit <= 0:
            return jsonify({'success': False, 'error': 'Dati non validi'}), 400
        database.set_budget(category, amount_limit)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/recurring', methods=['POST'])
def add_recurring():
    data = request.json
    try:
        amount = float(data.get('amount', 0))
        category = data.get('category', 'Sconosciuta')
        description = data.get('description', '')
        frequency = data.get('frequency', 'Mensile')
        next_date = data.get('next_date', '') # Format YYYY-MM-DD
        exp_type = data.get('type', 'expense')
        
        if not amount or not next_date:
             return jsonify({'success': False, 'error': 'Dati mancanti'}), 400
             
        database.add_recurring_expense(amount, category, description, frequency, next_date, exp_type)
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/recurring', methods=['GET'])
def get_recurring_api():
    recs = database.get_all_recurring()
    return jsonify({'success': True, 'data': recs})

@app.route('/api/recurring/<int:rec_id>', methods=['DELETE'])
def delete_recurring_api(rec_id):
    try:
        database.delete_recurring(rec_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/categories', methods=['GET'])
def get_categories_api():
    cats = database.get_categories()
    return jsonify({'success': True, 'data': cats})

@app.route('/api/categories', methods=['POST'])
def add_category_api():
    data = request.json
    name = data.get('name', '').strip()
    color = data.get('color', '#8b949e').strip()
    if not name:
        return jsonify({'success': False, 'error': 'Nome mancante'}), 400
    if database.add_category(name, color):
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Categoria già esistente'}), 400

@app.route('/api/categories/<path:name>', methods=['DELETE'])
def delete_category_api(name):
    success, error = database.delete_category(name)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': error}), 400

@app.route('/api/categories/<path:name>/color', methods=['PUT'])
def update_category_color_api(name):
    data = request.json
    color = data.get('color', '#8b949e')
    try:
        database.update_category_color(name, color)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/budgets/<path:category>', methods=['DELETE'])
def delete_budget_api(category):
    try:
        database.delete_budget(category)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
