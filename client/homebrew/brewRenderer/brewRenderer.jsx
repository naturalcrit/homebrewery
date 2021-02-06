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

const PAGE_HEIGHT = 1056;
const PPR_THRESHOLD = 50;

const BrewRenderer = createClass({
	getDefaultProps : function() {
		return {
			text     : '',
			renderer : 'legacy',
			errors   : []
		};
	},
	getInitialState : function() {
		let pages;
		if(this.props.renderer == 'legacy') {
			pages = this.props.text.split('\\page');
		} else {
			pages = this.props.text.split(/^\\page/gm);
		}

		return {
			viewablePageNumber : 0,
			height             : 0,
			isMounted          : false,

			pages          : pages,
			usePPR         : pages.length >= PPR_THRESHOLD,
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
			if(this.props.renderer == 'legacy') {
				pages = this.props.text.split('\\page');
			} else {
				pages = this.props.text.split(/^\\page/gm);
			}
			this.setState({
				pages  : pages,
				usePPR : pages.length >= PPR_THRESHOLD
			});
		}
	},

	updateSize : function() {
		this.setState({
			height : this.refs.main.parentNode.clientHeight,
		});
	},

	handleScroll : function(e){
		const target = e.target;
		this.setState((prevState)=>({
			viewablePageNumber : Math.floor(target.scrollTop / target.scrollHeight * prevState.pages.length)
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

	renderPageInfo : function(){
		return <div className='pageInfo' ref='main'>
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
			<i className='fas fa-spinner fa-spin' />
		</div>;
	},

	renderPage : function(pageText, index){
		if(this.props.renderer == 'legacy')
			return <div className='phb' id={`p${index + 1}`} dangerouslySetInnerHTML={{ __html: MarkdownLegacy.render(pageText) }} key={index} />;
		else
			return <div className='phb3' id={`p${index + 1}`} dangerouslySetInnerHTML={{ __html: Markdown.render(pageText) }} key={index} />;
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

	render : function(){
		//render in iFrame so broken code doesn't crash the site.
		//Also render dummy page while iframe is mounting.

		return (
			<React.Fragment>
				{!this.state.isMounted
					? <div className='brewRenderer' onScroll={this.handleScroll}>
						<div className='pages' ref='pages'>
							{this.renderDummyPage(1)}
						</div>
					</div>
	        : null}

				<Frame initialContent={this.state.initialContent} style={{ width: '100%', height: '100%', visibility: this.state.visibility }} contentDidMount={this.frameDidMount}>
					<div className={'brewRenderer'}
						onScroll={this.handleScroll}
						style={{ height: this.state.height }}>

						<ErrorBar errors={this.props.errors} />
						<div className='popups'>
							<RenderWarnings />
							<NotificationPopup />
						</div>

						<div className='pages' ref='pages'>
							{this.state.isMounted
								? this.renderPages()
							  : null}
						</div>
					</div>
				</Frame>
				{this.renderPageInfo()}
				{this.renderPPRmsg()}
			</React.Fragment>
		);
	}
});

module.exports = BrewRenderer;
