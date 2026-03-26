document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // Utils & Initialization
    // -------------------------------------------------------------------------

    // Set today's date automatically in the expense form
    document.getElementById('date').valueAsDate = new Date();

    // Configurazione colori Chart.js per le varie categorie (dinamici da DB)
    let categoryColors = {
        'Alimentari': '#58a6ff',
        'Trasporti': '#f1e05a',
        'Svago': '#d2a8ff',
        'Casa': '#2ea043',
        'Salute': '#f85149',
        'Altro': '#8b949e'
    };

    // Initialize Global Chart (Doughnut)
    const canvasElement = document.getElementById('expensesChart');
    let expensesChart = null;

    if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        expensesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    title: {
                        display: true,
                        text: 'Grafico Spese',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: { family: 'Inter', size: 16, weight: '600' },
                        padding: { bottom: 15 }
                    },
                    legend: {
                        position: 'right',
                        labels: { color: '#e6edf3', padding: 20, font: { family: 'Inter', size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: 'Inter', size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function (context) {
                                return ' € ' + context.parsed.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.warn("Elemento 'expensesChart' non trovato.");
    }

    // Initialize Global Chart (Doughnut) per Entrate
    const incomesCanvas = document.getElementById('incomesChart');
    let incomesChart = null;
    if (incomesCanvas) {
        incomesChart = new Chart(incomesCanvas.getContext('2d'), {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 10 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: {
                    title: { display: true, text: 'Grafico Guadagni', color: 'rgba(255, 255, 255, 0.9)', font: { family: 'Inter', size: 16, weight: '600' }, padding: { bottom: 15 } },
                    legend: { position: 'right', labels: { color: '#e6edf3', padding: 20, font: { family: 'Inter', size: 12 } } },
                    tooltip: { backgroundColor: 'rgba(22, 27, 34, 0.9)', callbacks: { label: ctx => ' € ' + ctx.parsed.toFixed(2) } }
                }
            }
        });
    }

    // Initialize Trend Chart (Line)
    const trendCanvas = document.getElementById('trendChart');
    let trendChart = null;
    if (trendCanvas) {
        const tCtx = trendCanvas.getContext('2d');
        trendChart = new Chart(tCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Spese Giornaliere',
                    data: [],
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Andamento spese',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: { family: 'Inter', size: 16, weight: '600' },
                        padding: { bottom: 15 }
                    },
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        callbacks: { label: ctx => ' € ' + ctx.parsed.y.toFixed(2) }
                    }
                },
                scales: {
                    x: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { display: false } },
                    y: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { color: 'rgba(139, 148, 158, 0.1)' } }
                }
            }
        });
    }

    // Initialize Trend Chart Entrate (Line)
    const trendIncomesCanvas = document.getElementById('trendIncomesChart');
    let trendIncomesChart = null;
    if (trendIncomesCanvas) {
        trendIncomesChart = new Chart(trendIncomesCanvas.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Guadagni Giornalieri', data: [], borderColor: '#2ea043', backgroundColor: 'rgba(46, 160, 67, 0.2)', borderWidth: 2, fill: true, tension: 0.3 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Andamento guadagni', color: 'rgba(255, 255, 255, 0.9)', font: { family: 'Inter', size: 16, weight: '600' }, padding: { bottom: 15 } },
                    legend: { display: false },
                    tooltip: { backgroundColor: 'rgba(22, 27, 34, 0.9)', callbacks: { label: ctx => ' € ' + ctx.parsed.y.toFixed(2) } }
                },
                scales: {
                    x: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { display: false } },
                    y: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { color: 'rgba(139, 148, 158, 0.1)' } }
                }
            }
        });
    }

    // Initialize Trend Chart Saldo (Line)
    const trendNetCanvas = document.getElementById('trendNetChart');
    let trendNetChart = null;
    if (trendNetCanvas) {
        trendNetChart = new Chart(trendNetCanvas.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Saldo Cumulativo', data: [], borderColor: '#d2a8ff', backgroundColor: 'rgba(210, 168, 255, 0.2)', borderWidth: 2, fill: true, tension: 0.3 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Andamento saldo', color: 'rgba(255, 255, 255, 0.9)', font: { family: 'Inter', size: 16, weight: '600' }, padding: { bottom: 15 } },
                    legend: { display: false },
                    tooltip: { backgroundColor: 'rgba(22, 27, 34, 0.9)', callbacks: { label: ctx => ' € ' + ctx.parsed.y.toFixed(2) } }
                },
                scales: {
                    x: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { display: false } },
                    y: { ticks: { color: '#8b949e', font: { family: 'Inter' } }, grid: { color: 'rgba(139, 148, 158, 0.1)' } }
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // API Interactors & State Management
    // -------------------------------------------------------------------------

    // Fetch and Load Expenses from Backend
    const fetchExpenses = async (query = '') => {
        try {
            const start = document.getElementById('filter-start')?.value || '';
            const end = document.getElementById('filter-end')?.value || '';
            const cat = document.getElementById('filter-category')?.value || '';
            const res = await fetch(`/api/expenses?q=${query}&start_date=${start}&end_date=${end}&category=${encodeURIComponent(cat)}`);
            const json = await res.json();
            if (json.success) {
                renderExpenses(json.data);
                updateChartAndTotal(json.data);
                if (typeof renderBudgets === 'function') renderBudgets(json.data);
            }
        } catch (err) {
            console.error('Error fetching expenses:', err);
        }
    };

    // Event listener for recurring options
    document.getElementById('is-recurring')?.addEventListener('change', (e) => {
        const drop = document.getElementById('recurring-options');
        if (drop) drop.style.display = e.target.checked ? 'block' : 'none';
    });

    // Form Submit => Add new expense
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const isRecur = document.getElementById('is-recurring')?.checked || false;
        const submitDate = document.getElementById('date').value;
        const typeSelect = document.getElementById('type')?.value || 'expense';

        const expense = {
            amount: document.getElementById('amount').value,
            category: document.getElementById('category').value,
            date: submitDate,
            description: document.getElementById('description').value,
            next_date: submitDate,
            frequency: document.getElementById('frequency')?.value || 'Mensile',
            type: typeSelect
        };

        const endpoint = isRecur ? '/api/recurring' : '/api/expenses';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });
            const json = await res.json();

            if (json.success) {
                document.getElementById('expense-form').reset();
                document.getElementById('date').valueAsDate = new Date();
                const drop = document.getElementById('recurring-options');
                if (drop) drop.style.display = 'none';

                // Se è ricorrente potremo mostrare un avviso, ma intanto ricarichiamo (che processerà anche il backend)
                if (isRecur) alert('Spesa ricorrente aggiunta. Verrà addebitata partendo dalla data indicata.');

                // Re-fetch to update table & chart based on current search input
                fetchExpenses(document.getElementById('search-input').value);
            } else {
                alert('Errore durante l\'aggiunta: ' + json.error);
            }
        } catch (err) {
            console.error('Error adding expense:', err);
        }
    });

    // Delete an expense
    window.deleteExpense = async (id) => {
        if (!confirm('Sei sicuro di voler eliminare questa transazione definivitamente?')) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                fetchExpenses(document.getElementById('search-input').value);
            }
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };

    // Live Search Event Listener
    document.getElementById('search-input').addEventListener('input', (e) => {
        fetchExpenses(e.target.value);
    });

    document.getElementById('filter-start')?.addEventListener('change', () => fetchExpenses(document.getElementById('search-input').value));
    document.getElementById('filter-end')?.addEventListener('change', () => fetchExpenses(document.getElementById('search-input').value));
    document.getElementById('filter-category')?.addEventListener('change', () => fetchExpenses(document.getElementById('search-input').value));

    document.getElementById('export-btn')?.addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        const start = document.getElementById('filter-start')?.value || '';
        const end = document.getElementById('filter-end')?.value || '';
        const cat = document.getElementById('filter-category')?.value || '';
        window.open(`/api/export?q=${query}&start_date=${start}&end_date=${end}&category=${encodeURIComponent(cat)}`, '_blank');
    });

    // -------------------------------------------------------------------------
    // UI Renderers
    // -------------------------------------------------------------------------

    // Aggiorna la Tabella HTML
    const renderExpenses = (expenses) => {
        const tbody = document.getElementById('expenses-body');
        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: var(--text-secondary); padding: 40px;">
                        <i class="fa-solid fa-receipt fa-2x" style="margin-bottom: 10px; opacity: 0.5;"></i><br>
                        Nessuna transazione trovata per i criteri di ricerca
                    </td>
                </tr>`;
            return;
        }

        expenses.forEach(exp => {
            const tr = document.createElement('tr');

            // Format date to local readable variant (DD/MM/YYYY approx)
            const dateObj = new Date(exp.date);
            const formattedDate = dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Create dynamic badge colors based on DB
            const catColor = categoryColors[exp.category] || '#8b949e';
            const badgeStyle = `background: ${catColor}33; color: ${catColor}; font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 0.85em;`;

            const isIncome = exp.type === 'income';
            const amountStyle = isIncome ? 'color: #2ea043; font-weight: 600;' : 'font-weight: 600; color: #f85149;';
            const amountPrefix = isIncome ? '+€ ' : '-€ ';

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td style="font-weight: 500;">${exp.description || '<span style="color:var(--text-secondary); font-style:italic">Nessuna nota</span>'}</td>
                <td><span style="${badgeStyle}">${exp.category}</span></td>
                <td style="${amountStyle}">${amountPrefix}${exp.amount.toFixed(2)}</td>
                <td>
                    <button class="delete-btn" onclick="deleteExpense(${exp.id})" title="Elimina Spesa">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Aggiorna sia il totale in cima, sia il grafico a ciambella
    const updateChartAndTotal = (expenses) => {
        let totalIncome = 0;
        let totalExpense = 0;

        expenses.forEach(e => {
            if (e.type === 'income') totalIncome += e.amount;
            else totalExpense += e.amount;
        });

        const balance = totalIncome - totalExpense;

        const balEl = document.getElementById('total-balance');
        if (balEl) balEl.textContent = `€ ${balance.toFixed(2)}`;

        const incEl = document.getElementById('total-income');
        if (incEl) incEl.textContent = `€ ${totalIncome.toFixed(2)}`;

        const expEl = document.getElementById('total-amount');
        if (expEl) expEl.textContent = `€ ${totalExpense.toFixed(2)}`;

        // Grafici mostrano SEMPRE SOLO LE SPESE, le entrate le escludiamo dai grafici
        const onlyExpenses = expenses.filter(e => e.type !== 'income');

        // Raggruppa i valori per categoria (solo uscite)
        const categoryMap = {};
        onlyExpenses.forEach(exp => {
            categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
        });

        // Crea le labels per ChartJS e ordina i dati corrispondenti
        const labels = Object.keys(categoryMap);
        const data = Object.values(categoryMap);

        // Mappa i colori corretti in base alla categoria in ChartJS
        const backgroundColors = labels.map(label => categoryColors[label] || categoryColors['Altro'] || '#8b949e');

        // Esegui l'aggiornamento animato del grafico a ciambella
        if (expensesChart) {
            expensesChart.data.labels = labels;
            expensesChart.data.datasets[0].data = data;
            expensesChart.data.datasets[0].backgroundColor = backgroundColors;
            expensesChart.update();
        }

        // Calcola e aggiorna il grafico Linea (Trend Storico per Data)
        if (trendChart) {
            const dateMap = {};
            // Sort expenses by date ascending to plot chronologically
            const sortedExp = [...onlyExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
            sortedExp.forEach(exp => {
                const d = new Date(exp.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                dateMap[d] = (dateMap[d] || 0) + exp.amount;
            });
            trendChart.data.labels = Object.keys(dateMap);
            trendChart.data.datasets[0].data = Object.values(dateMap);
            trendChart.update();
        }

        // --- Aggiorna Grafici Entrate ---
        const onlyIncomes = expenses.filter(e => e.type === 'income');
        
        // Torta Guadagni
        const incCategoryMap = {};
        onlyIncomes.forEach(exp => {
            incCategoryMap[exp.category] = (incCategoryMap[exp.category] || 0) + exp.amount;
        });
        const incLabels = Object.keys(incCategoryMap);
        const incData = Object.values(incCategoryMap);
        const incColors = incLabels.map(l => categoryColors[l] || categoryColors['Altro'] || '#8b949e');
        
        if (incomesChart) {
            incomesChart.data.labels = incLabels;
            incomesChart.data.datasets[0].data = incData;
            incomesChart.data.datasets[0].backgroundColor = incColors;
            incomesChart.update();
        }

        // Andamento Guadagni (Line)
        if (trendIncomesChart) {
            const incDateMap = {};
            const sortedInc = [...onlyIncomes].sort((a, b) => new Date(a.date) - new Date(b.date));
            sortedInc.forEach(exp => {
                const d = new Date(exp.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                incDateMap[d] = (incDateMap[d] || 0) + exp.amount;
            });
            trendIncomesChart.data.labels = Object.keys(incDateMap);
            trendIncomesChart.data.datasets[0].data = Object.values(incDateMap);
            trendIncomesChart.update();
        }

        // Andamento Saldo (Line)
        if (trendNetChart) {
            let runningBalance = 0;
            const netDateMap = {};
            // Sort ALL expenses chronologically
            const sortedAll = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
            sortedAll.forEach(exp => {
                const d = new Date(exp.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                if (exp.type === 'income') runningBalance += exp.amount;
                else runningBalance -= exp.amount;
                netDateMap[d] = runningBalance; // always takes the latest cumulative for that day
            });
            trendNetChart.data.labels = Object.keys(netDateMap);
            trendNetChart.data.datasets[0].data = Object.values(netDateMap);
            // Change color dynamically based on final balance? Keep it purple for now.
            trendNetChart.update();
        }
    };

    // -------------------------------------------------------------------------
    // Chatbot Implementation Details
    // -------------------------------------------------------------------------

    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    // Utilità per inserire messaggi nella UI della chat
    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.className = `message ${sender}`;

        // Un semplice parser per formattare la sintassi markdown base proveniente dal modello
        let htmlText = text
            // Bold (**testo**)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic (*testo*)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Liste numerate basic (1. testo) => va convertito con cautela, facciamolo semplice coi breakline
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        div.innerHTML = htmlText;
        chatMessages.appendChild(div);

        // Auto scroll
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    };

    // Invio del messaggio a Flask (il quale interroga le Gemini APIs)
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Render messaggio utente
        addMessage(text, 'user');
        chatInput.value = '';

        // Add loading state message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = `message assistant loading`;
        loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-color)"></i> Analizzando le spese...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const json = await res.json();

            // Remove loading state element
            chatMessages.removeChild(loadingDiv);

            if (json.success) {
                // Render risposta assistente
                addMessage(json.reply, 'assistant');
            } else {
                addMessage("Ops, c'è stato un problema: " + json.error, 'assistant');
            }
        } catch (err) {
            if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
            addMessage('Errore di connessione al server locale. Assicurati che Flask stia girando.', 'assistant');
            console.error(err);
        }
    };

    // Event listener per invio dal pulsante icona...
    chatSendBtn.addEventListener('click', sendMessage);

    // ...e dal tasto "Enter" della tastiera
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // -------------------------------------------------------------------------
    // Budget Management Integration
    // -------------------------------------------------------------------------

    const fetchBudgets = async () => {
        try {
            const res = await fetch('/api/budgets');
            const json = await res.json();
            if (json.success) return json.data;
        } catch (err) {
            console.error('Error fetching budgets:', err);
        }
        return [];
    };

    window.renderBudgets = async (expenses) => {
        const budgets = await fetchBudgets();
        const container = document.getElementById('budgets-list');
        if (!container) return;

        if (!budgets || budgets.length === 0) {
            container.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">Nessun budget impostato.</span>';
            return;
        }

        // Calculate spent per category
        const spentMap = {};
        expenses.forEach(exp => {
            spentMap[exp.category] = (spentMap[exp.category] || 0) + exp.amount;
        });

        container.innerHTML = '';
        budgets.forEach(b => {
            const spent = spentMap[b.category] || 0;
            const limit = b.amount_limit;
            const percent = Math.min(100, (spent / limit) * 100);
            const isWarning = percent >= 90;
            const isDanger = percent >= 100;

            let barColor = '#2ea043'; // green
            if (isDanger) barColor = '#f85149'; // red
            else if (isWarning) barColor = '#f1e05a'; // yellow

            const div = document.createElement('div');
            div.style.background = 'rgba(22, 27, 34, 0.5)';
            div.style.padding = '10px';
            div.style.borderRadius = '8px';
            div.style.border = '1px solid var(--border-color)';

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em;">
                    <strong>${b.category}</strong>
                    <div>
                        <span style="margin-right: 10px;">€ ${spent.toFixed(2)} / € ${limit.toFixed(2)}</span>
                        <i class="fa-solid fa-xmark delete-budget-btn" style="cursor: pointer; color: var(--text-secondary);" data-category="${b.category}" title="Rimuovi Budget"></i>
                    </div>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percent}%; background: ${barColor}; height: 100%; border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            `;
            container.appendChild(div);
        });
    };


    const openBudgetModal = () => {
        return new Promise((resolve) => {
            const modal = document.getElementById('new-budget-modal');
            const catSelect = document.getElementById('modal-budget-category');
            const amountInput = document.getElementById('modal-budget-amount');
            const btnConfirm = document.getElementById('modal-budget-confirm');
            const btnCancel = document.getElementById('modal-budget-cancel');

            if (!modal) return resolve(null);

            // Populate categories
            fetch('/api/categories')
                .then(res => res.json())
                .then(json => {
                    if (json.success) {
                        catSelect.innerHTML = json.data.map(c => {
                            const name = typeof c === 'object' ? c.name : c;
                            return `<option value="${name}">${name}</option>`;
                        }).join('');
                    }
                });

            amountInput.value = '';
            modal.classList.add('active');
            amountInput.focus();

            const cleanup = () => {
                modal.classList.remove('active');
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
            };

            const onConfirm = () => {
                const category = catSelect.value;
                const amount = parseFloat(amountInput.value);
                if (isNaN(amount) || amount <= 0) {
                    alert("Importo non valido");
                    return;
                }
                cleanup();
                resolve({ category, amount });
            };

            const onCancel = () => {
                cleanup();
                resolve(null);
            };

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
        });
    };

    const openDeleteBudgetModal = (category) => {
        return new Promise((resolve) => {
            const modal = document.getElementById('delete-budget-confirm-modal');
            const msg = document.getElementById('delete-budget-msg');
            const btnConfirm = document.getElementById('modal-delete-budget-confirm');
            const btnCancel = document.getElementById('modal-delete-budget-cancel');

            if (!modal) return resolve(false);

            msg.textContent = `Sei sicuro di voler rimuovere il budget per la categoria "${category}"?`;
            modal.classList.add('active');

            const cleanup = () => {
                modal.classList.remove('active');
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
            };

            const onConfirm = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
        });
    };

    // Use delegation for buttons to be more robust
    document.addEventListener('click', async (e) => {
        // --- Add Budget ---
        const addBtn = e.target.closest('#add-budget-btn');
        if (addBtn) {
            console.log('Imposta Budget button clicked (Modal version)');
            const result = await openBudgetModal();
            if (!result) return;

            const { category, amount } = result;

            try {
                const res = await fetch('/api/budgets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: category, amount_limit: amount })
                });
                const json = await res.json();
                if (json.success) {
                    const isCalendarActive = document.getElementById('page-calendar').classList.contains('active');
                    if (isCalendarActive) initCalendarPage();
                    else fetchExpenses(document.getElementById('search-input')?.value || '');
                } else {
                    alert('Errore: ' + json.error);
                }
            } catch (err) {
                console.error('Error saving budget:', err);
            }
            return;
        }

        // --- Delete Budget ---
        const delBtn = e.target.closest('.delete-budget-btn');
        if (delBtn) {
            const category = delBtn.getAttribute('data-category');
            console.log('deleteBudget triggered (delegated) for:', category);
            
            const confirmed = await openDeleteBudgetModal(category);
            if (confirmed) {
                console.log('User confirmed deletion (Custom Modal) of:', category);
                try {
                    const res = await fetch(`/api/budgets/${encodeURIComponent(category)}`, { method: 'DELETE' });
                    const json = await res.json();
                    console.log('Delete response:', json);
                    if (json.success) {
                        if (typeof initCalendarPage === 'function') await initCalendarPage();
                        if (typeof fetchExpenses === 'function') await fetchExpenses(document.getElementById('search-input')?.value || '');
                    } else {
                        alert('Errore: ' + json.error);
                    }
                } catch (err) {
                    console.error('Error deleting budget:', err);
                }
            } else {
                console.log('User cancelled deletion (Custom Modal) of:', category);
            }
            return;
        }
    });

    // -------------------------------------------------------------------------
    // Categories Management Integration
    // -------------------------------------------------------------------------

    const loadCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.success) {
                const select = document.getElementById('category');
                if (!select) return;
                let html = '';
                json.data.forEach(c => {
                    // Use c.name because /api/categories returns a list of objects
                    const name = typeof c === 'object' ? c.name : c;
                    html += `<option value="${name}">${name}</option>`;
                });
                html += '<option value="__add_new__" style="font-weight: bold; color: var(--accent-color);">+ Aggiungi nuova...</option>';
                select.innerHTML = html;
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const openCategoryModal = () => {
        return new Promise((resolve) => {
            const modal = document.getElementById('new-category-modal');
            const nameInput = document.getElementById('modal-cat-name');
            const colorInput = document.getElementById('modal-cat-color');
            const btnConfirm = document.getElementById('modal-cat-confirm');
            const btnCancel = document.getElementById('modal-cat-cancel');

            if (!modal) return resolve(null);

            nameInput.value = '';
            colorInput.value = '#8b949e';
            modal.classList.add('active');
            nameInput.focus();

            const cleanup = () => {
                modal.classList.remove('active');
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
            };

            const onConfirm = () => {
                const name = nameInput.value.trim();
                const color = colorInput.value;
                if (!name) return; // Prevent empty submission
                cleanup();
                resolve({ name, color });
            };

            const onCancel = () => {
                cleanup();
                resolve(null);
            };

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
        });
    };

    document.getElementById('category')?.addEventListener('change', async (e) => {
        if (e.target.value === '__add_new__') {
            const result = await openCategoryModal();
            if (result) {
                try {
                    const res = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result)
                    });
                    const json = await res.json();
                    if (!json.success) alert(json.error);
                } catch (err) {
                    console.error('Error adding category:', err);
                }
            }
            await window.updateCategoriesList();
        }
    });

    document.getElementById('delete-category-btn')?.addEventListener('click', async () => {
        const select = document.getElementById('category');
        const cat = select.value;
        if (!cat || cat === '__add_new__') return;

        if (!confirm(`Sei sicuro di voler rimuovere la categoria "${cat}"?`)) return;

        try {
            const res = await fetch(`/api/categories/${encodeURIComponent(cat)}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                await window.updateCategoriesList();
            } else {
                alert('Errore: ' + json.error);
            }
        } catch (err) {
            console.error('Error deleting category:', err);
        }
    });

    document.getElementById('rec-category')?.addEventListener('change', async (e) => {
        if (e.target.value === '__add_new__') {
            const result = await openCategoryModal();
            if (result) {
                try {
                    const res = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result)
                    });
                    const json = await res.json();
                    if (!json.success) alert(json.error);
                } catch (err) {
                    console.error('Error adding category:', err);
                }
            }
            await window.updateCategoriesList();
        }
    });

    // -------------------------------------------------------------------------
    // Navigation Integration
    // -------------------------------------------------------------------------

    const switchPage = (activePage) => {
        ['home', 'recurring', 'calendar', 'charts'].forEach(p => {
            document.getElementById(`page-${p}`)?.classList.remove('active');
            document.getElementById(`nav-btn-${p}`)?.classList.remove('active');
        });
        document.getElementById(`page-${activePage}`)?.classList.add('active');
        document.getElementById(`nav-btn-${activePage}`)?.classList.add('active');
    };

    document.getElementById('nav-btn-home')?.addEventListener('click', () => switchPage('home'));
    document.getElementById('nav-btn-recurring')?.addEventListener('click', () => { switchPage('recurring'); fetchRecurring(); });
    document.getElementById('nav-btn-calendar')?.addEventListener('click', () => { switchPage('calendar'); initCalendarPage(); });
    document.getElementById('nav-btn-charts')?.addEventListener('click', () => { switchPage('charts'); initAnalyticsPage(); });

    // -------------------------------------------------------------------------
    // Calendar Page Integration
    // -------------------------------------------------------------------------

    let calendarChartInstances = {};
    let calendarInitialized = false;

    const destroyCalendarChart = (key) => {
        if (calendarChartInstances[key]) {
            calendarChartInstances[key].destroy();
            calendarChartInstances[key] = null;
        }
    };

    const initCalendarPage = async () => {
        let allData = [];
        try {
            const res = await fetch('/api/expenses');
            const json = await res.json();
            if (json.success) allData = json.data;
        } catch (e) {
            console.error(e);
            return;
        }

        const getFilteredData = () => {
            const monthFilter = document.getElementById('calendar-month-filter')?.value; // "YYYY-MM"
            if (!monthFilter) return allData;

            const [year, month] = monthFilter.split('-').map(Number);
            return allData.filter(e => {
                const d = new Date(e.date);
                return d.getFullYear() === year && (d.getMonth() + 1) === month;
            });
        };

        const renderCalendarCharts = () => {
            const filtered = getFilteredData();
            if (window.renderBudgets) window.renderBudgets(filtered);
            
            // --- SPESE ---
            const expenses = filtered.filter(e => e.type !== 'income');
            // Doughnut
            destroyCalendarChart('expDoughnut');
            const expCatMap = {};
            expenses.forEach(e => expCatMap[e.category] = (expCatMap[e.category] || 0) + e.amount);
            const expLabels = Object.keys(expCatMap);
            const expData = Object.values(expCatMap);
            const expColors = expLabels.map(l => categoryColors[l] || categoryColors['Altro'] || '#8b949e');
            const ctxExpD = document.getElementById('calendarExpensesChart')?.getContext('2d');
            if (ctxExpD) {
                calendarChartInstances['expDoughnut'] = new Chart(ctxExpD, {
                    type: 'doughnut',
                    data: { labels: expLabels, datasets: [{ data: expData, backgroundColor: expColors, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)', font: CHART_DEFAULTS.font, boxWidth: 12 } } } }
                });
            }

            // Trend
            destroyCalendarChart('expTrend');
            const expDateMap = {};
            const expSorted = [...expenses].sort((a,b) => new Date(a.date) - new Date(b.date));
            expSorted.forEach(e => {
                const d = new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                expDateMap[d] = (expDateMap[d] || 0) + e.amount;
            });
            const ctxExpT = document.getElementById('calendarTrendChart')?.getContext('2d');
            if (ctxExpT) {
                calendarChartInstances['expTrend'] = new Chart(ctxExpT, {
                    type: 'line',
                    data: { labels: Object.keys(expDateMap), datasets: [{ label: 'Spese', data: Object.values(expDateMap), borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.15)', fill: true, tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } }, y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } } } }
                });
            }

            // --- GUADAGNI ---
            const incomes = filtered.filter(e => e.type === 'income');
            // Doughnut
            destroyCalendarChart('incDoughnut');
            const incCatMap = {};
            incomes.forEach(e => incCatMap[e.category] = (incCatMap[e.category] || 0) + e.amount);
            const incLabels = Object.keys(incCatMap);
            const incData = Object.values(incCatMap);
            const incColors = incLabels.map(l => categoryColors[l] || categoryColors['Altro'] || '#8b949e');
            const ctxIncD = document.getElementById('calendarIncomesChart')?.getContext('2d');
            if (ctxIncD) {
                calendarChartInstances['incDoughnut'] = new Chart(ctxIncD, {
                    type: 'doughnut',
                    data: { labels: incLabels, datasets: [{ data: incData, backgroundColor: incColors, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)', font: CHART_DEFAULTS.font, boxWidth: 12 } } } }
                });
            }

            // Trend
            destroyCalendarChart('incTrend');
            const incDateMap = {};
            const incSorted = [...incomes].sort((a,b) => new Date(a.date) - new Date(b.date));
            incSorted.forEach(e => {
                const d = new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                incDateMap[d] = (incDateMap[d] || 0) + e.amount;
            });
            const ctxIncT = document.getElementById('calendarTrendIncomesChart')?.getContext('2d');
            if (ctxIncT) {
                calendarChartInstances['incTrend'] = new Chart(ctxIncT, {
                    type: 'line',
                    data: { labels: Object.keys(incDateMap), datasets: [{ label: 'Guadagni', data: Object.values(incDateMap), borderColor: '#2ea043', backgroundColor: 'rgba(46,160,67,0.15)', fill: true, tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } }, y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } } } }
                });
            }

            // --- SALDO NETTO CUMULATIVO ---
            destroyCalendarChart('netTrend');
            let runningBalance = 0;
            const netDateMap = {};
            const allSorted = [...filtered].sort((a,b) => new Date(a.date) - new Date(b.date));
            allSorted.forEach(e => {
                const d = new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                if (e.type === 'income') runningBalance += e.amount; else runningBalance -= e.amount;
                netDateMap[d] = runningBalance;
            });
            const ctxNetT = document.getElementById('calendarTrendNetChart')?.getContext('2d');
            if (ctxNetT) {
                calendarChartInstances['netTrend'] = new Chart(ctxNetT, {
                    type: 'line',
                    data: { labels: Object.keys(netDateMap), datasets: [{ label: 'Saldo', data: Object.values(netDateMap), borderColor: '#d2a8ff', backgroundColor: 'rgba(210,168,255,0.15)', fill: true, tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } }, y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } } } }
                });
            }
        };

        if (!calendarInitialized) {
            calendarInitialized = true;
            
            // Set default month to current month if empty
            const monthInput = document.getElementById('calendar-month-filter');
            if (monthInput && !monthInput.value) {
                const now = new Date();
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                monthInput.value = `${yyyy}-${mm}`;
            }

            monthInput?.addEventListener('change', renderCalendarCharts);

            window.addEventListener('resize', () => {
                if (document.getElementById('page-calendar').classList.contains('active')) {
                    renderCalendarCharts();
                }
            });
        }
        renderCalendarCharts();
    };


    // -------------------------------------------------------------------------
    // Recurring Expenses Page Integration
    // -------------------------------------------------------------------------

    const fetchRecurring = async () => {
        try {
            const res = await fetch('/api/recurring');
            const json = await res.json();
            if (json.success) {
                renderRecurring(json.data);
            }
        } catch (err) {
            console.error('Error fetching recurring:', err);
        }
    };

    const renderRecurring = (data) => {
        const tbody = document.getElementById('recurring-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Nessuna spesa ricorrente attiva.</td></tr>';
            return;
        }

        data.forEach(r => {
            const tr = document.createElement('tr');
            const catColor = categoryColors[r.category] || '#8b949e';
            const badgeStyle = `background: ${catColor}33; color: ${catColor}; font-weight: 600; padding: 4px 8px; border-radius: 6px; font-size: 0.85em;`;

            const isIncome = r.type === 'income';
            const amountStyle = isIncome ? 'color: #2ea043; font-weight: 600;' : 'font-weight: 600; color: #f85149;';
            const amountPrefix = isIncome ? '+€ ' : '-€ ';

            tr.innerHTML = `
                <td>${r.description || '-'}</td>
                <td><span style="${badgeStyle}">${r.category}</span></td>
                <td>${r.frequency}</td>
                <td>${r.last_date ? new Date(r.last_date).toLocaleDateString() : '-'}</td>
                <td>${new Date(r.next_date).toLocaleDateString()}</td>
                <td style="${amountStyle}">${amountPrefix}${r.amount.toFixed(2)}</td>
                <td><button class="delete-btn" onclick="deleteRecurring(${r.id})" title="Rimuovi Ricorrenza"><i class="fa-solid fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.deleteRecurring = async (id) => {
        if (!confirm('Sicuro di voler annullare questa spesa ricorrente?')) return;
        try {
            const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
            if (res.ok) fetchRecurring();
        } catch (err) { console.error('Error deleting recurring:', err); }
    };

    document.getElementById('add-recurring-btn')?.addEventListener('click', () => {
        const formDiv = document.getElementById('recurring-form-inline');
        if (formDiv) formDiv.style.display = 'block';
    });

    document.getElementById('rec-cancel-btn')?.addEventListener('click', () => {
        const formDiv = document.getElementById('recurring-form-inline');
        if (formDiv) formDiv.style.display = 'none';
    });

    document.getElementById('new-recurring-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const expense = {
            amount: document.getElementById('rec-amount').value,
            category: document.getElementById('rec-category').value,
            description: document.getElementById('rec-desc').value,
            frequency: document.getElementById('rec-freq').value,
            next_date: document.getElementById('rec-date').value,
            type: document.getElementById('rec-type')?.value || 'expense'
        };

        try {
            const res = await fetch('/api/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });
            const json = await res.json();
            if (json.success) {
                document.getElementById('new-recurring-form').reset();
                document.getElementById('recurring-form-inline').style.display = 'none';
                fetchRecurring();
                fetchExpenses(); // Update main dashboard if needed
            } else {
                alert('Errore: ' + json.error);
            }
        } catch (err) { console.error('Error:', err); }
    });

    // Populate categories in the inline recurring form too
    const populateRecCategories = (cats) => {
        const select = document.getElementById('rec-category');
        if (!select) return;
        let html = '';
        cats.forEach(c => html += `<option value="${c}">${c}</option>`);
        select.innerHTML = html;
    };

    // Override the original loadCategories to populate both selects
    const _oldLoadCategories = loadCategories;
    /* We redefine loadCategories directly here to capture data efficiently */
    window.updateCategoriesList = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.success) {
                // Aggiorna mappa colori globale
                categoryColors = {};
                json.data.forEach(c => categoryColors[c.name] = c.color || '#8b949e');

                const buildOptions = () => {
                    let html = '';
                    json.data.forEach(c => html += `<option value="${c.name}">${c.name}</option>`);
                    return html;
                };

                const select1 = document.getElementById('category');
                if (select1) {
                    const prevVal = select1.value;
                    select1.innerHTML = buildOptions();
                    if (prevVal) select1.value = prevVal;
                }

                const select2 = document.getElementById('rec-category');
                if (select2) {
                    const prevVal2 = select2.value;
                    select2.innerHTML = buildOptions();
                    if (prevVal2) select2.value = prevVal2;
                }

                const select3 = document.getElementById('filter-category');
                if (select3) {
                    const prevVal3 = select3.value;
                    let html3 = '<option value="__all__">Tutte le categorie</option>';
                    json.data.forEach(c => html3 += `<option value="${c.name}">${c.name}</option>`);
                    select3.innerHTML = html3;
                    if (prevVal3) select3.value = prevVal3;
                }
            }
        } catch (err) { console.error(err); }
    };

    // Manage Categories Modal Logic
    const manageModal = document.getElementById('manage-categories-modal');
    const closeManageModal = document.getElementById('close-manage-cats');
    const openAddCatBtn = document.getElementById('open-add-cat-modal');

    const openManageCatsModal = async () => {
        await renderManageCategories();
        manageModal.classList.add('active');
    };

    closeManageModal?.addEventListener('click', () => {
        manageModal.classList.remove('active');
    });

    document.querySelectorAll('.manage-cats-btn').forEach(btn => {
        btn.addEventListener('click', openManageCatsModal);
    });

    const renderManageCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (!json.success) return;

            const container = document.getElementById('categories-list-container');
            container.innerHTML = '';

            // Re-sync global colors
            categoryColors = {};
            json.data.forEach(c => categoryColors[c.name] = c.color || '#8b949e');

            json.data.forEach(cat => {
                const div = document.createElement('div');
                div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; margin-bottom: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);";

                const nameSpan = document.createElement('span');
                nameSpan.textContent = cat.name;
                nameSpan.style.fontWeight = '500';

                const rightDiv = document.createElement('div');
                rightDiv.style.cssText = "display: flex; gap: 10px; align-items: center;";

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = cat.color || '#8b949e';
                colorInput.title = 'Cambia Colore';
                colorInput.style.cssText = "padding: 0; width: 30px; height: 30px; border: none; cursor: pointer; background: transparent; border-radius: 4px;";
                colorInput.onchange = async (e) => {
                    const newColor = e.target.value;
                    try {
                        await fetch(`/api/categories/${encodeURIComponent(cat.name)}/color`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ color: newColor })
                        });
                        await window.updateCategoriesList();
                        fetchExpenses();
                        if (document.getElementById('page-recurring').classList.contains('active')) fetchRecurring();
                    } catch (err) { console.error(err); }
                };

                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                delBtn.title = 'Elimina Categoria';
                delBtn.className = 'btn-icon';
                delBtn.style.cssText = "width: 32px; height: 32px; min-width: 32px; border-radius: 6px; font-size: 0.9rem; background: rgba(248,81,73,0.1); color: #f85149; margin: 0;";
                delBtn.onclick = async () => {
                    if (!confirm(`Sei sicuro di voler rimuovere la categoria "${cat.name}"?`)) return;
                    try {
                        const res = await fetch(`/api/categories/${encodeURIComponent(cat.name)}`, { method: 'DELETE' });
                        const djson = await res.json();
                        if (djson.success) {
                            await window.updateCategoriesList();
                            await renderManageCategories();
                            fetchExpenses();
                        } else {
                            alert('Errore: ' + djson.error);
                        }
                    } catch (err) { console.error(err); }
                };

                rightDiv.appendChild(colorInput);
                rightDiv.appendChild(delBtn);
                div.appendChild(nameSpan);
                div.appendChild(rightDiv);
                container.appendChild(div);
            });
        } catch (e) { console.error(e); }
    };

    openAddCatBtn?.addEventListener('click', async () => {
        manageModal.classList.remove('active'); // hide temporarily
        const result = await openCategoryModal();
        if (result) {
            try {
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result)
                });
                const json = await res.json();
                if (!json.success) alert(json.error);
                await window.updateCategoriesList();
            } catch (err) { console.error(err); }
        }
        await renderManageCategories();
        manageModal.classList.add('active'); // reshow manage modal
    });

    // We update the original loadCategories to call our new one 
    // Actually js hoisting means we can just fetch it again.

    // -------------------------------------------------------------------------
    // Charts / Analytics Page
    // -------------------------------------------------------------------------

    // Chart instances for the analytics page (kept so we can destroy/rebuild)
    let analyticsChartInstances = {};
    let analyticsInitialized = false;

    const destroyChart = (key) => {
        if (analyticsChartInstances[key]) {
            analyticsChartInstances[key].destroy();
            analyticsChartInstances[key] = null;
        }
    };

    const CHART_DEFAULTS = {
        color: 'rgba(255,255,255,0.7)',
        gridColor: 'rgba(139,148,158,0.15)',
        font: { family: 'Inter', size: 11 }
    };

    // Helper: last N months labels & month-start dates
    const getMonthRange = (n) => {
        const months = [];
        const now = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                label: d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
                year: d.getFullYear(),
                month: d.getMonth()
            });
        }
        return months;
    };

    // Helper: period date cutoff
    const periodCutoff = (period) => {
        const now = new Date();
        if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
        if (period === 'quarter') return new Date(now.getFullYear(), now.getMonth() - 2, 1);
        if (period === 'year') return new Date(now.getFullYear(), 0, 1);
        return null; // 'all'
    };

    const initAnalyticsPage = async () => {
        // Fetch all expenses
        let allData = [];
        try {
            const res = await fetch('/api/expenses');
            const json = await res.json();
            if (json.success) allData = json.data;
        } catch (e) { console.error(e); return; }

        // Populate category filter on charts page
        const catSel = document.getElementById('charts-filter-category');
        if (catSel) {
            const existing = [...catSel.options].map(o => o.value);
            if (existing.length <= 1) {
                // Populate from global categoryColors
                Object.keys(categoryColors).forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name; opt.textContent = name;
                    catSel.appendChild(opt);
                });
            }
        }

        const getFilteredData = () => {
            const catFilter = document.getElementById('charts-filter-category')?.value || '__all__';
            const startFilter = document.getElementById('charts-filter-start')?.value;
            const endFilter = document.getElementById('charts-filter-end')?.value;
            return allData.filter(e => {
                const d = new Date(e.date);
                if (catFilter !== '__all__' && e.category !== catFilter) return false;
                if (startFilter && d < new Date(startFilter)) return false;
                if (endFilter && d > new Date(endFilter)) return false;
                return true;
            });
        };

        const renderAllCharts = () => {
            const filtered = getFilteredData();
            renderAnalyticsDonut(filtered);
            renderAnalyticsTrend(filtered);
            renderAnalyticsIncomes(filtered);
            renderAnalyticsTrendIncomes(filtered);
            renderAnalyticsTrendNet(filtered);
            renderAnalyticsStats(filtered);
            renderMonthlyExp(allData);
            renderMonthlyNet(allData);
            renderCatExp(allData);
            renderCatNet(allData);
        };

        // --- Stats cards + top transactions (uses filtered data) ---
        const renderAnalyticsStats = (data) => {
            const expenses = data.filter(e => e.type !== 'income');
            const incomes  = data.filter(e => e.type === 'income');

            // Total spent
            const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
            const elTotal = document.getElementById('analytics-stat-total');
            if (elTotal) elTotal.textContent = '€' + totalSpent.toFixed(2);

            // Monthly grouping for avg / min / max
            const monthMap = {};
            expenses.forEach(e => {
                const d = new Date(e.date);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                monthMap[key] = (monthMap[key] || 0) + e.amount;
            });
            const monthKeys = Object.keys(monthMap);
            const numMonths = monthKeys.length || 1;
            const avg = totalSpent / numMonths;
            const elAvg = document.getElementById('analytics-stat-avg');
            if (elAvg) elAvg.textContent = '€' + avg.toFixed(2);

            if (monthKeys.length > 0) {
                const sorted = monthKeys.sort((a, b) => monthMap[a] - monthMap[b]);
                const cheapestKey = sorted[0];
                const expensiveKey = sorted[sorted.length - 1];
                const fmtMonth = (k) => {
                    const [y, m] = k.split('-');
                    return new Date(+y, +m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
                };
                const elCM = document.getElementById('analytics-stat-cheapest-month');
                const elCV = document.getElementById('analytics-stat-cheapest-val');
                const elEM = document.getElementById('analytics-stat-expensive-month');
                const elEV = document.getElementById('analytics-stat-expensive-val');
                if (elCM) elCM.textContent = fmtMonth(cheapestKey);
                if (elCV) elCV.textContent = '€' + monthMap[cheapestKey].toFixed(2);
                if (elEM) elEM.textContent = fmtMonth(expensiveKey);
                if (elEV) elEV.textContent = '€' + monthMap[expensiveKey].toFixed(2);
            }

            // Top 3 expenses
            const topExp = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
            const elTopE = document.getElementById('analytics-top-expenses');
            if (elTopE) {
                elTopE.innerHTML = topExp.length === 0 ? '<div style="color:var(--text-secondary); font-size:0.85em;">Nessuna spesa</div>' : '';
                topExp.forEach(e => {
                    const desc = e.description ? `<div style="font-size:0.78em; color:var(--text-secondary); margin-top:2px;">${e.description}</div>` : '';
                    elTopE.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:flex-start; padding:6px 8px; background:rgba(248,81,73,0.06); border-radius:8px;">
                        <div><div style="font-size:0.88em; font-weight:600; color:#c9d1d9;">${e.category}</div>${desc}<div style="font-size:0.75em; color:var(--text-secondary); margin-top:2px;">${new Date(e.date).toLocaleDateString('it-IT')}</div></div>
                        <div style="font-weight:700; color:#f85149; font-size:0.95em; white-space:nowrap; margin-left:10px;">€${e.amount.toFixed(2)}</div>
                    </div>`;
                });
            }

            // Top 3 incomes
            const topInc = [...incomes].sort((a, b) => b.amount - a.amount).slice(0, 3);
            const elTopI = document.getElementById('analytics-top-incomes');
            if (elTopI) {
                elTopI.innerHTML = topInc.length === 0 ? '<div style="color:var(--text-secondary); font-size:0.85em;">Nessun guadagno</div>' : '';
                topInc.forEach(e => {
                    const desc = e.description ? `<div style="font-size:0.78em; color:var(--text-secondary); margin-top:2px;">${e.description}</div>` : '';
                    elTopI.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:flex-start; padding:6px 8px; background:rgba(46,160,67,0.06); border-radius:8px;">
                        <div><div style="font-size:0.88em; font-weight:600; color:#c9d1d9;">${e.category}</div>${desc}<div style="font-size:0.75em; color:var(--text-secondary); margin-top:2px;">${new Date(e.date).toLocaleDateString('it-IT')}</div></div>
                        <div style="font-weight:700; color:#2ea043; font-size:0.95em; white-space:nowrap; margin-left:10px;">€${e.amount.toFixed(2)}</div>
                    </div>`;
                });
            }
        };

        document.getElementById('charts-apply-filter')?.addEventListener('click', renderAllCharts);

        // Auto-apply on any filter change (same behaviour as Home)
        ['charts-filter-category', 'charts-filter-start', 'charts-filter-end'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', renderAllCharts);
        });

        if (!analyticsInitialized) {
            analyticsInitialized = true;
            // Monthly bar charts: re-render on month input change
            ['monthly-exp-start', 'monthly-exp-end'].forEach(id =>
                document.getElementById(id)?.addEventListener('change', () => renderMonthlyExp(allData)));
            ['monthly-net-start', 'monthly-net-end'].forEach(id =>
                document.getElementById(id)?.addEventListener('change', () => renderMonthlyNet(allData)));
            // Category bar charts: re-render on date input change
            ['cat-exp-start', 'cat-exp-end'].forEach(id =>
                document.getElementById(id)?.addEventListener('change', () => renderCatExp(allData)));
            ['cat-net-start', 'cat-net-end'].forEach(id =>
                document.getElementById(id)?.addEventListener('change', () => renderCatNet(allData)));
            // Redraw all charts on window resize
            window.addEventListener('resize', () => {
                const filtered = getFilteredData();
                renderAnalyticsDonut(filtered);
                renderAnalyticsTrend(filtered);
                renderAnalyticsIncomes(filtered);
                renderAnalyticsTrendIncomes(filtered);
                renderAnalyticsTrendNet(filtered);
                renderMonthlyExp(allData);
                renderMonthlyNet(allData);
                renderCatExp(allData);
                renderCatNet(allData);
            });
        }

        renderAllCharts();
    };

    // --- Donut (same as Home) ---
    const renderAnalyticsDonut = (data) => {
        destroyChart('donut');
        const onlyExp = data.filter(e => e.type !== 'income');
        const catMap = {};
        onlyExp.forEach(e => catMap[e.category] = (catMap[e.category] || 0) + e.amount);
        const labels = Object.keys(catMap);
        const values = Object.values(catMap);
        const colors = labels.map(l => categoryColors[l] || '#8b949e');
        const ctx = document.getElementById('analyticsDonutChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['donut'] = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Spese complessive', color: 'rgba(255,255,255,0.9)', font: { family: 'Inter', size: 14, weight: '600' }, padding: { bottom: 10 } },
                    legend: { labels: { color: 'rgba(255,255,255,0.7)', font: CHART_DEFAULTS.font, boxWidth: 12 } }
                }
            }
        });
    };

    // --- Trend line (same as Home) ---
    const renderAnalyticsTrend = (data) => {
        destroyChart('trend');
        const onlyExp = data.filter(e => e.type !== 'income');
        const sorted = [...onlyExp].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dateMap = {};
        sorted.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
            dateMap[d] = (dateMap[d] || 0) + e.amount;
        });
        const ctx = document.getElementById('analyticsTrendChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['trend'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dateMap),
                datasets: [{ label: 'Spese giornaliere', data: Object.values(dateMap), borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.15)', fill: true, tension: 0.4, pointRadius: 3 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Andamento spese', color: 'rgba(255,255,255,0.9)', font: { family: 'Inter', size: 14, weight: '600' }, padding: { bottom: 10 } },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
                }
            }
        });
    };

    // --- Incomes Donut ---
    const renderAnalyticsIncomes = (data) => {
        destroyChart('incomesDonut');
        const incomes = data.filter(e => e.type === 'income');
        const catMap = {};
        incomes.forEach(e => catMap[e.category] = (catMap[e.category] || 0) + e.amount);
        const labels = Object.keys(catMap);
        const values = Object.values(catMap);
        const colors = labels.map(l => categoryColors[l] || categoryColors['Altro'] || '#2ea043');
        const ctx = document.getElementById('analyticsIncomesChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['incomesDonut'] = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Guadagni complessivi', color: 'rgba(255,255,255,0.9)', font: { family: 'Inter', size: 14, weight: '600' }, padding: { bottom: 10 } },
                    legend: { labels: { color: 'rgba(255,255,255,0.7)', font: CHART_DEFAULTS.font, boxWidth: 12 } }
                }
            }
        });
    };

    // --- Incomes Trend Line ---
    const renderAnalyticsTrendIncomes = (data) => {
        destroyChart('trendIncomes');
        const incomes = data.filter(e => e.type === 'income');
        const sorted = [...incomes].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dateMap = {};
        sorted.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
            dateMap[d] = (dateMap[d] || 0) + e.amount;
        });
        const ctx = document.getElementById('analyticsTrendIncomesChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['trendIncomes'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dateMap),
                datasets: [{ label: 'Guadagni giornalieri', data: Object.values(dateMap), borderColor: '#2ea043', backgroundColor: 'rgba(46,160,67,0.15)', fill: true, tension: 0.4, pointRadius: 3 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Andamento guadagni', color: 'rgba(255,255,255,0.9)', font: { family: 'Inter', size: 14, weight: '600' }, padding: { bottom: 10 } },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
                }
            }
        });
    };

    // --- Net Trend Line ---
    const renderAnalyticsTrendNet = (data) => {
        destroyChart('trendNet');
        let runningBalance = 0;
        const netDateMap = {};
        const sortedAll = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedAll.forEach(exp => {
            const d = new Date(exp.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
            if (exp.type === 'income') runningBalance += exp.amount;
            else runningBalance -= exp.amount;
            netDateMap[d] = runningBalance;
        });
        const ctx = document.getElementById('analyticsTrendNetChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['trendNet'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(netDateMap),
                datasets: [{ label: 'Saldo netto cumulativo', data: Object.values(netDateMap), borderColor: '#d2a8ff', backgroundColor: 'rgba(210,168,255,0.15)', fill: true, tension: 0.4, pointRadius: 3 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Andamento saldo', color: 'rgba(255,255,255,0.9)', font: { family: 'Inter', size: 14, weight: '600' }, padding: { bottom: 10 } },
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
                }
            }
        });
    };

    // --- Monthly Expenses bar (month range from input[type=month]) ---
    const renderMonthlyExp = (data) => {
        destroyChart('monthlyExp');
        // Build month range from inputs; default last 12 months
        const now = new Date();
        const defEnd = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const defStart = (() => { const d = new Date(now.getFullYear(), now.getMonth()-11, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
        const startVal = document.getElementById('monthly-exp-start')?.value || defStart;
        const endVal   = document.getElementById('monthly-exp-end')?.value   || defEnd;
        const [sy, sm] = startVal.split('-').map(Number);
        const [ey, em] = endVal.split('-').map(Number);
        const months = [];
        let y = sy, m = sm - 1;
        while (y < ey || (y === ey && m <= em - 1)) {
            months.push({ label: new Date(y, m, 1).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }), year: y, month: m });
            m++; if (m > 11) { m = 0; y++; }
        }
        const vals = months.map(mo =>
            data.filter(e => e.type !== 'income' && new Date(e.date).getFullYear() === mo.year && new Date(e.date).getMonth() === mo.month)
                .reduce((s, e) => s + e.amount, 0));
        const ctx = document.getElementById('monthlyExpChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['monthlyExp'] = new Chart(ctx, {
            type: 'bar',
            data: { labels: months.map(mo => mo.label), datasets: [{ label: 'Uscite €', data: vals, backgroundColor: 'rgba(248,81,73,0.7)', borderColor: '#f85149', borderWidth: 1, borderRadius: 5, maxBarThickness: 55 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
                }
            }
        });
    };

    // --- Monthly Net bar (month range) ---
    const renderMonthlyNet = (data) => {
        destroyChart('monthlyNet');
        const now = new Date();
        const defEnd = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const defStart = (() => { const d = new Date(now.getFullYear(), now.getMonth()-11, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
        const startVal = document.getElementById('monthly-net-start')?.value || defStart;
        const endVal   = document.getElementById('monthly-net-end')?.value   || defEnd;
        const [sy, sm] = startVal.split('-').map(Number);
        const [ey, em] = endVal.split('-').map(Number);
        const months = [];
        let y = sy, m = sm - 1;
        while (y < ey || (y === ey && m <= em - 1)) {
            months.push({ label: new Date(y, m, 1).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }), year: y, month: m });
            m++; if (m > 11) { m = 0; y++; }
        }
        const vals = months.map(mo => {
            const inc = data.filter(e => e.type === 'income' && new Date(e.date).getFullYear() === mo.year && new Date(e.date).getMonth() === mo.month).reduce((s, e) => s + e.amount, 0);
            const exp = data.filter(e => e.type !== 'income' && new Date(e.date).getFullYear() === mo.year && new Date(e.date).getMonth() === mo.month).reduce((s, e) => s + e.amount, 0);
            return inc - exp;
        });
        const bgColors = vals.map(v => v >= 0 ? 'rgba(46,160,67,0.7)' : 'rgba(248,81,73,0.7)');
        const bdColors = vals.map(v => v >= 0 ? '#2ea043' : '#f85149');
        const ctx = document.getElementById('monthlyNetChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['monthlyNet'] = new Chart(ctx, {
            type: 'bar',
            data: { labels: months.map(mo => mo.label), datasets: [{ label: 'Saldo netto €', data: vals, backgroundColor: bgColors, borderColor: bdColors, borderWidth: 1, borderRadius: 5, maxBarThickness: 55 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { color: CHART_DEFAULTS.gridColor } }
                }
            }
        });
    };

    // --- Category Movements bar (date range from/to, ALL categories) ---
    const renderCatExp = (data) => {
        destroyChart('catExp');
        const startVal = document.getElementById('cat-exp-start')?.value;
        const endVal   = document.getElementById('cat-exp-end')?.value;
        const filtered = data.filter(e => {
            const d = new Date(e.date);
            if (startVal && d < new Date(startVal)) return false;
            if (endVal   && d > new Date(endVal))   return false;
            return true;
        });
        // Build map from filtered data (Income +, Expense -)
        const catMap = {};
        filtered.forEach(e => {
            const val = (e.type === 'income') ? e.amount : -e.amount;
            catMap[e.category] = (catMap[e.category] || 0) + val;
        });
        // Include ALL known categories
        const allCats = Object.keys(categoryColors);
        Object.keys(catMap).forEach(c => { if (!allCats.includes(c)) allCats.push(c); });
        
        // Sort by absolute value to show most significant first
        allCats.sort((a, b) => Math.abs(catMap[b] || 0) - Math.abs(catMap[a] || 0));
        
        const vals = allCats.map(c => catMap[c] || 0);
        const colors = vals.map((v, i) => v >= 0 ? 'rgba(46,160,67,0.7)' : 'rgba(248,81,73,0.7)');
        const bdColors = vals.map((v, i) => v >= 0 ? '#2ea043' : '#f85149');
        
        const ctx = document.getElementById('catExpChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['catExp'] = new Chart(ctx, {
            type: 'bar',
            data: { 
                labels: allCats, 
                datasets: [{ 
                    label: 'Movimento (€)', 
                    data: vals, 
                    backgroundColor: colors, 
                    borderColor: bdColors, 
                    borderWidth: 1, 
                    borderRadius: 5, 
                    maxBarThickness: 55 
                }] 
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { 
                        title: { display: true, text: 'Saldo (€)', color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, 
                        ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, 
                        grid: { color: CHART_DEFAULTS.gridColor } 
                    }
                }
            }
        });
    };

    // --- Category Net bar (date range, ALL categories for comparison) ---
    const renderCatNet = (data) => {
        destroyChart('catNet');
        const startVal = document.getElementById('cat-net-start')?.value;
        const endVal   = document.getElementById('cat-net-end')?.value;
        const filtered = data.filter(e => {
            const d = new Date(e.date);
            if (startVal && d < new Date(startVal)) return false;
            if (endVal   && d > new Date(endVal))   return false;
            return true;
        });
        const catMap = {};
        filtered.forEach(e => {
            const val = (e.type === 'income') ? e.amount : -e.amount;
            catMap[e.category] = (catMap[e.category] || 0) + val;
        });
        // ALL categories
        const allCats = Object.keys(categoryColors);
        Object.keys(catMap).forEach(c => { if (!allCats.includes(c)) allCats.push(c); });
        
        allCats.sort((a, b) => Math.abs(catMap[b] || 0) - Math.abs(catMap[a] || 0));
        
        const vals = allCats.map(c => catMap[c] || 0);
        const colors = vals.map(v => v >= 0 ? 'rgba(46,160,67,0.7)' : 'rgba(248,81,73,0.7)');
        const bdColors = vals.map(v => v >= 0 ? '#2ea043' : '#f85149');
        
        const ctx = document.getElementById('catNetChart')?.getContext('2d');
        if (!ctx) return;
        analyticsChartInstances['catNet'] = new Chart(ctx, {
            type: 'bar',
            data: { 
                labels: allCats, 
                datasets: [{ 
                    label: 'Movimento (€)', 
                    data: vals, 
                    backgroundColor: colors, 
                    borderColor: bdColors, 
                    borderWidth: 1, 
                    borderRadius: 5, 
                    maxBarThickness: 55 
                }] 
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, grid: { display: false } },
                    y: { 
                        title: { display: true, text: 'Saldo (€)', color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, 
                        ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, 
                        grid: { color: CHART_DEFAULTS.gridColor } 
                    }
                }
            }
        });
    };

    // Avvio iniziale
    window.updateCategoriesList();
    fetchExpenses();
});
