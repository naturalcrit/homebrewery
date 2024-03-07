require('./printPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const { Meta } = require('vitreum/headtags');
const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
const Markdown = require('naturalcrit/markdown.js');

const staticThemes = require('themes/themes.json');

const BREWKEY = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY = 'homebrewery-new-meta';

const PrintPage = createClass({
	displayName     : 'PrintPage',
	getDefaultProps : function() {
		return {
			query : {},
			brew  : {
				text     : '',
				style    : '',
				renderer : 'legacy',
				lang     : ''
			}
		};
	},

	getInitialState : function() {
		return {
			brew : {
				text       : this.props.brew.text     || '',
				style      : this.props.brew.style    || undefined,
				renderer   : this.props.brew.renderer || 'legacy',
				theme      : this.props.brew.theme    || '5ePHB',
				lang       : this.props.brew.lang     || 'en',
				userThemes : this.props.brew.userThemes
			}
		};
	},

	componentDidMount : function() {
		if(this.props.query.local == 'print'){
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			this.setState((prevState, prevProps)=>{
				return {
					brew : {
						text     : brewStorage,
						style    : styleStorage,
						renderer : metaStorage?.renderer || 'legacy',
						theme    : metaStorage?.theme    || '5ePHB',
						lang	 : metaStorage?.lang	 || 'en'
					}
				};
			});
		}

		if(this.props.query.dialog) window.print();
	},

	renderStyle : function() {
		if(!this.state.brew.style) return;
		//return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style>@layer styleTab {\n${this.state.brew.style}\n} </style>` }} />;
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style>\n${this.state.brew.style}\n</style>` }} />;
	},

	renderPages : function(){
		if(this.state.brew.renderer == 'legacy') {
			return _.map(this.state.brew.text.split('\\page'), (pageText, index)=>{
				return <div
					className='phb page'
					id={`p${index + 1}`}
					dangerouslySetInnerHTML={{ __html: MarkdownLegacy.render(pageText) }}
					key={index} />;
			});
		} else {
			return _.map(this.state.brew.text.split(/^\\page$/gm), (pageText, index)=>{
				pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)
				return (
					<div className='page' id={`p${index + 1}`} key={index} >
						<div className='columnWrapper' dangerouslySetInnerHTML={{ __html: Markdown.render(pageText) }} />
					</div>
				);
			});
		}

	},

	render : function(){
		let rendererPath  = this.state.brew.renderer == 'V3' ? 'V3' : 'Legacy';
		let baseRendererPath = this.state.brew.renderer == 'V3' ? 'V3' : 'Legacy';
		const blankRendererPath = this.state.brew.renderer == 'V3' ? 'V3' : 'Legacy';
		if(this.state.brew.theme[0] === '#') {
			rendererPath = 'Brew';
		}
		let themePath     = this.state.brew.theme ?? '5ePHB';
		const Themes = { ...staticThemes, ...this.state.brew.userThemes };
		let baseThemePath = Themes[rendererPath][themePath]?.baseTheme;

		// Override static theme values if a Brew theme.

		if(themePath[0] == '#') {
			themePath = themePath.slice(1);
			rendererPath = '';
		} else {
			rendererPath += '/';
		}

		if(rendererPath == '') {
			baseThemePath = 'Brew';
			baseRendererPath = '';
		} else {
			baseRendererPath += '/';
		}
	
		const staticOrUserParent = this.state.brew.theme[0] == '#' ? `/cssParent/${themePath}` : `/css/${baseRendererPath}${baseThemePath}`;

		return <div>
			<Meta name='robots' content='noindex, nofollow' />
			<link href={`/css/${blankRendererPath}/Blank`} rel='stylesheet'/>
			{baseThemePath &&
				<link href={staticOrUserParent} rel='stylesheet'/>
			}
			<link href={`/css/${rendererPath}${themePath}`} rel='stylesheet'/>
			{/* Apply CSS from Style tab */}
			{this.renderStyle()}
			<div className='pages' ref='pages' lang={this.state.brew.lang}>
				{this.renderPages()}
			</div>
		</div>;
	}
});

module.exports = PrintPage;
