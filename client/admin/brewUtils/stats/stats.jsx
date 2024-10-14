require('./stats.less');
const React = require('react');
const { useState, useEffect } = React;
const request = require('superagent');

const Stats = () => {
	const [stats, setStats] = useState(null);
	const [chartData, setChartData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch statistics and chart data
	const fetchStats = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await request.get('/admin/stats');
			setStats(res.body);
		} catch (error) {
			console.error(error);
			setError('Failed to fetch stats.');
		} finally {
			setLoading(false);
		}
	};

	const fetchChartData = async () => {
		try {
			const response = await fetch('/admin/byDate'); // Fetch aggregated data
			const data = await response.json();

			// Prepare the data for the chart
			const labels = data.map((item) => item._id); // Dates
			const counts = data.map((item) => item.count); // Counts

			setChartData({
				labels: labels,
				datasets: [
					{
						label: 'Documents Created Over Time',
						data: counts,
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
					},
				],
			});
			console.log(counts);
		} catch (error) {
			console.error('Failed to fetch chart data:', error);
			setError('Failed to fetch chart data.');
		}
	};

	const chartRange = (values, rangeType) => {
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min;

		if (rangeType === '0 to max') {
			// Return an array of divisions from 0 to max
			return Array.from({ length: max + 1 }, (_, i) => i);
		} else if (rangeType === 'min to max') {
			// Return an array of divisions from min to max
			return Array.from({ length: range + 1 }, (_, i) => min + i);
		}
	};

	const renderTable = () => {
		if (!stats) return null;

		return (
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Number of Brews</th>
						<th>% of Total</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Total Published</td>
						<td>{stats.totalPublished}</td>
						<td>
							{Math.round(
								(stats.totalPublished / stats.totalBrews) * 100
							)}
							%
						</td>
					</tr>
					<tr>
						<td>Total Without Author</td>
						<td>{stats.totalUnauthored}</td>
						<td>
							{Math.round(
								(stats.totalUnauthored / stats.totalBrews) * 100
							)}
							%
						</td>
					</tr>
				</tbody>
			</table>
		);
	};

	const renderChart = () => {
		if (!stats) return null;

		return (
			<div className="chart">
				<div className="leftAxis">
					<div className="axisLabel">Brews</div>
					{
						// Map chartRange as spans, setting their bottom position as percentage of bottom
						chartRange(
							chartData?.datasets[0]?.data || [],
							'0 to max'
						)?.map((value, index) => (
							<span
								key={index}
								style={{
									bottom: `${
										(value /
											Math.max(
												...chartData.datasets[0].data
											)) *
										100
									}%`,
								}}
							>
								{value}
							</span>
						))
					}
				</div>
				<div className="data">
				{console.log((100 / chartData?.labels.length))}
					{
						chartData?.datasets[0]?.data.map((value, index) => (
							<div
								key={index}
								className="column"
								title={value}
								style={{
									left: `${
										(index /
											(chartData.labels.length)) *
										100
									}%`,
									top: `${
										100 - ((value /
											Math.max(
												...chartData.datasets[0].data
											)) *
										100)
									}%`,
									bottom: '0',
									width: `${(100 / chartData?.labels.length) -0.1}%`
								}}
							>
							</div>
						))
					}
				</div>
				<div className="bottomAxis">
					{
						// Render the labels on the bottom axis
						chartData?.labels.map((label, index) => (
							<span
								key={index}
								className="bottomLabel"
								style={{
									left: `${
										(index /
											(chartData.labels.length)) *
										100
									}%`,
								}}
							>
								{label}
							</span>
						))
					}
				</div>
			</div>
		);
	};

	return (
		<div className="stats">
			<h2>Stats</h2>
			<button
				onClick={() => {
					fetchStats();
					fetchChartData();
				}}
			>
				Fetch Stats
			</button>
			{loading && <p>Loading...</p>}
			{error && <p className="error">{error}</p>}
			{stats && (
				<div className="content">
					<div>
						<span>Total of Brews: {stats.totalBrews}</span>
						{renderTable()}
					</div>
					<div>
						<span>Brews per date</span>
						{renderChart()}
					</div>
				</div>
			)}
		</div>
	);
};

module.exports = Stats;
