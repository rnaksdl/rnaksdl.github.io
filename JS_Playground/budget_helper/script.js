

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
	
		// amount string to int
		const amount = parseInt(amountStr);
	
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
			transactions: [transactionObj]
			};
		}

	
	}
  
	return transactionsBySources;
}



// function calculateTransactions(transactions) {
// 	let income_each_source = 0
// 	let total_income = 0
// 	let expenditure_

// 	for (const transaction of transactions) {

// 	}
// }





function display() {
	const input = document.querySelector(".input").value;
	const result = parseInput(input)
	document.querySelector(".output").innerHTML = result;
	console.log(result)
}









/*
calculateTransactions("04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22\n04/12/2024,Dad,Income,1000\n04/12/2024,Claire,Needs,-50\n05/01/2024,Dad,Wants,-30\n05/01/2024,Claire,Wants,-40")

'04/12/2024,Dad,Wants,-25 04/12/2024,Claire,Wants,-22 04/12/2024,Dad,Income,1000 04/12/2024,Claire,Needs,-50 05/01/2024,Dad,Wants,-30 05/01/2024,Claire,Wants,-40'
*/