

/*
transaction
	date
		"04/12/2024"
	source
		“Dad”
		“Claire”
	category
		“Income”
		“Needs”
		“Wants”
	amount
		+ for income
		- for spending


04/12/2024,Dad,Wants,-25
04/12/2024,Claire,Wants,-22

04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22


I thought about how to approach this.
I think I'll just have user copy and paste the whole data into the input
then parse the string
NOT making objects
BUT just calculating info on the spot as we are parsing through the data.

0. we need to divide input up yearly
1. for each year, divide it up monthly
2. for each month, divide it up by source
3. for each source, divide it up by category
4. then calculate these
	total income of each sources monthy
	total combined income monthy
	total expenditure of Needs monthy
	total expenditure of Wants monthy
	total expenditure of each sources monthy
	total combined expenditure
	total balance left on each source (income - expenditure)
	total combined balanced

*/

function parseInput() {
	const input = document.querySelector(".input").value;
	// parse each transaction (new line)
	const transactions = input.split('\n');
	const transactionsBySources = {};
  
	for (const transaction of transactions) {
		// parse each property (comma)
		const [date, source, category, amountStr] = transaction.split(',');
	
		// parse date (forward slash)
		const [month, day, year] = date.split('/');
	
		// amount string to float
		const amount = parseFloat(amountStr);
	
		// create transaction object
		const transactionObj = {
			date: {
			month: parseInt(month),
			day: parseInt(day),
			year: parseInt(year)
			},
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
		if (transaction.category === "Income") {
		  transactionsBySources[source].income += transaction.amount;
		} else if (transaction.category === "Needs") {
		  transactionsBySources[source].expenditure_needs += transaction.amount;
		} else if (transaction.category === "Wants") {
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
	const parsedInput = parseInput(input);
	console.log(parsedInput);
	const { transactionsBySources, total_income, total_expenditure, total_balance } = calculateTransactions(parsedInput);
	
	let output = `
	  <h2>Transactions by Source</h2>
	  <table>
		<thead>
		  <tr>
			<th>Source</th>
			<th>Income</th>
			<th>Expenditure (Needs)</th>
			<th>Expenditure (Wants)</th>
			<th>Total Expenditure</th>
			<th>Balance</th>
		  </tr>
		</thead>
		<tbody>
	`;
	
	for (const source in transactionsBySources) {
	  const { name, income, expenditure_needs, expenditure_wants, expenditure, balance } = transactionsBySources[source];
	  output += `
		<tr>
		  <td>${name}</td>
		  <td>${income.toFixed(2)}</td>
		  <td>${expenditure_needs.toFixed(2)}</td>
		  <td>${expenditure_wants.toFixed(2)}</td>
		  <td>${expenditure.toFixed(2)}</td>
		  <td>${balance.toFixed(2)}</td>
		</tr>
	  `;
	}
	
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









/*
calculateTransactions("04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22\n04/12/2024,Dad,Income,1000\n04/12/2024,Claire,Needs,-50\n05/01/2024,Dad,Wants,-30\n05/01/2024,Claire,Wants,-40")

'04/12/2024,Dad,Wants,-25 04/12/2024,Claire,Wants,-22 04/12/2024,Dad,Income,1000 04/12/2024,Claire,Needs,-50 05/01/2024,Dad,Wants,-30 05/01/2024,Claire,Wants,-40'
*/