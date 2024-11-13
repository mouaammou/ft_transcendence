// DoughnutChart.js
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required elements
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
	// Sample data for wins, losses, and draws
	const data = {
		labels: ['Wins', 'Losses', 'Draws'],
		datasets: [
			{
			label: 'User Stats',
			data: [20, 10, 5], // Example values: Wins, Losses, Draws
			backgroundColor: ['#0ea5e9', '#d89721', '#ef4444'], // Colors for each section
			borderWidth: 1,
			},
		],
	};

	// Options for customizing the Doughnut chart
	const options = {
		responsive: true,
		plugins: {
			legend: {
			position: 'top',
			},
		},
	};

	return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;
