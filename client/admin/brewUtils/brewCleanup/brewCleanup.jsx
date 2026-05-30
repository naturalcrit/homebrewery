import React, { useState } from 'react';
import request from 'superagent';

const BrewCleanup = ({})=>{
	const [count, setCount] = useState(0);
	const [pending, setPending] = useState(false);
	const [primed, setPrimed] = useState(false);
	const [error, setError] = useState(null);

	const prime = async ()=>{
		setPending(true);

		try {
			const res = await request.get('/admin/cleanup');

			setCount(res.body.count);
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
