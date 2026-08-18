import React, { useState } from 'react';
import request from 'superagent';
import Moment from 'moment';

const BrewCleanup = ({})=>{
	const [junkBrewCollection, setJunkBrewCollection] = useState([]);
	const [lostBrewCollection, setLostBrewCollection] = useState([]);
	const [pendingJunk, setPendingJunk] = useState(false);
	const [pendingLost, setPendingLost] = useState(false);
	const [error, setError] = useState(null);

	const find = async (type)=>{
		

		if(type === 'junk') try {
			setPendingJunk(true);
			const res = await request.get('/admin/cleanupJunk');

			setJunkBrewCollection(res.body.brewCollection);
		} catch (err) {
			setError(err);
		} finally {
			setPendingJunk(false);
		}

		if(type === 'lost') try {
			setPendingLost(true);
			const res = await request.get('/admin/cleanupLost');

			setLostBrewCollection(res.body.brewCollection);
		} catch (err) {
			setError(err);
		} finally {
			setPendingLost(false);
		}
	};

	const cleanup = async (type)=>{

		if(type === 'junk') try {
			setPendingJunk(true);
			console.log('deleting junk');
			const res = await request.post('/admin/cleanupJunk');

		} catch (err) {
			setError(err);
		} finally {
			setPendingJunk(false);
			setJunkBrewCollection([]);
		}

		if(type === 'lost') try {
			setPendingLost(true);
			const res = await request.post('/admin/cleanupLost');

		} catch (err) {
			setError(err);
		} finally {
			setPendingLost(false);
			setLostBrewCollection([]);
		}
	};

	const renderBrewList = (type)=>{
		const brewList = type === 'lost' ? lostBrewCollection : junkBrewCollection;

		if(!brewList || brewList.length === 0) {
			return <>
				<h3>{`Results - No brews found` }</h3>
				<table className='resultsTable'>
					<thead>
						<tr>
							<th>Title</th>
							<th>Last Update</th>
							<th>last viewed</th>
							<th>Storage</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={4}><strong>"No brews found"</strong></td>
						</tr>
					</tbody>
				</table>
			</>;
		}
		console.log(type);
		console.log(brewList);
		return <>
			<h3>{`Results - ${brewList.length} brews` }</h3>
			<table className='resultsTable'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Last Update</th>
						<th>last viewed</th>
						<th>Storage</th>
					</tr>
				</thead>
				<tbody>
					{brewList
						.sort((a, b)=>{         // Sort brews from most recently updated
							if(a.lastViewed > b.lastViewed) return -1;
							return 1;
						})
						.map((brew, idx)=>{
							return <tr key={idx}>
								<td><strong>{brew.title || 'No Title'}</strong></td>
								<td style={{ width: '200px' }}>{Moment(brew.updatedAt).fromNow()}</td>
								<td>{brew.lastViewed ? Moment(brew.lastViewed).fromNow() : 'No last viewed date'}</td>
								<td>{brew.googleId ? 'Google' : 'Homebrewery'}</td>
							</tr>
						})}
				</tbody>
			</table>
		</>;
	};
	const renderFound = (type)=>{
		const deleteButton = !(type === 'junk' && junkBrewCollection.length === 0 || type === 'lost' && lostBrewCollection.length === 0); 

		return <div className='result'>
			{deleteButton && <button onClick={()=>cleanup(type)} className='remove'>
				{pendingLost && type === "lost" || pendingJunk && type === "junk"
					? <i className='fas fa-spin fa-spinner' />
					: <span><i className='fas fa-times' /> Remove</span>
				}
			</button>
			}
			{renderBrewList(type)}
		</div>;
	};
	const renderJunkBrewCleanup = ()=>{
		return <div className='junk'>
			<h3> Junk brews</h3>
			<p>Queries unauthored brews that have not been viewed or <br/>updated in 30 days and are shorter than 140 bytes (up to 300)</p>

			<button onClick={()=>find('junk')} className='query'>
				{pendingJunk
					? <i className='fas fa-spin fa-spinner' />
					: 'Query Brews'
				}
			</button>
			{renderFound('junk')}

			{error && <div className='error noBrews'>{error.toString()}</div>}
		</div>;
	};
	const renderLostBrewCleanup = ()=>{
		return <div className='lost'>
			<h3> Lost brews</h3>
			<p>Queries unauthored brews that have not been <br/>updated or viewed for 2 years (up to 500)</p>

			<button onClick={()=>find('lost')} className='query'>
				{pendingLost
					? <i className='fas fa-spin fa-spinner' />
					: 'Query Brews'
				}
			</button>
			{renderFound('lost')}

			{error && <div className='error noBrews'>{error.toString()}</div>}
		</div>;
	};

	return <div className='brewUtil brewCleanup'>
		<h2> Brew Cleanup </h2>
		{renderJunkBrewCleanup()}
		<br/>
		<br/>
		{renderLostBrewCleanup()}

	</div>;

};

export default BrewCleanup;
