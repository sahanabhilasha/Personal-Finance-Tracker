document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transactionForm');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const typeInput = document.getElementById('type');
    const transactionList = document.getElementById('transactionList');
    const totalIncomeSpan = document.getElementById('totalIncome');
    const totalExpensesSpan = document.getElementById('totalExpenses');
    const balanceSpan = document.getElementById('balance');
    const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
    const printButton = document.getElementById('printButton');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let incomeTotal = 0;
    let expensesTotal = 0;

    // Initialize the chart
    const categoryChart = new Chart(categoryChartCtx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Income vs Expenses',
                data: [0, 0],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        }
    });

    function updateChart() {
        categoryChart.data.datasets[0].data = [incomeTotal, expensesTotal];
        categoryChart.update();
    }

    function addTransaction(transaction) {
        transactions.push(transaction);
        saveTransactions();
        renderTransactions();
        updateSummary();
        updateChart();
    }

    function renderTransactions() {
        transactionList.innerHTML = '';
        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.className = `list-group-item ${transaction.type === 'income' ? 'income' : 'expense'}`;
            li.innerHTML = `
                <span>${transaction.description || 'No description'} - $${transaction.amount.toFixed(2)}</span>
                <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
            `;
            transactionList.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                transactions.splice(index, 1);
                saveTransactions();
                renderTransactions();
                updateSummary();
                updateChart();
            });
        });
    }

    function updateSummary() {
        incomeTotal = 0;
        expensesTotal = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                incomeTotal += transaction.amount;
            } else {
                expensesTotal += transaction.amount;
            }
        });

        totalIncomeSpan.textContent = `$${incomeTotal.toFixed(2)}`;
        totalExpensesSpan.textContent = `$${expensesTotal.toFixed(2)}`;
        balanceSpan.textContent = `$${(incomeTotal - expensesTotal).toFixed(2)}`;
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    transactionForm.addEventListener('submit', event => {
        event.preventDefault();

        const transaction = {
            amount: parseFloat(amountInput.value),
            description: descriptionInput.value,
            type: typeInput.value
        };

        addTransaction(transaction);

        transactionForm.reset();
    });

    // Print function
    printButton.addEventListener('click', () => {
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <h1>Personal Finance Report</h1>
            <h2>Summary</h2>
            <p>Total Income: $${incomeTotal.toFixed(2)}</p>
            <p>Total Expenses: $${expensesTotal.toFixed(2)}</p>
            <p>Balance: $${(incomeTotal - expensesTotal).toFixed(2)}</p>
            <h2>Transactions</h2>
            <ul>${transactions.map(transaction => `
                <li>${transaction.description || 'No description'} - $${transaction.amount.toFixed(2)}</li>`).join('')}</ul>
            <h2>Spending Chart</h2>
            <img src="${categoryChart.toBase64Image()}" alt="Spending Chart">
        `;
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Print Report</title></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });

    // Initial render
    renderTransactions();
    updateSummary();
    updateChart();
});
