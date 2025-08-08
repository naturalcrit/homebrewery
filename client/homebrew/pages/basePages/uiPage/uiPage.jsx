require('./uiPage.less');
const React = require('react');

import MainNavigationBar from 'client/homebrew/navbar/mainNavigationBar.jsx';

const UIPage = ({className, ...props})=>{

	return <div className={`uiPage sitePage ${className}`}>
		<MainNavigationBar />

		<div className='content'>
			{props.children}
		</div>
	</div>;

};

UIPage.displayName = 'UIPage';

module.exports = UIPage;
