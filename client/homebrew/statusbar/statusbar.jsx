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

	renderInfo : function(){
		//render last update?
		//number of times viewed?
	},

	renderNewButton  : function(){
		if(this.props.editId) return null;

		return <a className='newButton' target='_blank' href='/homebrew/new'>
			<i className='fa fa-new' />
			New
		</a>
	},

	renderLinks : function(){
		if(!this.props.editId) return null;

		return [
			<div className='' key='edit'>
				<span>Edit Link</span>
				<input type='text' readOnly value={this.props.editId} />
			</div>,
			<div className='' key='share'>
				<a herf={'/share/' + this.props.shareId}>Share Link</a>
				<input type='text' readOnly value={this.props.shareId} />
			</div>
		]
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
		console.log(this.props);
		return <div className='statusbar'>
			<Logo />
			Statusbar Ready!

			<div className='controls'>
				{this.renderLinks()}
				{this.renderStatus()}
				{this.renderNewButton()}
			</div>
		</div>
	}
});

module.exports = Statusbar;
