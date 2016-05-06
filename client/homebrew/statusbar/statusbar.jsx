var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var Moment = require('moment');
var request = require('superagent')

var Logo = require('naturalcrit/logo/logo.jsx');

var replaceAll = function(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

var Statusbar = React.createClass({

	getDefaultProps: function() {
		return {
			editId: null,
			sourceText : null,
			shareId : null,
			printId : null,
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


	deleteBrew : function(){
		if(!confirm("are you sure you want to delete this brew?")) return;
		if(!confirm("are you REALLY sure? You will not be able to recover it")) return;

		request.get('/homebrew/api/remove/' + this.props.editId)
			.send()
			.end(function(err, res){
				window.location.href = '/homebrew';
			});
	},


	openSourceWindow : function(){
		var sourceWindow = window.open();
		var content = replaceAll(this.props.sourceText, '<', '&lt;');
		content = replaceAll(content, '>', '&gt;');
		sourceWindow.document.write('<code><pre>' + content + '</pre></code>');
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

	renderChromeTip : function(){
		if(typeof window !== 'undefined' && window.chrome) return;
		return <div
			className='chromeField'
			data-tooltip="If you are noticing rendering issues, try using Chrome instead.">
			<i className='fa fa-exclamation-triangle' />
			Optimized for Chrome
		</div>
	},

	renderSourceButton  : function(){
		if(!this.props.sourceText) return null;

		return <a className='sourceField' onClick={this.openSourceWindow}>
			View Source <i className='fa fa-code' />
		</a>
	},

	renderNewButton  : function(){
		if(this.props.editId || this.props.shareId) return null;

		return <a className='newButton' target='_blank' href='/homebrew/new'>
			New Brew <i className='fa fa-external-link' />
		</a>
	},

	renderChangelogButton  : function(){
		if(this.props.editId || this.props.shareId) return null;

		return <a className='changelogButton' target='_blank' href='/homebrew/changelog'>
			Changelog <i className='fa fa-file-text-o' />
		</a>
	},

	renderShare : function(){
		if(!this.props.shareId) return null;

		return <a className='shareField' key='share' href={'/homebrew/share/' + this.props.shareId} target="_blank">
			Share Link <i className='fa fa-external-link' />
		</a>
	},

	renderPrintButton : function(){
		if(!this.props.printId) return null;

		return <a className='printField' key='print' href={'/homebrew/print/' + this.props.printId} target="_blank">
			Print View <i className='fa fa-print' />
		</a>
	},

	renderDeleteButton : function(){
		if(!this.props.editId) return null;


		return <div className='deleteButton' onClick={this.deleteBrew}>
			Delete <i className='fa fa-trash' />
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
			<Logo
				hoverSlide={true}
			/>
			<div className='left'>
				<a href='/homebrew' className='toolName'>
					The Home<small>Brewery</small>
				</a>
			</div>
			<div className='controls right'>
				{this.renderChromeTip()}
				{this.renderChangelogButton()}
				{this.renderStatus()}
				{this.renderInfo()}
				{this.renderSourceButton()}
				{this.renderDeleteButton()}
				{this.renderPrintButton()}
				{this.renderShare()}
				{this.renderNewButton()}
			</div>
		</div>
	}
});

module.exports = Statusbar;
