const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const Markdown = require('naturalcrit/markdown.js');
const ErrorBar = require('./errorBar/errorBar.jsx');

//TODO: move to the brew renderer
const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx');

const PAGE_HEIGHT = 1056;
const PPR_THRESHOLD = 50;

const BrewRenderer = createClass({
	getDefaultProps : function() {
		return {
			text   : '',
			errors : []
		};
	},
	getInitialState : function() {
		const pages = this.props.text.split('\\page');

		return {
			viewablePageNumber : 0,
			height             : 0,
			willChange		   : 'auto',
			isMounted          : false,

			usePPR : true,

			pages  : pages,
			usePPR : pages.length >= PPR_THRESHOLD,

			errors : []
		};
	},
	height     : 0,
	lastRender : <div></div>,

	componentDidMount : function() {
		this.updateSize();
		window.addEventListener('resize', this.updateSize);
	},
	componentWillUnmount : function() {
		window.removeEventListener('resize', this.updateSize);
	},

	componentWillReceiveProps : function(nextProps) {
		const pages = nextProps.text.split('\\page');
		this.setState({
			pages  : pages,
			usePPR : pages.length >= PPR_THRESHOLD
		});
	},

	updateSize : function() {
		this.setState({
			height    : this.refs.main.parentNode.clientHeight,
			isMounted : true
		});
	},

	handleScroll : function(e){
		this.setState({
			viewablePageNumber : Math.floor(e.target.scrollTop / e.target.scrollHeight * this.state.pages.length)
		});
	},

	shouldRender : function(pageText, index){
		if(!this.state.isMounted) return false;

		const viewIndex = this.state.viewablePageNumber;
		if(index == viewIndex - 3) return true;
		if(index == viewIndex - 2) return true;
		if(index == viewIndex - 1) return true;
		if(index == viewIndex)     return true;
		if(index == viewIndex + 1) return true;
		if(index == viewIndex + 2) return true;
		if(index == viewIndex + 3) return true;

		//Check for style tages
		if(pageText.indexOf('<style>') !== -1) return true;

		return false;
	},

	renderPageInfo : function(){
		return <div className='pageInfo'>
			{this.state.viewablePageNumber + 1} / {this.state.pages.length}
		</div>;
	},

	renderPPRmsg : function(){
		if(!this.state.usePPR) return;

		return <div className='ppr_msg'>
			Partial Page Renderer enabled, because your brew is so large. May effect rendering.
		</div>;
	},

	renderDummyPage : function(index){
		return <div className='phb' id={`p${index + 1}`} key={index}>
			<i className='fa fa-spinner fa-spin' />
		</div>;
	},

	renderPage : function(pageText, index){
		return <div className='phb' id={`p${index + 1}`} dangerouslySetInnerHTML={{ __html: Markdown.render(pageText) }} key={index} />;
	},

	renderPages : function(){
		if(this.state.usePPR){
			return _.map(this.state.pages, (page, index)=>{
				if(this.shouldRender(page, index)){
					return this.renderPage(page, index);
				} else {
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
	
	/**
	* Optimize for smooth scrolling when mouse enters the rendering panel 
	**/
	prepareScroll : function(){
		this.setState({willChange : 'transform'});
	},
	
	/**
	* Unload smooth scrolling optimizations when mouse leaves rendering panel
	**/
	unprepareScroll : function(){
		this.setState({willChange : 'auto'});
	},

	render : function(){
		return (
			<React.Fragment>
				<div className='brewRenderer'
					onScroll={this.handleScroll}
					onMouseOver={this.prepareScroll}
					onMouseOut={this.unprepareScroll}
					ref='main'
					style={{ height: 	 this.state.height,
							 willChange: this.state.willChange}}>

					<ErrorBar errors={this.props.errors} />
					<RenderWarnings />

					<div className='pages' ref='pages'>
						{this.renderPages()}
					</div>
				</div>;
				{this.renderPageInfo()}
				{this.renderPPRmsg()}
			</React.Fragment>
		);
	}
});

module.exports = BrewRenderer;
