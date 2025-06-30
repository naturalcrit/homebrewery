import './admin.less';
import React, { useEffect, useState } from 'react';
const BrewUtils = require('./brewUtils/brewUtils.jsx');
const NotificationUtils = require('./notificationUtils/notificationUtils.jsx');
import AuthorUtils from './authorUtils/authorUtils.jsx';
import LockTools  from './lockTools/lockTools.jsx';

const tabGroups = ['brew', 'notifications', 'authors', 'locks'];

const Admin = ()=>{
	const [currentTab, setCurrentTab] = useState('');

	useEffect(()=>{
		setCurrentTab(localStorage.getItem('hbAdminTab') || 'brew');
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
				{currentTab === 'authors' && <AuthorUtils />}
        		{currentTab === 'locks' && <LockTools />}
			</main>
		</div>
	);
};

module.exports = Admin;
