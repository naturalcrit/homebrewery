/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/

require('./stats.less');
const React = require('react');
const { useState, useEffect } = React;
const request = require('superagent');

/*
I tried bringing multiple react charting libraries,
but was unable to make them work without tons of errors.
It was way easier to build my own charts, also learned a lot in the process,
took me an afternoon (plus minute issue fixing).
*/

const Stats = ()=>{
	const [stats, setStats] = useState(null);
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState([]);
	const [error, setError] = useState(null);
	const [missingData, setMissingData] = useState([]);

	// Fetching is manual, to relieve the server of pressure
	const fetchStat = async (stat)=>{
		setLoading((prevData)=>[...prevData, stat]);
		setError(null);
		try {
			const res = await request.get(`/admin/stats?stat=${stat}`);
			setStats((prevData)=>{
				const updatedStats = prevData ? [...prevData] : [];
				const index = updatedStats.findIndex((item)=>item[stat] !== undefined);

				if(index >= 0) {
					updatedStats[index] = { [stat]: res.body };
				} else {
					updatedStats.push({ [stat]: res.body });
				}

				return updatedStats;
			});
		} catch (error) {
			console.error(error);
			setError('Failed to fetch stats.');
		} finally {
			setLoading((prevData)=>prevData.filter((item)=>item !== stat));
		}
	};

	useEffect(()=>{
		fetchStat('totalBrews');
	}, []);

	const renderTable = ()=>{
		const rows = [
			{ label: 'Total brews', query: 'totalBrews' },
			{ label: 'Total published', query: 'totalPublished' },
			{ label: 'Total without author', query: 'totalUnauthored' },
			{ label: 'Total in Google storage', query: 'totalInGoogle' },
			{ label: 'Total with thumbnail', query: 'totalThumbnail' },
		];

		const getValue = (query)=>{
			const statObj = stats?.find((item)=>item[query] !== undefined);
			return statObj ? statObj[query] : null;
		};

		const doesDataExist = (query)=>{
			return getValue(query) !== null;
		};

		return (
			<div>
				<table>
					<thead>
						<tr>
							<th></th>
							<th>Number of Brews</th>
							<th>% of Total</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index)=>(
							<tr key={index}>
								<td>{row.label}</td>
								<td colSpan={doesDataExist(row.query) ? 1 : 2}>
									{doesDataExist(row.query) ? (
										getValue(row.query)
									) : (
										<button
											onClick={()=>fetchStat(row.query)}
											disabled={loading.includes(row.query)}>
											{loading.includes(row.query) ? (
												<i className='fas fa-spin fa-spinner'></i>
											) : (
												'Fetch'
											)}
										</button>
									)}
								</td>
								{doesDataExist(row.query) && (
									<td>{Math.round((getValue(row.query) / getValue('totalBrews')) * 100)}%</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	const fetchChartData = async (category)=>{
		setLoading((prevData)=>[...prevData, category]);
		setError(null);
		try {
			console.log(`fetching at: /admin/brewsBy${category}`);
			const response = await fetch(`/admin/brewsBy${category}`);
			const data = await response.json();

			// Prepare the data for the chart
			const labels = data.map((item)=>item._id);
			const counts = data.map((item)=>item.count);

			setChartData((prevData)=>{
				const existingCategoryIndex = prevData.findIndex((item)=>item.category === category);

				if(existingCategoryIndex !== -1) {
					// Replace the existing category data
					prevData[existingCategoryIndex] = { category, labels, data: counts };
				} else {
					// Add the new category data
					prevData.push({ category, labels, data: counts });
				}

				return [...prevData];
			});
		} catch (error) {
			console.error('Failed to fetch chart data:', error);
			setError('Failed to fetch chart data.');
		} finally {
			setMissingData((prevData)=>prevData.filter((item)=>item !== category));
			setLoading((prevData)=>prevData.filter((item)=>item !== category));
		}
	};

	const chartRange = (values, rangeType)=>{
		//this function might not be appropiate, since charts might have text or data as labels,
		//and different data should be displayed differently
		let min = Infinity,
			max = -Infinity;
		for (const val of values) {
			if(val < min) min = val;
			if(val > max) max = val;
		}

		const rangeSize = 20;
		const rangeBuffer = (max - min) * 0.05; // 5% buffer to ensure all values fit
		const adjustedMax = max + rangeBuffer;

		const stepRaw = Math.ceil((adjustedMax - min) / rangeSize) || 1;
		const magnitude = Math.pow(10, Math.floor(Math.log10(stepRaw)));
		const step =
			[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].find(
				(x)=>x * magnitude >= stepRaw
			) * magnitude;

		const result = [];

		if(rangeType === '0 to max') {
			for (let i = 0; i <= adjustedMax; i += step) result.push(i);
		} else if(rangeType === 'min to max') {
			const start = Math.ceil(min / step) * step;
			for (let i = start; i <= adjustedMax; i += step) result.push(i);
		}

		return result;
	};

	const renderChart = (category)=>{
		const dataset = chartData?.find((item)=>item.category === category);
		const isLoading = loading.includes(category);

		if(!chartData || chartData.length === 0 || !dataset) {
			return (
				<>
					<div className='heading'>
						<h4>Brews per {category}</h4>
					</div>
					<div className='chart'>
						<div className='leftAxis'>
							<div className='axisLabel'>Brews</div>
						</div>
						<div className='data'>
							<button
								className={`fetch${category}`}
								onClick={()=>{
									!isLoading && fetchChartData(category);
								}}>
								{!isLoading ? (
									`Fetch Chart Brews per ${category}`
								) : (
									<i className='fas fa-spin fa-spinner'></i>
								)}
							</button>
						</div>

						<div className='bottomAxis'>
							<div className='axisLabel'>{category}</div>
						</div>
					</div>
				</>
			);
		}
		const maxY = Math.max(...dataset.data) * 1.05;
		return (
			<>
				<div className='heading'>
					<h4>Brews per {category}</h4>
					{missingData.includes(category) && (
						<span>
							You have removed data from the table, in order to see the full table, refetch the data.
						</span>
					)}
					<button
						className={`fetch${category}`}
						onClick={()=>{
							fetchChartData(category);
						}}>
						{!isLoading ? `Refetch chart data` : <i className='fas fa-spin fa-spinner'></i>}
					</button>
				</div>
				<div className='chart'>
					<div className='leftAxis'>
						<div className='axisLabel'>Brews</div>
						{
							// Map chartRange as spans, setting their bottom position as percentage of bottom
							chartRange(dataset.data, '0 to max')?.map((value, index)=>(
								<span
									key={index}
									style={{
										bottom : `${(value / maxY) * 100}%`,
									}}>
									{value}
								</span>
							))
						}
					</div>
					<div className='data'>
						{dataset.data.map((value, index)=>(
							<div
								key={index}
								onClick={()=>{
									// Remove the clicked column's data from chartData state
									setChartData((prevData)=>prevData.map((item)=>item.category === dataset.category
										? {
											...item,
											data   : item.data.filter((_, i)=>i !== index),
											labels : item.labels.filter((_, i)=>i !== index),
												  }
										: item
									)
									);
									//add to missingData state array the category
									setMissingData((prevData)=>[...prevData, dataset.category]);
								}}
								className='column'
								data-title={`${value} brews of ${dataset.labels[index]}`}
								style={{
									left   : `${(index / dataset.labels.length) * 100}%`,
									top    : `${100 - (value / maxY) * 100}%`,
									bottom : '0',
									width  : `${100 / dataset.labels.length - 0.3}%`,
								}}></div>
						))}
					</div>

					<div className='bottomAxis'>
						{
							// Render the labels on the bottom axis
							dataset.labels.map((label, index)=>(
								<span
									key={index}
									className='bottomLabel'
									style={{
										left : `${(index / dataset.labels.length) * 100}%`,
									}}>
									{(label ?? '') === '' ? 'null' : label}
								</span>
							))
						}
						<div className='axisLabel'>{category}</div>
					</div>
				</div>
			</>
		);
	};

	return (
		<section className='stats'>
			<h2>Stats</h2>
			{error && <p className='error'>{error}</p>}

			<div className='content'>
				<div className='table'>{renderTable()}</div>
				<div className='graph Date'>{renderChart('Date')}</div>
				<div className={`graph Lang`}>{renderChart('Lang')}</div>
				<div className='graph pageCount'>{renderChart('PageCount')}</div>
				<div className='graph version'>{renderChart('Version')}</div>
				{//<div className='graph missing'>{renderChart('MissingField')}</div>
				}
				<div className='graph Updated-Created'>{renderChart('Updated-Created')}</div>
				<div className='graph Views'>{renderChart('Views')}</div>
				<div className='graph Systems'>{renderChart('Systems')}</div>
				<div className='div graph PageVsVersion'>{renderChart('PageVsVersion')}</div>
			</div>
		</section>
	);
};

module.exports = Stats;
