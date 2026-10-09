import './uiPage.less';
import React from 'react';
import createReactClass from 'create-react-class';
import Navbar from '../../../navbar/navbar.jsx';

const UIPage = createReactClass({
	displayName : 'UIPage',

	render : function(){
		return <div className='uiPage sitePage'>
			<Navbar pageName={this.props.pageName} />
			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
});

export default UIPage;
