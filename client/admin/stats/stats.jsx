require('./stats.less');
const React = require('react');
const { useState, useEffect, useMemo } = React;
const request = require('superagent');

const Stats = () => {
	const [stats, setStats] = useState(null);
	const [chartData, setChartData] = useState([]);
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

	const fetchChartData = async (category) => {
		setLoading(true);
		setError(null);
		try {
			console.log(`fetching at: /admin/brewsBy${category}`);
			const response = await fetch(`/admin/brewsBy${category}`); // Fetch aggregated data
			const data = await response.json();

			// Prepare the data for the chart
			const labels = data.map((item) => item._id); // Dates
			const counts = data.map((item) => item.count); // Counts

			setChartData((prevData) => {
				return [
					...prevData,
					{
						category: category,
						labels: labels,
						data: counts,
					},
				];
			});
		} catch (error) {
			console.error('Failed to fetch chart data:', error);
			setError('Failed to fetch chart data.');
		} finally {
			setLoading(false);
		}
	};

	const chartRange = (values, rangeType) => {
		let min = Infinity,
			max = -Infinity;

		// Efficiently find min and max
		for (let val of values) {
			if (val < min) min = val;
			if (val > max) max = val;
		}

		let rangeSize = 20; // Max desired range size
		let step = Math.ceil((max - min) / rangeSize) || 1; // Ensure step is at least 1

		let result = [];

		if (rangeType === '0 to max') {
			for (let i = 0; i <= max; i += step) result.push(i);
		} else if (rangeType === 'min to max') {
			let start = Math.ceil(min / step) * step; // Align to step
			for (let i = start; i <= max; i += step) result.push(i);
		}

		return result;
	};

	console.log(stats, chartData);

	const renderTable = () => {
		if (!stats)
			return (
				<button
					onClick={() => {
						fetchStats();
					}}>
					Fetch Stats
				</button>
			);

		return (
			<>
				<div className="heading">
					<h4>Total of Brews: {stats.totalBrews}</h4>
					<button
						onClick={() => {
							fetchStats();
						}}>
						Refetch Stats
					</button>
				</div>
				<table>
					<thead>
						<tr>
							<th></th>
							<th>Number of Brews</th>
							<th>% of Total</th>
						</tr>
					</thead>
					<tbody>
						{stats.totalPublished !== 0 && (
							<tr>
								<td>Total published</td>
								<td>{stats.totalPublished}</td>
								<td>{Math.round((stats.totalPublished / stats.totalBrews) * 100)}%</td>
							</tr>
						)}
						{stats.totalUnauthored !== 0 && (
							<tr>
								<td>Total without author</td>
								<td>{stats.totalUnauthored}</td>
								<td>{Math.round((stats.totalUnauthored / stats.totalBrews) * 100)}%</td>
							</tr>
						)}
						{stats.totalGoogle !== 0 && (
							<tr>
								<td>Total in Google storage</td>
								<td>{stats.totalGoogle}</td>
								<td>{Math.round((stats.totalGoogle / stats.totalBrews) * 100)}%</td>
							</tr>
						)}
						{stats.totalLegacy !== 0 && (
							<tr>
								<td>Total in Legacy renderer</td>
								<td>{stats.totalLegacy}</td>
								<td>{Math.round((stats.totalLegacy / stats.totalBrews) * 100)}%</td>
							</tr>
						)}
						{stats.totalThumbnail !== 0 && (
							<tr>
								<td>Total with thumbnail</td>
								<td>{stats.totalThumbnail}</td>
								<td>{Math.round((stats.totalThumbnail / stats.totalBrews) * 100)}%</td>
							</tr>
						)}
					</tbody>
				</table>
			</>
		);
	};

	const renderChart = (category) => {
		const dataset = chartData?.find((item) => item.category === category);

		if (!chartData || chartData.length === 0 || !dataset) {
			return (
				<button
					className={`fetch${category}`}
					onClick={() => {
						fetchChartData(category);
					}}>
					Fetch Chart Brews per {category}
				</button>
			);
		}
		return (
			<>
				<div className="heading">
					<h4>Brews per {category}</h4>
					<button
						className={`fetch${category}`}
						onClick={() => {
							fetchChartData(category);
						}}>
						Refetch Chart Data
					</button>
				</div>
				<div className="chart">
					<div className="leftAxis">
						<div className="axisLabel">Brews</div>
						{
							// Map chartRange as spans, setting their bottom position as percentage of bottom
							chartRange(dataset.data, '0 to max')?.map((value, index) => (
								<span
									key={index}
									style={{
										bottom: `${(value / Math.max(...dataset.data)) * 100}%`,
									}}>
									{value}
								</span>
							))
						}
					</div>
					<div className="data">
						{dataset.data.map((value, index) => (
							<div
								key={index}
								className="column"
								title={`${value} brews of ${dataset.labels[index]}`}
								style={{
									left: `${(index / dataset.labels.length) * 100}%`,
									top: `${100 - (value / Math.max(...dataset.data)) * 100}%`,
									bottom: '0',
									width: `${100 / dataset.labels.length - 0.3}%`,
								}}></div>
						))}
					</div>
					<div className="bottomAxis">
						{
							// Render the labels on the bottom axis
							dataset.labels.map((label, index) => (
								<span
									key={index}
									className="bottomLabel"
									style={{
										left: `${(index / dataset.labels.length) * 100}%`,
									}}>
									{label}
								</span>
							))
						}
						<div className="axisLabel">{category}</div>
					</div>
				</div>
			</>
		);
	};

	return (
		<section className="stats">
			<h2>Stats</h2>

			{loading && <p>Loading...</p>}
			{error && <p className="error">{error}</p>}

			<div className="content">
				<div className="table">{renderTable()}</div>
				<div className="graph Date">{renderChart('Date')}</div>
				<div className={`graph Lang`}>{renderChart('Lang')}</div>
				<div className="graph pageCount">{renderChart('PageCount')}</div>
				<div className="graph version">{renderChart('Version')}</div>
			</div>
		</section>
	);
};

module.exports = Stats;
