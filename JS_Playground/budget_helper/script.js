

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






function display() {
	const result = document.querySelector(".transactions").value;

	document.querySelector(".output").innerHTML = result;
}









/*
calculateTransactions("04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22\n04/12/2024,Dad,Income,1000\n04/12/2024,Claire,Needs,-50\n05/01/2024,Dad,Wants,-30\n05/01/2024,Claire,Wants,-40")

'04/12/2024,Dad,Wants,-25 04/12/2024,Claire,Wants,-22 04/12/2024,Dad,Income,1000 04/12/2024,Claire,Needs,-50 05/01/2024,Dad,Wants,-30 05/01/2024,Claire,Wants,-40'
*/