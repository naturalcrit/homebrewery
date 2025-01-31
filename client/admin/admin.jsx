import './admin.less';
import React, { useEffect, useState } from 'react';
const BrewUtils = require('./brewUtils/brewUtils.jsx');
const NotificationUtils = require('./notificationUtils/notificationUtils.jsx');

const tabGroups = ['brew', 'notifications'];

const Admin = ()=>{
	const [currentTab, setCurrentTab] = useState('brew');

	useEffect(()=>{
		setCurrentTab(localStorage.getItem('hbAdminTab'));
	}, []);

	useEffect(()=>{
		localStorage.setItem('hbAdminTab', currentTab);
	}, [currentTab]);

	return (
		<div className='admin'>
			<header>
				<div className='container'>
					<i className='fas fa-rocket' />
					The Homebrewery Admin Page
					<a href='/'>back to homepage</a>
				</div>

			</header>
			<main className='container'>
				<nav className='tabs'>
					{tabGroups.map((tab, idx)=>(
						<button
							className={tab === currentTab ? 'active' : ''}
							key={idx}
							onClick={()=>setCurrentTab(tab)}>
							{tab.toUpperCase()}
						</button>
					))}
				</nav>
				{currentTab === 'brew' && <BrewUtils />}
				{currentTab === 'notifications' && <NotificationUtils />}
			</main>
		</div>
	);
};

module.exports = Admin;
