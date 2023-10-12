/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./brewRenderer.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
const Markdown = require('naturalcrit/markdown.js');
const ErrorBar = require('./errorBar/errorBar.jsx');

//TODO: move to the brew renderer
const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx');
const NotificationPopup = require('./notificationPopup/notificationPopup.jsx');
const Frame = require('react-frame-component').default;

const Themes = require('themes/themes.json');

const PAGE_HEIGHT = 1056;
const PPR_THRESHOLD = 50;

const BrewRenderer = createClass({
	displayName     : 'BrewRenderer',
	getDefaultProps : function() {
		return {
			text     : '',
			style    : '',
			renderer : 'legacy',
			theme    : '5ePHB',
			lang     : '',
			errors   : []
		};
	},
	getInitialState : function() {
		let pages;
		let pageCount;
		if(this.props.renderer == 'legacy') {
			pages = this.props.text.split('\\page');
			pageCount = pages.length;
		} else {
			// pages = this.props.text.split(/^\\page$/gm);
			pages = [this.props.text];
			pageCount = this.props.text.split(/^\\page$/gm).length;
		}

		return {
			viewablePageNumber : 1,
			height             : 0,
			isMounted          : false,

			pages          : pages,
			pageCount      : pageCount,
			usePPR         : pageCount >= PPR_THRESHOLD,
			visibility     : 'hidden',
			initialContent : `<!DOCTYPE html><html><head>
												<link href="//use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet" />
												<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
												<link href='/homebrew/bundle.css' rel='stylesheet' />
												<base target=_blank>
												</head><body style='overflow: hidden'><div></div></body></html>`
		};
	},
	height     : 0,
	lastRender : <div></div>,

	componentWillUnmount : function() {
		window.removeEventListener('resize', this.updateSize);
	},

	componentDidUpdate : function(prevProps) {
		if(prevProps.text !== this.props.text) {
			let pages;
			let pageCount;
			if(this.props.renderer == 'legacy') {
				pages = this.props.text.split('\\page');
				pageCount = pages.length;
			} else {
				pages = [this.props.text];
				pageCount = this.props.text.split(/^\\page$/gm).length;
			}
			this.setState({
				pages     : pages,
				pageCount : pageCount,
				usePPR    : pageCount >= PPR_THRESHOLD
			});
		}
	},

	updateSize : function() {
		this.setState({
			height : this.refs.main.parentNode.clientHeight,
		});
	},

	handleScroll : function(e){
		let currentPage = 1;
		if(window) {
			const pageCollection = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('page');
			const brewRendererHeight = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer').item(0).getBoundingClientRect().height;

			for (const page of pageCollection) {
				if(page.getBoundingClientRect().bottom > (brewRendererHeight / 2)) {
					currentPage = parseInt(page.id.slice(1)) || 1;
					break;
				}
			}
		}

		this.setState((prevState)=>({
			viewablePageNumber : currentPage
		}));
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

	sanitizeScriptTags : function(content) {
		return content
			.replace(/<script/ig, '&lt;script')
			.replace(/<\/script>/ig, '&lt;/script&gt;');
	},

	renderPageInfo : function(){
		return <div className='pageInfo' ref='main'>
			<div>
				{this.props.renderer}
			</div>
			<div>
				{this.state.viewablePageNumber} / {this.state.pageCount}
			</div>
		</div>;
	},

	renderPPRmsg : function(){
		if(!this.state.usePPR) return;

		return <div className='ppr_msg'>
			Partial Page Renderer is enabled, because your brew is so large. May affect rendering.
		</div>;
	},

	renderDummyPage : function(index){
		return <div className='phb page' id={`p${index + 1}`} key={index}>
			<i className='fas fa-spinner fa-spin' />
		</div>;
	},

	renderStyle : function() {
		if(!this.props.style) return;
		const cleanStyle = this.sanitizeScriptTags(this.props.style);
		//return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style>@layer styleTab {\n${this.sanitizeScriptTags(this.props.style)}\n} </style>` }} />;
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style> ${cleanStyle} </style>` }} />;
	},

	renderPage : function(pageText, index){
		let cleanPageText = this.sanitizeScriptTags(pageText);
		if(this.props.renderer == 'legacy')
			return <div className='pages' ref='pages' lang={`${this.props.lang || 'en'}`}><div className='phb page' id={`p${index + 1}`} dangerouslySetInnerHTML={{ __html: MarkdownLegacy.render(cleanPageText) }} key={index} /></div>;
		else {
			cleanPageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)
			return (
				<div className='pages' ref='pages' lang={`${this.props.lang || 'en'}`} dangerouslySetInnerHTML={{ __html: Markdown.render(cleanPageText || ' ', this.state.usePPR ? this.state.viewablePageNumber : -1, 2) }} />
			);
		}
	},

	renderPages : function(){
		if(this.state.usePPR){
			return _.map(this.state.pages, (page, index)=>{
				if(this.shouldRender(page, index) && typeof window !== 'undefined'){
					return this.renderPage(page, index);
				} else {
					return this.renderDummyPage(index);
				}
			});
		}
		if(this.props.errors && this.props.errors.length) return this.lastRender;
		this.lastRender = _.map(this.state.pages, (page, index)=>{
			if(typeof window !== 'undefined') {
				return this.renderPage(page, index);
			} else {
				return this.renderDummyPage(index);
			}
		});
		return this.lastRender;
	},

	frameDidMount : function(){	//This triggers when iFrame finishes internal "componentDidMount"
		setTimeout(()=>{	//We still see a flicker where the style isn't applied yet, so wait 100ms before showing iFrame
			this.updateSize();
			window.addEventListener('resize', this.updateSize);
			this.renderPages(); //Make sure page is renderable before showing
			this.setState({
				isMounted  : true,
				visibility : 'visible'
			});
		}, 100);
	},

	emitClick : function(){
		// console.log('iFrame clicked');
		if(!window || !document) return;
		document.dispatchEvent(new MouseEvent('click'));
	},

	render : function(){
		//render in iFrame so broken code doesn't crash the site.
		//Also render dummy page while iframe is mounting.
		const rendererPath = this.props.renderer == 'V3' ? 'V3' : 'Legacy';
		const themePath    = this.props.theme ?? '5ePHB';
		const baseThemePath = Themes[rendererPath][themePath].baseTheme;
		return (
			<React.Fragment>
				{!this.state.isMounted
					? <div className='brewRenderer' onScroll={this.handleScroll}>
						<div className='pages' ref='pages'>
							{this.renderDummyPage(1)}
						</div>
					</div>
	        : null}

				<Frame id='BrewRenderer' initialContent={this.state.initialContent}
					style={{ width: '100%', height: '100%', visibility: this.state.visibility }}
					contentDidMount={this.frameDidMount}
					onClick={()=>{this.emitClick();}}
				>
					<div className={'brewRenderer'}
						onScroll={this.handleScroll}
						style={{ height: this.state.height }}>

						<ErrorBar errors={this.props.errors} />
						<div className='popups'>
							<RenderWarnings />
							<NotificationPopup />
						</div>
						<link href={`/themes/${rendererPath}/Blank/style.css`} rel='stylesheet'/>
						{baseThemePath &&
							<link href={`/themes/${rendererPath}/${baseThemePath}/style.css`} rel='stylesheet'/>
						}
						<link href={`/themes/${rendererPath}/${themePath}/style.css`} rel='stylesheet'/>
						{/* Apply CSS from Style tab and render pages from Markdown tab */}
						{this.state.isMounted
							&&
							<>
								{this.renderStyle()}
								{this.renderPages()}
							</>
						}
					</div>
				</Frame>
				{this.renderPageInfo()}
				{this.renderPPRmsg()}
			</React.Fragment>
		);
	}
});

module.exports = BrewRenderer;
