

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





function calculateTransactions(input) {
	const transactions = input.split('\n');
  
	const result = transactions.reduce((acc, transaction) => {
	  const [date, source, category, amountStr] = transaction.split(',');
	  const amount = parseInt(amountStr);
	  const [month, day, year] = date.split('/');
  
	  acc[year] = acc[year] || {};
	  acc[year][month] = acc[year][month] || {};
	  acc[year][month][source] = acc[year][month][source] || {};
	  acc[year][month][source][category] = (acc[year][month][source][category] || 0) + amount;
  
	  return acc;
	}, {});
  
	const calculatedResult = {};
  
	for (const year in result) {
	  calculatedResult[year] = {};
	  let yearlySum = 0;
  
	  for (const month in result[year]) {
		calculatedResult[year][month] = {};
		let monthlySum = 0;
  
		for (const source in result[year][month]) {
		  calculatedResult[year][month][source] = {};
		  let sourceSum = 0;
  
		  for (const category in result[year][month][source]) {
			const categorySum = result[year][month][source][category];
			calculatedResult[year][month][source][category] = categorySum;
			sourceSum += categorySum;
		  }
  
		  calculatedResult[year][month][source].sum = sourceSum;
		  monthlySum += sourceSum;
		}
  
		calculatedResult[year][month].sum = monthlySum;
		yearlySum += monthlySum;
	  }
  
	  calculatedResult[year].sum = yearlySum;
	}
  
	return calculatedResult;
  }


function display() {
	const result = calculateTransactions(document.querySelector(".transactions").value);
	document.querySelector(".output").innerHTML = result;
}









/*
calculateTransactions("04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22\n04/12/2024,Dad,Income,1000\n04/12/2024,Claire,Needs,-50\n05/01/2024,Dad,Wants,-30\n05/01/2024,Claire,Wants,-40")

'04/12/2024,Dad,Wants,-25 04/12/2024,Claire,Wants,-22 04/12/2024,Dad,Income,1000 04/12/2024,Claire,Needs,-50 05/01/2024,Dad,Wants,-30 05/01/2024,Claire,Wants,-40'
*/