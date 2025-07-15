/* eslint-disable camelcase */
import 'core-js/es/string/to-well-formed.js'; //Polyfill for older browsers
import './homebrew.less';
import React from 'react';
import { StaticRouter as Router, Route, Routes, useParams, useSearchParams } from 'react-router';

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage = require('./pages/newPage/newPage.jsx');
const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const VaultPage = require('./pages/vaultPage/vaultPage.jsx');
const AccountPage = require('./pages/accountPage/accountPage.jsx');

const WithRoute = (props)=>{
	const params = useParams();
	const [searchParams] = useSearchParams();
	const queryParams = {};
	for (const [key, value] of searchParams?.entries() || []) {
		queryParams[key] = value;
	}
	const Element = props.el;
	const allProps = {
		...props,
		...params,
		query : queryParams,
		el    : undefined
	};
	return <Element {...allProps} />;
};

const Homebrew = (props)=>{
	const {
		url = '',
		version = '0.0.0',
		account = null,
		enable_v3 = false,
		enable_themes,
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

	global.account = account;
	global.version = version;
	global.enable_v3 = enable_v3;
	global.enable_themes = enable_themes;
	global.config = config;

	return (
		<Router location={url}>
			<div className='homebrew'>
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
