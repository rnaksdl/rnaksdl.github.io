var income = 2100.00;
var needs = -2060.11;
var wants = -166.73;
var balance = income + needs + wants;

var data = {
    labels: ["Needs", "Wants"],
    datasets: [{
        data: [Math.abs(needs), Math.abs(wants)],
        backgroundColor: [
            (balance < 0) ? 'rgba(255, 99, 132, 0.5)' : 'rgba(255, 206, 86, 0.5)', // Red if balance is negative, else yellow for needs and wants
            (balance < 0) ? 'rgba(255, 99, 132, 0.5)' : 'rgba(255, 206, 86, 0.5)'
        ],
        borderColor: [
            (balance < 0) ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 206, 86, 1)',
            (balance < 0) ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
    }]
};

var options = {
    responsive: true,
    maintainAspectRatio: false,
    title: {
        display: true,
        text: 'Expenditures and Balance',
        fontSize: 14
    }
};

var ctx = document.getElementById('myPieChart').getContext('2d');

var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
});

// If balance is negative, display balance at the top
if (balance < 0) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Balance: $" + balance.toFixed(2), myPieChart.width / 2, 20);
}
