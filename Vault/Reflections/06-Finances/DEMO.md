---
date: 2025-01-01
From: 2025-01-01
To: 2025-04-02
obsidianUIMode: preview
cssclasses: 
Assets: 
Income: 
Expenses: 
Liabilities: 
Transactions:
  - Starting Balance-Assets:Cash,Assets:Bank|Starting Balance=2500(1000,1500);[2025-03-18]
  - Assets:Cash,Assets:Bank-Expenses:Groceries|Bought Groceries=75(50,25);[2025-03-18]
  - Income:Salary-Assets:Bank|Salary=4000;[2025-04-01]
Account: Account
Sort: Ascending
---

`INPUT[inlineSelect(class(movies), option(Account), option(Assets),option(Income), option(Expenses), option(Liabilities)):Account]`   `INPUT[inlineSelect(class(movies), option(Ascending),option(Descending), option(Highest), option(Lowest)):Sort]`   **Date:** `INPUT[date(class(DateFrom)):From]` ➔ `INPUT[date(class(DateTo)):To]`   `BUTTON[Refresh]`

```meta-bind-embed
[[Movies Embeds]]
```

```dataviewjs
// Import MetaEdit plugin
const { update } = app.plugins.plugins["metaedit"].api;

// Retrieve data from the current YAML file
const yamlData = dv.current();
const transactions = yamlData.Transactions || [];
const accountFilter = yamlData.Account || "Account"; // Default to all accounts if not specified
// At the top of your script
const dateFrom = yamlData.From ? new Date(yamlData.From) : null;
const dateTo = yamlData.To ? new Date(yamlData.To) : null;
const sortOrder = yamlData.Sort || "Ascending"; // Default sort order is Ascending
// Add debug output
console.log(`Date From: ${yamlData.From} parsed as ${dateFrom}`);
console.log(`Date To: ${yamlData.To} parsed as ${dateTo}`);

// Define color constants for headings
const headingColors = {
    Date: "#4580c5",
    Description: "rgb(223, 196, 150)",
    Transaction: "rgb(52, 152, 219)",
    From: "rgb(220, 133, 86)",
    To: "rgb(88, 86, 220)",
    Balance: "rgb(171, 191, 226)"
};

// Define color mapping for keywords
const colorMap = {
    ":": "rgb(195, 200, 223)",
    ",": "rgb(120, 120, 120)",
    "|": "rgb(100, 150, 200)",
    ".": "rgb(180, 180, 180)",
    "Assets": "rgb(171, 191, 226)",
    "Income": "rgb(26, 188, 156)",
    "Expenses": "rgb(220, 86, 151)",
    "Liabilities": "rgb(223, 196, 150)",
    "Starting Balance": "#5856dc",
    "Bank": "#c83475",
    "Cash": "#4990e2",
};


// Define colors for positive and negative values
const valueColors = {
    positive: {
        Assets: "#abbfe2", // Ice White
        Income: "#1abc90", // Green
        Expenses: "#dc5697", // Red
        Liabilities: "rgb(52, 152, 219)", // Light Blue
        "Starting Balance": "#5856dc"
    },
    negative: {
        Assets: "#abbfe2", // Ice White
        Income: "#1abc90", // Green
        Expenses: "#dc5697", // Red
        Liabilities: "rgb(241, 196, 15)", // Yellow
        "Starting Balance": "#5856dc",
    }
};

// Define a currency symbol constant
const currencySymbol = "$"; // Change to any other symbol
const currencyStyle = {
    fontSize: "20px", // Adjust font size
    color: "#bb9fd4", // Adjust color
    fontWeight: "bold", // Adjust weight if needed
};

const applyColor = (text) => {
    return text.replace(/[:.,|]/g, (symbol) => {
        const color = colorMap[symbol] || "inherit";
        return `<span style="color: ${color};">${symbol}</span>`;
    });
};

// Function to format amounts with the currency symbol and sign control
const formatCurrency = (amount, accountType = null) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.error(`Invalid amount provided: ${amount}`);
        return `$ N/A`;
    }
    let displayAmount = amount;
    if (accountType === 'Income') {
        displayAmount = Math.abs(amount);
    } else if (accountType === 'Expenses') {
        displayAmount = -Math.abs(amount);
    }
return `${currencySymbol}${displayAmount.toFixed(0)}`;
};


// Initialize account balances and keep track of changes for YAML updates
const accountBalances = {
    Assets: {},
    Income: {},
    Expenses: {},
    Liabilities: {}
};

const handleNewTransaction = (newTransactions) => {
    let currentTransactions = dv.current().Transactions || [];
    if (!Array.isArray(currentTransactions)) {
        currentTransactions = [];
    }
    const missingTransactions = newTransactions.filter(t => !currentTransactions.includes(t));
    if (missingTransactions.length > 0) {
        currentTransactions = [...currentTransactions, ...missingTransactions];
        update('Transactions', currentTransactions, dv.current().file.path)
            .then(() => {
                console.log("Transactions successfully updated:", currentTransactions);
            })
            .catch((err) => {
                console.error("Error updating Transactions in YAML:", err);
            });
    } else {
        console.log("No new transactions to add.");
    }
};

// ---------------------- Transaction Input Modal ----------------------

// Dialog class used for modal creation
class Dialog {
    constructor() {
        this.contentEl = createEl('div', { cls: 'transaction-dialog' });
        this.modalEl = document.createElement('div');
        this.modalEl.className = 'modal';
        // Add close button
        this.closeBtn = createEl('button', {
            text: 'X',
            cls: 'modal-close-btn'
        });
        this.closeBtn.addEventListener('click', () => this.close());
        this.modalEl.appendChild(this.closeBtn);
        this.modalEl.appendChild(this.contentEl);
        document.body.appendChild(this.modalEl);
    }
    open() {
        this.modalEl.style.display = 'block';
    }
    close() {
        this.modalEl.style.display = 'none';
        // Clear content on close for a fresh start
        this.contentEl.innerHTML = "";
    }
}

// New TransactionInput component with a single unified form
const TransactionInput = ({ onSubmit }) => {
    const container = createEl('div');
    const button = createEl('button', {
        text: 'Add Transaction',
        cls: 'mod-cta',
        attr: { style: 'font-weight: bold;' }
    });
    // Button styling
    button.style.backgroundColor = "transparent";
    button.style.color = "rgb(52, 152, 219)";
    button.style.fontWeight = "bold";
    button.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    button.style.borderLeft = "1px solid rgba(255, 255, 255, 0.1)";
    button.style.borderRight = "1px solid rgba(255, 255, 255, 0.1)";
    button.style.borderBottom = "none";
    button.style.padding = "8px 12px";
    button.style.borderRadius = "6px";
    button.style.boxShadow = `
        0 0.1rem 0.3rem var(--background-modifier-box-shadow),
        -0.05rem 0 0.3rem var(--background-modifier-box-shadow)
    `;
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.style.fontFamily = "inherit";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.gap = "4px";
    button.style.transition = "all 0.2s ease";
    button.addEventListener('mouseenter', () => {
        button.style.border = "1px solid #3498db";
        button.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
    });
    button.addEventListener('mouseleave', () => {
        button.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
        button.style.borderLeft = "1px solid rgba(255, 255, 255, 0.1)";
        button.style.borderRight = "1px solid rgba(255, 255, 255, 0.1)";
        button.style.borderBottom = "none";
        button.style.backgroundColor = "transparent";
    });

    let dialog = null;
    button.addEventListener('click', () => {
        if (!dialog) {
            dialog = new Dialog();
            // Build the unified transaction form
            const form = createEl('div', { cls: 'transaction-form' });
            // Add a style block for the form
            const style = document.createElement('style');
            style.textContent = `
                .transaction-dialog {
                    background: var(--background-primary);
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    position: relative;
                    max-width: 500px;
                }
                .modal {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                }
                .transaction-form .form-group {
                    margin-bottom: 15px;
                }
                .transaction-form label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                .transaction-form input[type="date"],
                .transaction-form input[type="text"],
                .transaction-form input[type="number"] {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                }
                .account-section {
                    margin-bottom: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px;
                    border-radius: 5px;
                }
                .account-section h3 {
                    margin-top: 0;
                    font-size: 16px;
                }
                .account-rows .account-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 5px;
                }
                .add-account-btn, .remove-account-btn {
                    width: 30px;
                    height: 30px;
                    font-size: 18px;
                    line-height: 30px;
                    text-align: center;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    color: rgb(52, 152, 219);
                }
                .account-total {
                    font-weight: bold;
                    text-align: right;
                    margin-top: 5px;
                }
                .mod-cta, .mod-warning {
                    margin-top: 15px;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .mod-cta:disabled {
                    background-color: grey;
                    cursor: not-allowed;
                }
                .mod-cta {
                    background-color: rgb(52, 152, 219);
                    color: white;
                }
                .mod-warning {
                    background-color: rgb(231, 76, 60);
                    color: white;
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(style);
            
            // Date field
            const dateDiv = createEl('div', { cls: 'form-group' });
            dateDiv.appendChild(createEl('label', { text: 'Date:' }));
            const dateInput = createEl('input', { type: 'date', value: new Date().toISOString().split('T')[0], cls: 'transaction-input-date' });
            dateDiv.appendChild(dateInput);
            form.appendChild(dateDiv);
            
            // Description field
            const descDiv = createEl('div', { cls: 'form-group' });
            descDiv.appendChild(createEl('label', { text: 'Description:' }));
            const descInput = createEl('input', { type: 'text', placeholder: 'Description', cls: 'transaction-input-desc' });
            descDiv.appendChild(descInput);
            form.appendChild(descDiv);
            
            // "From" section
            const fromSection = createEl('div', { cls: 'account-section' });
            fromSection.appendChild(createEl('h3', { text: 'From' }));
            const fromRows = createEl('div', { cls: 'account-rows', id: 'from-rows' });
            // Function to create a new From row
            const createFromRow = (isInitial) => {
                const row = createEl('div', { cls: 'account-row' });
                if (isInitial) {
                    const plusBtn = createEl('button', { text: '+', cls: 'add-account-btn' });
                    plusBtn.addEventListener('click', () => {
                        fromRows.appendChild(createFromRow(false));
                        updateTotals();
                    });
                    row.appendChild(plusBtn);
                } else {
                    const minusBtn = createEl('button', { text: '-', cls: 'remove-account-btn' });
                    minusBtn.addEventListener('click', () => {
                        row.remove();
                        if (fromRows.childElementCount === 0) {
                            fromRows.appendChild(createFromRow(true));
                        }
                        updateTotals();
                    });
                    row.appendChild(minusBtn);
                }
                const acctInput = createEl('input', { type: 'text', placeholder: 'Account name (e.g., Assets:Cash)', cls: 'account-name' });
                row.appendChild(acctInput);
                const amtInput = createEl('input', { type: 'number', placeholder: 'Amount', cls: 'account-amount' });
                amtInput.addEventListener('input', updateTotals);
                row.appendChild(amtInput);
                return row;
            };
            // Add an initial row for "From"
            fromRows.appendChild(createFromRow(true));
            fromSection.appendChild(fromRows);
            const fromTotalDisplay = createEl('div', { cls: 'account-total', id: 'from-total', text: 'Total: 0' });
            fromSection.appendChild(fromTotalDisplay);
            form.appendChild(fromSection);
            
            // "To" section
            const toSection = createEl('div', { cls: 'account-section' });
            toSection.appendChild(createEl('h3', { text: 'To' }));
            const toRows = createEl('div', { cls: 'account-rows', id: 'to-rows' });
            const createToRow = (isInitial) => {
                const row = createEl('div', { cls: 'account-row' });
                if (isInitial) {
                    const plusBtn = createEl('button', { text: '+', cls: 'add-account-btn' });
                    plusBtn.addEventListener('click', () => {
                        toRows.appendChild(createToRow(false));
                        updateTotals();
                    });
                    row.appendChild(plusBtn);
                } else {
                    const minusBtn = createEl('button', { text: '-', cls: 'remove-account-btn' });
                    minusBtn.addEventListener('click', () => {
                        row.remove();
                        if (toRows.childElementCount === 0) {
                            toRows.appendChild(createToRow(true));
                        }
                        updateTotals();
                    });
                    row.appendChild(minusBtn);
                }
                const acctInput = createEl('input', { type: 'text', placeholder: 'Account name (e.g., Expenses:Foods)', cls: 'account-name' });
                row.appendChild(acctInput);
                const amtInput = createEl('input', { type: 'number', placeholder: 'Amount', cls: 'account-amount' });
                amtInput.addEventListener('input', updateTotals);
                row.appendChild(amtInput);
                return row;
            };
            toRows.appendChild(createToRow(true));
            toSection.appendChild(toRows);
            const toTotalDisplay = createEl('div', { cls: 'account-total', id: 'to-total', text: 'Total: 0' });
            toSection.appendChild(toTotalDisplay);
            form.appendChild(toSection);
            
            // Submit and Cancel buttons
            const submitBtn = createEl('button', { text: 'Submit Transaction', cls: 'mod-cta' });
            submitBtn.disabled = true;
            form.appendChild(submitBtn);
            const cancelBtn = createEl('button', { text: 'Cancel', cls: 'mod-warning' });
            cancelBtn.addEventListener('click', () => dialog.close());
            form.appendChild(cancelBtn);
            
            dialog.contentEl.appendChild(form);
            
            // Function to update totals and enable/disable the submit button
            function updateTotals() {
                const fromAmountInputs = fromRows.querySelectorAll('.account-amount');
                const toAmountInputs = toRows.querySelectorAll('.account-amount');
                let fromTotal = 0;
                fromAmountInputs.forEach(input => {
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) fromTotal += val;
                });
                let toTotal = 0;
                toAmountInputs.forEach(input => {
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) toTotal += val;
                });
                fromTotalDisplay.textContent = `Total: ${fromTotal.toFixed(2)}`;
                toTotalDisplay.textContent = `Total: ${toTotal.toFixed(2)}`;
                let valid = (fromTotal > 0 && toTotal > 0 && Math.abs(fromTotal - toTotal) < 0.001);
                fromRows.querySelectorAll('.account-row').forEach(row => {
                    const acct = row.querySelector('.account-name').value.trim();
                    if (acct === '') valid = false;
                });
                toRows.querySelectorAll('.account-row').forEach(row => {
                    const acct = row.querySelector('.account-name').value.trim();
                    if (acct === '') valid = false;
                });
                submitBtn.disabled = !valid;
            }
            
            // Submit button event: collect data and build the transaction string
            submitBtn.addEventListener('click', () => {
                const dateVal = dateInput.value;
                const descVal = descInput.value.trim() || 'No Description';
                // Gather "From" entries
                const fromRowsArr = Array.from(fromRows.querySelectorAll('.account-row'));
                const fromAccounts = [];
                const fromAmounts = [];
                fromRowsArr.forEach(row => {
                    const acct = row.querySelector('.account-name').value.trim();
                    const amt = parseFloat(row.querySelector('.account-amount').value);
                    if (acct && !isNaN(amt)) {
                        fromAccounts.push(acct);
                        fromAmounts.push(amt);
                    }
                });
                // Gather "To" entries
                const toRowsArr = Array.from(toRows.querySelectorAll('.account-row'));
                const toAccounts = [];
                const toAmounts = [];
                toRowsArr.forEach(row => {
                    const acct = row.querySelector('.account-name').value.trim();
                    const amt = parseFloat(row.querySelector('.account-amount').value);
                    if (acct && !isNaN(amt)) {
                        toAccounts.push(acct);
                        toAmounts.push(amt);
                    }
                });
                const totalFrom = fromAmounts.reduce((a, b) => a + b, 0);
                const totalTo = toAmounts.reduce((a, b) => a + b, 0);
                if (Math.abs(totalFrom - totalTo) > 0.001) {
                    notice("Totals for From and To do not match.");
                    return;
                }
                // Build the account parts (comma-separated)
                const fromAccountsStr = fromAccounts.join(",");
                const toAccountsStr = toAccounts.join(",");
                let amountPart = "";
                if (fromAccounts.length === 1 && toAccounts.length === 1) {
                    amountPart = totalFrom.toString();
                } else if (fromAccounts.length === 1 && toAccounts.length > 1) {
                    amountPart = totalFrom.toString() + '(' + toAmounts.join(',') + ')';
                } else if (fromAccounts.length > 1 && toAccounts.length === 1) {
                    amountPart = totalTo.toString() + '(' + fromAmounts.join(',') + ')';
                } else if (fromAccounts.length > 1 && toAccounts.length > 1) {
                    amountPart = fromAmounts.join(',') + '(' + toAmounts.join(',') + ')';
                }
                const transactionStr = `${fromAccountsStr}-${toAccountsStr}|${descVal}=${amountPart};[${dateVal}]`;
                console.log("Submitting transaction:", transactionStr);
                if (typeof onSubmit === 'function') {
                    try {
                        onSubmit([transactionStr]);
                        console.log("Transaction submitted successfully.");
                    } catch (error) {
                        console.error("Error during submission:", error);
                    }
                } else {
                    console.error("onSubmit is not defined or not a function.");
                }
                dialog.close();
            });
        }
        dialog.open();
    });
    container.appendChild(button);
    return container;
};

// ---------------------- Processing Transactions ----------------------

// Load initial balances from YAML
for (const [type, entries] of Object.entries(accountBalances)) {
    const yamlEntries = yamlData[type] || [];
    for (const entry of yamlEntries) {
        const [name, value] = entry.split("=");
        accountBalances[type][name.trim()] = parseFloat(value) || 0;
    }
}

// Modified date parsing function
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanDateStr = dateStr.replace(/[\[\]]/g, '').trim();
    return new Date(cleanDateStr);
};

// Process transactions and compute breakdown arrays for display
const transactionRecords = transactions.map((transaction) => {
    const [accounts, rest] = transaction.split("|");
    if (!accounts || !rest) {
        console.log("Invalid transaction format:", transaction);
        return null;
    }
    const [fromStr, toStr] = accounts.split("-");
    if (!fromStr || !toStr) {
        console.log("Invalid accounts format:", transaction);
        return null;
    }
    const fromAccounts = fromStr.split(",").map(s => s.trim());
    const toAccounts = toStr.split(",").map(s => s.trim());
    const [description, amountDate] = rest.split("=");
    if (!description || !amountDate) {
        console.log("Invalid details format:", transaction);
        return null;
    }
    const [amountPart, dateStr] = amountDate.split(";");
    if (!amountPart || !dateStr) {
        console.log("Invalid amount or date in:", transaction);
        return null;
    }
    const date = parseDate(dateStr);
    if (!date) {
        console.log("Invalid date:", dateStr);
        return null;
    }
    
    // Parse the total amount and any split amounts.
    let totalAmount;
    let splitAmounts = null;
    const splitMatch = amountPart.trim().match(/^([\d.,]+)(?:\(([^)]+)\))?$/);
    if (!splitMatch) {
        console.log("Invalid amount format:", amountPart);
        return null;
    }
    if (splitMatch[1].includes(",")) {
        const parts = splitMatch[1].split(",").map(s => parseFloat(s.trim()));
        if (parts.some(val => isNaN(val))) {
            console.log("Invalid from-side amounts:", splitMatch[1]);
            return null;
        }
        totalAmount = parts.reduce((a, b) => a + b, 0);
    } else {
        totalAmount = parseFloat(splitMatch[1]);
    }
    if (isNaN(totalAmount)) {
        console.log("Invalid total amount:", splitMatch[1]);
        return null;
    }
    if (splitMatch[2]) {
        splitAmounts = splitMatch[2].split(",").map(s => parseFloat(s.trim()));
        if (splitAmounts.some(val => isNaN(val))) {
            console.log("Invalid split amounts in:", splitMatch[2]);
            return null;
        }
        const sumSplits = splitAmounts.reduce((a, b) => a + b, 0);
        if (Math.abs(sumSplits - totalAmount) > 0.001) {
            console.log("Split amounts do not sum to total:", splitAmounts, totalAmount);
            return null;
        }
    }
    
    // Build breakdown arrays for display in the Finances table.
    let fromBreakdown = [];
    let toBreakdown = [];
    if (!splitAmounts) {
        fromBreakdown.push({ account: fromAccounts[0], amount: totalAmount });
        toBreakdown.push({ account: toAccounts[0], amount: totalAmount });
    } else if (fromAccounts.length === 1 && toAccounts.length > 1) {
        fromBreakdown.push({ account: fromAccounts[0], amount: totalAmount });
        toBreakdown = toAccounts.map((acct, i) => ({ account: acct, amount: splitAmounts[i] }));
    } else if (fromAccounts.length > 1 && toAccounts.length === 1) {
        toBreakdown.push({ account: toAccounts[0], amount: totalAmount });
        fromBreakdown = fromAccounts.map((acct, i) => ({ account: acct, amount: splitAmounts[i] }));
    } else if (fromAccounts.length > 1 && toAccounts.length > 1) {
        const fromAmountsParts = splitMatch[1].includes(",") ? splitMatch[1].split(",").map(s => parseFloat(s.trim())) : [totalAmount];
        fromBreakdown = fromAccounts.map((acct, i) => ({ account: acct, amount: fromAmountsParts[i] }));
        toBreakdown = toAccounts.map((acct, i) => ({ account: acct, amount: splitAmounts[i] }));
    }
    
    // Prepare account objects for balance updates
    const parseAccount = (acctStr) => {
        const parts = acctStr.split(":");
        const type = parts[0];
        const name = parts.slice(1).join(":").trim();
        return { type, name };
    };
    const fromParsed = fromAccounts.map(parseAccount);
    const toParsed = toAccounts.map(parseAccount);
    
    // Initialize account balances if needed
    fromParsed.forEach(({ type, name }) => {
        if (!accountBalances[type]) accountBalances[type] = {};
        if (!accountBalances[type][name]) accountBalances[type][name] = 0;
    });
    toParsed.forEach(({ type, name }) => {
        if (!accountBalances[type]) accountBalances[type] = {};
        if (!accountBalances[type][name]) accountBalances[type][name] = 0;
    });
    
    const initialFromBalance = accountBalances[fromParsed[0].type][fromParsed[0].name];
    
    // Update account balances based on the splitting mode
    if (!splitAmounts) {
        accountBalances[fromParsed[0].type][fromParsed[0].name] -= totalAmount;
        accountBalances[toParsed[0].type][toParsed[0].name] += totalAmount;
    } else if (fromAccounts.length === 1 && toAccounts.length > 1) {
        accountBalances[fromParsed[0].type][fromParsed[0].name] -= totalAmount;
        toParsed.forEach((acct, i) => {
            accountBalances[acct.type][acct.name] += splitAmounts[i];
        });
    } else if (fromAccounts.length > 1 && toAccounts.length === 1) {
        fromParsed.forEach((acct, i) => {
            accountBalances[acct.type][acct.name] -= splitAmounts[i];
        });
        accountBalances[toParsed[0].type][toParsed[0].name] += totalAmount;
    } else if (fromAccounts.length > 1 && toAccounts.length > 1) {
        fromParsed.forEach((acct, i) => {
            accountBalances[acct.type][acct.name] -= splitAmounts[i];
        });
        toParsed.forEach((acct, i) => {
            accountBalances[acct.type][acct.name] += splitAmounts[i];
        });
    }

	// After updating account balances for the transaction…
	let assetAcc = null;
	if (fromParsed.some(acct => acct.type === "Assets" && acct.name === "Cash")) {
	  assetAcc = { type: "Assets", name: "Cash" };
	} else {
	  assetAcc = fromParsed.find(acct => acct.type === "Assets") || toParsed.find(acct => acct.type === "Assets");
	}
	const assetBalance = assetAcc ? accountBalances[assetAcc.type][assetAcc.name] : 0;


    const formattedDate = date.toISOString().split('T')[0];
    
	return {
	    date: formattedDate,
	    description,
	    transactionAmount: totalAmount,
	    from: fromStr,
	    to: toStr,
	    assetBalance: assetBalance.toFixed(2),
	    total: totalAmount,
	    splitAmounts: splitAmounts,
	    fromBreakdown: fromBreakdown,
	    toBreakdown: toBreakdown
	};

}).filter(Boolean);




// After parsing transactions, but before sorting and displaying them:
const filteredTransactions = transactionRecords.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    // Debug
    console.log(`Transaction date: ${transaction.date}, From: ${yamlData.From}, To: ${yamlData.To}`);
    console.log(`Checking date: ${transactionDate}, dateFrom: ${dateFrom}, dateTo: ${dateTo}`);
    
    if (dateFrom && dateTo) {
        return transactionDate >= dateFrom && transactionDate <= dateTo;
    } else if (dateFrom) {
        return transactionDate >= dateFrom;
    } else if (dateTo) {
        return transactionDate <= dateTo;
    }
    return true;
});

// ---------------------- Sorting and YAML Updates ----------------------

const sortedTransactions = filteredTransactions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortOrder === "Ascending") {
        return dateA - dateB;
    } else if (sortOrder === "Descending") {
        return dateB - dateA;
    } else if (sortOrder === "Highest") {
        return b.transactionAmount - a.transactionAmount;
    } else if (sortOrder === "Lowest") {
        return a.transactionAmount - b.transactionAmount;
    }
    return 0;
});

for (const [type, balances] of Object.entries(accountBalances)) {
    const updatedEntries = Object.entries(balances).map(([name, value]) => `${name}=${value.toFixed(2)}`);
    update(type, updatedEntries);
}

// ---------------------- Rendering Tables ----------------------

// Render Account Balances table (unchanged)
dv.header(2, "Account Balance");
const groupBalances = (balances) => {
    const grouped = {};
    for (const [name, value] of Object.entries(balances)) {
        const segments = name.split(":");
        const topLevel = segments[0];
        if (!grouped[topLevel]) {
            grouped[topLevel] = { total: 0, subcategories: [] };
        }
        grouped[topLevel].total += value;
        if (segments.length > 1) {
            grouped[topLevel].subcategories.push({
                name: segments.slice(1).join(":"),
                value,
            });
        }
    }
    return grouped;
};

const groupedBalances = {};
for (const [type, balances] of Object.entries(accountBalances)) {
    groupedBalances[type] = groupBalances(balances);
}

const balanceTable = [];
for (const [type, balances] of Object.entries(accountBalances)) {
    const accountTypeColor = `${colorMap[type] || "inherit"} !important`;
    const groupedData = groupBalances(balances);
    const groupedRows = Object.entries(groupedData)
        .map(([group, { total, subcategories }]) => {
// Instead of forcing accountTypeColor on the whole group, split the group and color each segment individually.
const coloredGroup = group
  .split(":")
  .map(seg => `<span style="color:${colorMap[seg] || 'inherit'}; font-weight: bold;">${seg}</span>`)
  .join(":");

// For subcategories, do the same for each subaccount:
const subcategoryText = subcategories.length
  ? subcategories
        .map(({ name, value }) => {
            const segments = name.split(":");
            const coloredName = segments
                .map(segment => `<span style="color:${colorMap[segment] || 'inherit'}; font-weight: bold;">${segment}</span>`)
                .join(":");
            // Use individual colors for the amounts:
            let valueColor;
            if (type === "Income") {
              valueColor = "#1abc9c";
            } else if (type === "Expenses") {
              valueColor = "#dc5697";
            } else if (type === "Assets") {
              valueColor = "#abbfe2";
            } else if (type === "Liabilities") {
              valueColor = "#dfc496";
            } else {
              valueColor = value >= 0 ? valueColors.positive[type] : valueColors.negative[type];
            }
            // For Income and Expenses, display as positive:
            const displayVal = (type === "Income" || type === "Expenses") ? Math.abs(value) : value;
            return `${coloredName}: <span style="color:${valueColor}; font-weight: bold;">${formatCurrency(displayVal)}</span>`;
        })
        .join(", ")
  : "";

            let totalColor;
            if (type === 'Income') {
                totalColor = valueColors.positive[type];
            } else if (type === 'Expenses') {
                totalColor = valueColors.negative[type];
            } else {
                totalColor = total >= 0 ? valueColors.positive[type] : valueColors.negative[type];
            }
            totalColor = `${totalColor || "inherit"} !important`;
            return `${coloredGroup}: <span style="color:${totalColor}; font-weight: bold;">${formatCurrency(total, type)}</span>${
                subcategoryText ? ` | ${subcategoryText}` : ""
            }`;
        })
        .join("<br>");
    balanceTable.push([
        `<span style="color:${accountTypeColor}; font-weight: bold;">${type}</span>`,
        groupedRows,
    ]);
}

dv.table(["Account Type", "Balances"], balanceTable);

// ---------------------- Rendering Finances Table with New Formatting ----------------------
dv.header(2, "Finances");
const transactionInput = TransactionInput({ onSubmit: handleNewTransaction });
dv.container.appendChild(transactionInput);

// Helper: Formats an account (e.g. "Expenses:Foods:Groceries:Eggs") along with its amount.
// Each segment is wrapped in its own span with the corresponding color from colorMap.
// For "Expenses" and "Income", the amount is forced to display as a positive value and colored.
function formatAccountWithAmount(account, amount) {
  const segments = account.split(":");
  const formattedName = segments
    .map(seg => `<span style="color: ${colorMap[seg] || 'inherit'}; font-weight: bold;">${seg}</span>`)
    .join(":");
  let amtColor = "inherit";
  
  if (segments[0] === "Expenses") amtColor = "#dc5697";
  else if (segments[0] === "Income") amtColor = "#1abc9c";
  else if (segments[0] === "Assets") amtColor = "#abbfe2";  // 
  else if (segments[0] === "Liabilities") amtColor = "#dfc496";  // 
  
  const displayAmount = (segments[0] === "Expenses" || segments[0] === "Income") ? Math.abs(amount) : amount;
  const formattedAmount = `<span style="color: ${amtColor}; font-weight: bold;">${formatCurrency(displayAmount)}</span>`;
  return `${formattedName} ${formattedAmount}`;
}

// Helper: Formats a list of accounts. If a breakdown array is provided, each line is formatted using formatAccountWithAmount.
// Otherwise, the fallback comma‐separated string is split and each account is formatted by segments.
function formatAccountList(breakdown, fallbackStr) {
  if (breakdown && Array.isArray(breakdown) && breakdown.length > 0) {
    return breakdown
      .map(entry => formatAccountWithAmount(entry.account, entry.amount))
      .join("<br>");
  } else if (fallbackStr) {
    return fallbackStr
      .split(",")
      .map(acct => acct.trim())
      .map(acct =>
        acct
          .split(":")
          .map(seg => `<span style="color: ${colorMap[seg] || 'inherit'}; font-weight: bold;">${seg}</span>`)
          .join(":")
      )
      .join("<br>");
  }
  return "";
}

// Render the Finances table.
// The column order is: Date | Description | From | To | Transaction | Balance.
// The Transaction column colors the amount  if money is leaving an Assets account and green if money is entering an Assets account.
dv.table(
  ["Date", "Description", "From", "To", "Transaction", "Balance"],
  sortedTransactions.map((transaction) => {
    const fromDisplay = formatAccountList(transaction.fromBreakdown, transaction.from);
    const toDisplay   = formatAccountList(transaction.toBreakdown, transaction.to);
    
    // For the Transaction column: if the "from" string includes "Assets", show the amount red;
    // if the "to" string includes "Assets", show it in green.
    let transColor = headingColors.Transaction;
    if (transaction.from && transaction.from.includes("Assets")) {
      transColor = "#dc5697";
    } else if (transaction.to && transaction.to.includes("Assets")) {
      transColor = "#1abc9c";
    }
    const transactionDisplay = `<span style="color: ${transColor}; font-weight: bold;">${formatCurrency(transaction.transactionAmount)}</span>`;
    
    // For the Description column, colorize each segment based on colorMap.
    const descriptionHighlighted = transaction.description
      .split(/(:|,|\||\s+)/)
      .map(segment => {
        const color = colorMap[segment] || "inherit";
        return `<span style="color:${color}; font-weight: bold;">${segment}</span>`;
      })
      .join("");
    
    return [
      `<span style="color: ${headingColors.Date}; font-weight: bold;">${transaction.date || "N/A"}</span>`,
      `<span style="color: ${headingColors.Description}; font-weight: bold;">${descriptionHighlighted || "No Description"}</span>`,
      `<span style="font-weight: bold;">${fromDisplay}</span>`,
      `<span style="font-weight: bold;">${toDisplay}</span>`,
      transactionDisplay,
      `<span style="color: rgb(171,191,226); font-weight: bold;">${formatCurrency(parseFloat(transaction.assetBalance))}</span>`
    ];
  })
);

```
