import React, { useState } from 'react';
import request from 'superagent';
import Moment from 'moment';

const BrewCleanup = ({})=>{
	const [count, setCount] = useState(0);
	const [brewCollection, setBrewCollection] = useState([]);
	const [pending, setPending] = useState(false);
	const [primed, setPrimed] = useState(false);
	const [error, setError] = useState(null);

	const prime = async ()=>{
		setPending(true);

		try {
			const res = await request.get('/admin/cleanup');

			setCount(res.body.count);
			setBrewCollection(res.body.brewCollection);
			setPrimed(true);
		} catch (err) {
			setError(err);
		} finally {
			setPending(false);
		}
	};

	const cleanup = async ()=>{
		setPending(true);

		try {
			const res = await request.post('/admin/cleanup');

			setCount(res.body.count);
		} catch (err) {
			setError(err);
		} finally {
			setPending(false);
			setPrimed(false);
		}
	};
	const renderBrewList = ()=>{
		if(!brewCollection) {
			console.log(brewCollection)
			return null;
		}
		
		return <>
			<h2>{`Results - ${brewCollection.length} brews` }</h2>
			<table className='resultsTable'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Share</th>
						<th>Last Update</th>
						<th>Created</th>
						<th>Storage</th>
					</tr>
				</thead>
				<tbody>
					{brewCollection
						.sort((a, b)=>{         // Sort brews from most recently updated
							if(a.updatedAt > b.updatedAt) return -1;
							return 1;
						})
						.map((brew, idx)=>{
							return <tr key={idx}>
								<td><strong>{brew.title || 'No Title'}</strong></td>
								<td><a href={`/share/${brew.shareId}`}>{brew.shareId}</a></td>
								<td style={{ width: '200px' }}>{Moment(brew.updatedAt).fromNow()}</td>
								<td>{brew.createdAt ? Moment(brew.createdAt).fromNow() : 'No creation date'}</td>
								<td>{brew.googleId ? 'Google' : 'Homebrewery'}</td>
							</tr>;
						})}
				</tbody>
			</table>
		</>;
	};
	const renderPrimed = ()=>{
		if(!primed) return;

		if(!count) return <div className='result noBrews'>No Matching Brews found.</div>;

		return <div className='result'>
			<button onClick={()=>cleanup()} className='remove'>
				{pending
					? <i className='fas fa-spin fa-spinner' />
					: <span><i className='fas fa-times' /> Remove</span>
				}
			</button>
			<span>Found {count} Brews that could be removed. </span>
			{renderBrewList()}
		</div>;
	};

	return <div className='brewUtil brewCleanup'>
		<h2> Brew Cleanup </h2>
		<p>Removes very short brews to tidy up the database</p>

		<button onClick={()=>prime()} className='query'>
			{pending
				? <i className='fas fa-spin fa-spinner' />
				: 'Query Brews'
			}
		</button>
		{renderPrimed()}

		{error && <div className='error noBrews'>{error.toString()}</div>}
	</div>;

};

export default BrewCleanup;
