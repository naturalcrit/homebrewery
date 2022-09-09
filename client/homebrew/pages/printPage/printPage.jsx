require('./printPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const { Meta } = require('vitreum/headtags');
const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
const Markdown = require('naturalcrit/markdown.js');

const Themes = require('themes/themes.json');

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
				renderer : 'legacy'
			}
		};
	},

	getInitialState : function() {
		return {
			brew : {
				text     : this.props.brew.text || '',
				style    : this.props.brew.style || undefined,
				renderer : this.props.brew.renderer || 'legacy'
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
						theme    : metaStorage?.theme || '5ePHB'
					}
				};
			});
		}

		if(this.props.query.dialog) window.print();
	},

	renderStyle : function() {
		if(!this.state.brew.style) return;
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style> ${this.state.brew.style} </style>` }} />;
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
		const rendererPath = this.state.brew.renderer == 'V3' ? 'V3' : 'Legacy';
		const themePath    = this.state.brew.theme ?? '5ePHB';
		const baseThemePath = Themes[rendererPath][themePath].baseTheme;

		return <div>
			<Meta name='robots' content='noindex, nofollow' />
			{baseThemePath &&
				<link href={`/themes/${rendererPath}/${baseThemePath}/style.css`} rel='stylesheet'/>
			}
			<link href={`/themes/${rendererPath}/${themePath}/style.css`} rel='stylesheet'/>
			{/* Apply CSS from Style tab */}
			{this.renderStyle()}
			<div className='pages' ref='pages'>
				{this.renderPages()}
			</div>
		</div>;
	}
});

module.exports = PrintPage;
