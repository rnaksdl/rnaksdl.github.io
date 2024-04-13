

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

1. we need to divide input up monthly
2. for each month we need to divide it up by source
3. for each source we need to divide it up by category
4. then calculate sum of each category, sum of each source, sum of each month, 
*/








// get user input
const input = "04/12/2024,Dad,Wants,-25\n04/12/2024,Claire,Wants,-22";

// split input into array of lines separated by new line
const lines = input.split('\n');



for (const line of lines) {
    const [date, source, amount, category] = line.split(',');


}
