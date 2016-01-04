var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Logo = require('naturalCrit/logo/logo.jsx');



var Statusbar = React.createClass({

	getDefaultProps: function() {
		return {
			editId: null,
			shareId : null,
			isPending : false,

			info : null
		};
	},

	selectInputText : function(refName){
		this.refs[refName].select();
	},

	renderInfo : function(){
		//render last update?
		//number of times viewed?
	},

	renderNewButton  : function(){
		if(this.props.editId || this.props.shareId) return null;

		return <a className='newButton' target='_blank' href='/homebrew/new'>
			New <i className='fa fa-plus' />
		</a>
	},

	renderEdit : function(){
		if(!this.props.editId) return null;

		return <div className='editField' key='edit' onClick={this.selectInputText.bind(this, 'edit')}>
			<span>Edit Link</span>
			<input type='text' readOnly value={'/homebrew/edit/' + this.props.editId} ref='edit' />
		</div>
	},

	renderShare : function(){
		if(!this.props.shareId) return null;

		return <div className='shareField' key='share' onClick={this.selectInputText.bind(this, 'share')}>
			<span>Share Link</span>
			<input type='text' readOnly value={'/homebrew/share/' + this.props.shareId} ref='share'/>
		</div>
	},

	renderStatus : function(){
		if(!this.props.editId) return null;

		var text = 'Saved.'
		if(this.props.isPending){
			text = 'Saving...'
		}
		return <div className='savingStatus'>
			{text}
		</div>
	},

	render : function(){
		return <div className='statusbar'>

			<Logo />

			<div className='left'>
				<div className='toolName'>
					Home<i className='fa fa-beer fa-flip-horizontal' /><small>rewery</small>
				</div>

			</div>

			<div className='controls right'>
				{this.renderStatus()}
				{this.renderEdit()}
				{this.renderShare()}

				{this.renderNewButton()}
			</div>
		</div>
	}
});

module.exports = Statusbar;
