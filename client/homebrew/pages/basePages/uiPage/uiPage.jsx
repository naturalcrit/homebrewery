import './uiPage.less';
import React from 'react';
import createReactClass from 'create-react-class';

const UIPage = createReactClass({
	displayName : 'UIPage',

	render : function(){
		return <div className='uiPage sitePage'>

			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
});

export default UIPage;
