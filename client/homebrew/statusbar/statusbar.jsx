var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');

var Logo = require('naturalCrit/logo/logo.jsx');

var Statusbar = React.createClass({

	getDefaultProps: function() {
		return {
			//editId: null,
			shareId : null,
			isPending : false,
			lastUpdated : null,
			info : null,
			views : 0
		};
	},

	componentDidMount: function() {
		//Updates the last updated text every 10 seconds
		if(this.props.lastUpdated){
			this.refreshTimer = setInterval(()=>{
				this.forceUpdate();
			}, 10000)
		}
	},

	componentWillUnmount: function() {
		clearInterval(this.refreshTimer);
	},


	renderInfo : function(){
		if(!this.props.lastUpdated) return null;

		return [
			<div className='views' key='views'>
				Views: {this.props.views}
			</div>,
			<div className='lastUpdated' key='lastUpdated'>
				Last updated: {Moment(this.props.lastUpdated).fromNow()}
			</div>
		];

	},

	renderNewButton  : function(){
		if(this.props.editId || this.props.shareId) return null;

		return <a className='newButton' target='_blank' href='/homebrew/new'>
			New Brew <i className='fa fa-external-link' />
		</a>
	},

	renderShare : function(){
		if(!this.props.shareId) return null;

		return <a className='shareField' key='share' href={'/homebrew/share/' + this.props.shareId} target="_blank">
			Share Link <i className='fa fa-external-link' />
		</a>
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
			<Logo
				hoverSlide={true}
			/>
			<div className='left'>
				<a href='/homebrew' className='toolName'>
					The Home<small>Brewery</small>
				</a>
			</div>
			<div className='controls right'>
				{this.renderStatus()}
				{this.renderInfo()}
				{this.renderShare()}
				{this.renderNewButton()}
			</div>
		</div>
	}
});

module.exports = Statusbar;
