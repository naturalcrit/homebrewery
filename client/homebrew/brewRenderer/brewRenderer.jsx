var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Markdown = require('marked');

var PAGE_HEIGHT = 1056 + 30;

var BrewRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			text : ''
		};
	},
	getInitialState: function() {
		return {
			viewablePageNumber: 0,
			height : 0
		};
	},
	totalPages : 0,
	height : 0,


	componentDidMount: function() {
		this.setState({
			height : this.refs.main.parentNode.clientHeight
		});

	},

	handleScroll : function(e){
		this.setState({
			viewablePageNumber : Math.floor(e.target.scrollTop / PAGE_HEIGHT)
		});
	},

	//Implement later
	scrollToPage : function(pageNumber){
	},

	shouldRender : function(pageText, index){
		var viewIndex = this.state.viewablePageNumber;
		if(index == viewIndex - 1) return true;
		if(index == viewIndex)     return true;
		if(index == viewIndex + 1) return true;

		//Check for style tages
		if(pageText.indexOf('<style>') !== -1) return true;

		return false;
	},

	renderPageInfo : function(){
		return <div className='pageInfo'>
			{this.state.viewablePageNumber + 1} / {this.totalPages}
		</div>
	},

	renderDummyPage : function(key){
		return <div className='phb' key={key}>
			<i className='fa fa-spinner fa-spin' />
		</div>
	},

	renderPage : function(pageText, index){
		return <div className='phb' dangerouslySetInnerHTML={{__html:Markdown(pageText)}} key={index} />
	},

	renderPages : function(){
		var pages = this.props.text.split('\\page');
		this.totalPages = pages.length;

		return _.map(pages, (page, index)=>{
			if(this.shouldRender(page, index)){
				return this.renderPage(page, index);
			}else{
				return this.renderDummyPage(index);
			}
		});
	},

	render : function(){
		return <div className='brewRenderer'
			onScroll={this.handleScroll}
			ref='main'
			style={{height : this.state.height}}>

			<div className='pages'>
				{this.renderPages()}
			</div>
			{this.renderPageInfo()}
		</div>
	}
});

module.exports = BrewRenderer;
