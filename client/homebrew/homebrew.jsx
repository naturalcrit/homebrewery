/* eslint-disable camelcase */
import 'core-js/es/string/to-well-formed.js'; //Polyfill for older browsers
import './homebrew.less';
import React from 'react';
import { StaticRouter as Router, Route, Routes, useParams, useSearchParams } from 'react-router';

import { updateLocalStorage } from './utils/updateLocalStorage/updateLocalStorageKeys.js';

import HomePage    from './pages/homePage/homePage.jsx';
import EditPage    from './pages/editPage/editPage.jsx';
import UserPage    from './pages/userPage/userPage.jsx';
import SharePage   from './pages/sharePage/sharePage.jsx';
import NewPage     from './pages/newPage/newPage.jsx';
import ErrorPage   from './pages/errorPage/errorPage.jsx';
import VaultPage   from './pages/vaultPage/vaultPage.jsx';
import AccountPage from './pages/accountPage/accountPage.jsx';

const WithRoute = ({ el: Element, ...rest })=>{
	const params = useParams();
	const [searchParams] = useSearchParams();
	const queryParams = Object.fromEntries(searchParams?.entries() || []);
	return <Element {...rest} {...params} query={queryParams} />;
};

const Homebrew = (props)=>{
	const {
		url = '',
		version = '0.0.0',
		account = null,
		config,
		brew = {
			title     : '',
			text      : '',
			shareId   : null,
			editId    : null,
			createdAt : null,
			updatedAt : null,
			lang      : ''
		},
		userThemes,
		brews
	} = props;

	global.account       = account;
	global.version       = version;
	global.config        = config;

	const backgroundObject = ()=>{
		if(global.config.deployment || (config.local && config.development)){
  			const bgText = global.config.deployment || 'Local';
  			return {
    			backgroundImage : `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='100px' width='200px'><text x='0' y='15' fill='%23fff7' font-size='20'>${bgText}</text></svg>")`
  			};
		}
		return null;
	};
	updateLocalStorage();

	return (
		<Router location={url}>
			<div className={`homebrew${(config.deployment || config.local) ? ' deployment' : ''}`} style={backgroundObject()}>
				<Routes>
					<Route path='/edit/:id' element={<WithRoute el={EditPage} brew={brew} userThemes={userThemes}/>} />
					<Route path='/share/:id' element={<WithRoute el={SharePage} brew={brew} />} />
					<Route path='/new/:id' element={<WithRoute el={NewPage} brew={brew} userThemes={userThemes}/>} />
					<Route path='/new' element={<WithRoute el={NewPage} userThemes={userThemes}/> } />
					<Route path='/user/:username' element={<WithRoute el={UserPage} brews={brews} />} />
					<Route path='/vault' element={<WithRoute el={VaultPage}/>}/>
					<Route path='/changelog' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/faq' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/migrate' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/account' element={<WithRoute el={AccountPage} brew={brew} accountDetails={brew.accountDetails} />} />
					<Route path='/legacy' element={<WithRoute el={HomePage} brew={brew} />} />
					<Route path='/error' element={<WithRoute el={ErrorPage} brew={brew} />} />
					<Route path='/' element={<WithRoute el={HomePage} brew={brew} />} />
					<Route path='/*' element={<WithRoute el={HomePage} brew={brew} />} />
				</Routes>
			</div>
		</Router>
	);
};

module.exports = Homebrew;