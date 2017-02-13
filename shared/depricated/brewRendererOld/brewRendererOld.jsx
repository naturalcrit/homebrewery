const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Markdown = require('depricated/markdown.old.js');
const ErrorBar = require('./errorBar/errorBar.jsx');

const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx')
const Store = require('homebrewery/brew.store.js');


const PAGE_HEIGHT = 1056;
const PPR_THRESHOLD = 50;

const OLD_BrewRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			value : '',
			style : '',
			errors : []
		};
	},
	getInitialState: function() {
		const pages = this.props.value.split('\\page');

		return {
			viewablePageNumber: 0,
			height : 0,
			isMounted : false,
			pages : pages,
			usePPR : pages.length >= PPR_THRESHOLD
		};
	},
	height : 0,
	pageHeight : PAGE_HEIGHT,
	lastRender : <div></div>,

	componentDidMount: function() {
		this.updateSize();
		window.addEventListener("resize", this.updateSize);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.updateSize);
	},

	componentWillReceiveProps: function(nextProps) {
		if(this.refs.pages && this.refs.pages.firstChild) this.pageHeight = this.refs.pages.firstChild.clientHeight;

		const pages = nextProps.value.split('\\page');
		this.setState({
			pages : pages,
			usePPR : pages.length >= PPR_THRESHOLD
		})
	},

	updateSize : function() {
		setTimeout(()=>{
			if(this.refs.pages && this.refs.pages.firstChild) this.pageHeight = this.refs.pages.firstChild.clientHeight;
		}, 1);

		const parentNode = document.querySelector('.page .content');
		this.setState({
			height : parentNode.clientHeight,
			isMounted : true
		});
	},

	handleScroll : function(e){
		this.setState({
			viewablePageNumber : Math.floor(e.target.scrollTop / this.pageHeight)
		});
	},

	shouldRender : function(pageText, index){
		if(!this.state.isMounted) return false;

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
			{this.state.viewablePageNumber + 1} / {this.state.pages.length}
		</div>
	},

	renderPPRmsg : function(){
		if(!this.state.usePPR) return;

		return <div className='ppr_msg'>
			Partial Page Renderer enabled, because your brew is so large. May effect rendering.
		</div>
	},

	renderDummyPage : function(index){
		return <div className='phb old' id={`p${index + 1}`} key={index}>
			<i className='fa fa-spinner fa-spin' />
		</div>
	},

	renderPage : function(pageText, index){
		return <div className='phb_old' id={`p${index + 1}`} dangerouslySetInnerHTML={{__html:Markdown.render(pageText)}} key={index} />
	},

	renderPages : function(){
		if(this.state.usePPR){
			return _.map(this.state.pages, (page, index)=>{
				if(this.shouldRender(page, index)){
					return this.renderPage(page, index);
				}else{
					return this.renderDummyPage(index);
				}
			});
		}
		if(this.props.errors && this.props.errors.length) return this.lastRender;
		this.lastRender = _.map(this.state.pages, (page, index)=>{
			return this.renderPage(page, index);
		});
		return this.lastRender;
	},

	render : function(){
		return <div className='brewRendererOld'
			onScroll={this.handleScroll}
			ref='main'
			style={{height : this.state.height}}>

			<ErrorBar errors={this.props.errors} />
			<RenderWarnings />

			<div className='pages' ref='pages'>
				{this.renderPages()}
			</div>
			{this.renderPageInfo()}
			{this.renderPPRmsg()}
		</div>
	}
});

module.exports = OLD_BrewRenderer;
