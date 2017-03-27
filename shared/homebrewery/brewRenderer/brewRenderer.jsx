const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const OldBrewRenderer = require('depricated/brewRendererOld/brewRendererOld.jsx');

const Markdown = require('homebrewery/markdown.js');

const PPR_RANGE = 0;

const BrewRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			text : '',
			style : '',

			//usePPR : false // TODO: maybe make this into an page index to render

			pprPage : false
		};
	},
	/*
	getInitialState: function() {
		const pages = this.props.brew.text.split('\\page');

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

	*/
	lastRender : <div></div>,

	/*

	componentDidMount: function() {
		this.updateSize();
		window.addEventListener('resize', this.updateSize);
	},
	componentWillUnmount: function() {
		window.removeEventListener('resize', this.updateSize);
	},

	componentWillReceiveProps: function(nextProps) {
		if(this.refs.pages && this.refs.pages.firstChild) this.pageHeight = this.refs.pages.firstChild.clientHeight;

		const pages = nextProps.brew.text.split('\\page');
		this.setState({
			pages : pages,
			usePPR : pages.length >= PPR_THRESHOLD
		})
	},

	updateSize : function() {
		setTimeout(()=>{
			if(this.refs.pages && this.refs.pages.firstChild) this.pageHeight = this.refs.pages.firstChild.clientHeight;
		}, 1);


		this.setState({
			height : this.refs.main.parentNode.clientHeight,
			isMounted : true
		});
	},


	*/

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


	/*
	renderPPRmsg : function(){
		if(!this.state.usePPR) return;

		return <div className='ppr_msg'>
			Partial Page Renderer enabled, because your brew is so large. May effect rendering.
		</div>
	},
	*/


	renderPage : function(pageText, index){
		const html = Markdown.render(pageText);
		return <div className='phb v2' id={`p${index + 1}`} dangerouslySetInnerHTML={{__html:html}} key={index} />
	},

	renderPPR : function(pages, pprPageIndex){
		return _.map(pages, (page, index)=>{
			if(_.inRange(index, pprPageIndex - PPR_RANGE, pprPageIndex + PPR_RANGE +1)){
				this.renderPage(page, index);
			}
			return <div className='phb v2' id={`p${index + 1}`} key={index} />;
		});
	},

	renderPages : function(){
		/*
		if(this.state.usePPR){
			return _.map(this.state.pages, (page, index)=>{
				if(this.shouldRender(page, index)){
					return this.renderPage(page, index);
				}else{
					return this.renderDummyPage(index);
				}
			});
		}
		*/
		const pages = this.props.text.split('\\page');

		console.log(this.props.pprPage);

		if(this.props.pprPage !== false) return this.renderPPR(pages, this.props.pprPage);

		return _.map(pages, (page, index)=>this.renderPage(page, index));

		//TODO: See if you need error handling?
		//if(this.props.errors && this.props.errors.length) return this.lastRender;

	},

	//TODO: This is pretty bad
	renderStyle : function(){
		return <style>{this.props.style.replace(/;/g, ' !important;')}</style>
	},

	render : function(){
		//if(this.props.brew.version == 1) return <OldBrewRenderer value={this.props.brew.text} />;


		return <div className='brewRenderer'>
			{this.renderStyle()}
			{this.renderPages()}
		</div>
	}
});

module.exports = BrewRenderer;
