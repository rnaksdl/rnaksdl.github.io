/*
Maybe use piechart
instead?
*/





function parseInput() {
	const input = document.querySelector(".input").value;
	// parse each transaction (new line)
	const transactions = input.split('\n');
	const transactionsBySources = {};
  
	for (const transaction of transactions) {
		// parse each property (comma)
		const [source, category, amountStr] = transaction.split(',');
	
		// amount string to float
		const amount = parseFloat(amountStr);
	
		// create transaction object
		const transactionObj = {
			category,
			amount
		};
	
		if (source in transactionsBySources) {
			// if the source exists, add the transaction to the source's transactions array
			transactionsBySources[source].transactions.push(transactionObj);
		} else {
			// if the source doesn't exist, create a new source object with the transaction
			transactionsBySources[source] = {
				name: source,
				income: 0,
				expenditure_needs: 0,
				expenditure_wants: 0,
				expenditure: 0,
				balance: 0,
				transactions: [transactionObj]
			};
		}
	}

	return transactionsBySources;
}

function calculateTransactions(transactionsBySources) {
	let total_income = 0;
	let total_expenditure = 0;
	let total_balance = 0;
  
	for (const source in transactionsBySources) {
	  const { transactions } = transactionsBySources[source];
  
	  for (const transaction of transactions) {
		if (transaction.category === "income") {
		  transactionsBySources[source].income += transaction.amount;
		} else if (transaction.category === "needs") {
		  transactionsBySources[source].expenditure_needs += transaction.amount;
		} else if (transaction.category === "wants") {
		  transactionsBySources[source].expenditure_wants += transaction.amount;
		}
	  }
  
	  transactionsBySources[source].expenditure = transactionsBySources[source].expenditure_needs + transactionsBySources[source].expenditure_wants;
	  transactionsBySources[source].balance = transactionsBySources[source].income + transactionsBySources[source].expenditure;
	  total_income += transactionsBySources[source].income;
	  total_expenditure += transactionsBySources[source].expenditure;
	  total_balance += transactionsBySources[source].balance;
	}
  
	return {
	  transactionsBySources,
	  total_income,
	  total_expenditure,
	  total_balance
	};
}

function display() {
	const input = document.querySelector(".input").value;
	console.log(input)
	const parsedInput = parseInput(input);
	console.log(parsedInput);
	const { transactionsBySources, total_income, total_expenditure, total_balance } = calculateTransactions(parsedInput);
	
    let output = `
    <h2>Transactions by Source</h2>
    <table>
`;

for (const source in transactionsBySources) {
    const { name, income, expenditure_needs, expenditure_wants, expenditure, balance } = transactionsBySources[source];
    
    output += `
        <tbody>
            <tr>
                <td>Source:</td>
                <td>${name}</td>
            </tr>
            <tr>
                <td>Income:</td>
                <td>${income.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Expenditure<br>(Needs):</td>
                <td>${expenditure_needs.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Expenditure<br>(Wants):</td>
                <td>${expenditure_wants.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Expenditure<br>(Total):</td>
                <td>${expenditure.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Balance:</td>
                <td>${balance.toFixed(2)}</td>
            </tr>
            <tr>
                <td id="empty"></td>
            </tr>
        </tbody>
    `;
}

output += `
    </table>
`;

	
	output += `
		</tbody>
	  </table>
	  <h2>Totals</h2>
	  <table>
		<tr>
		  <th>Total Income</th>
		  <td>${total_income.toFixed(2)}</td>
		</tr>
		<tr>
		  <th>Total Expenditure</th>
		  <td>${total_expenditure.toFixed(2)}</td>
		</tr>
		<tr>
		  <th>Total Balance</th>
		  <td>${total_balance.toFixed(2)}</td>
		</tr>
	  </table>
	`;
	
	document.querySelector(".output").innerHTML = output;
	console.log({ transactionsBySources, total_income, total_expenditure, total_balance });
}