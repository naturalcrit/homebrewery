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

import { jsPDF } from 'jspdf';
import * as html2canvas from "html2canvas"



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
				text     : this.props.brew.text     || '',
				style    : this.props.brew.style    || undefined,
				renderer : this.props.brew.renderer || 'legacy',
				theme    : this.props.brew.theme    || '5ePHB'
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
						theme    : metaStorage?.theme    || '5ePHB'
					}
				};
			});
		}
		window.html2canvas = html2canvas;
		const pages = document.getElementsByClassName('pages')[0];
		console.log(pages);
		const doc = new jsPDF({
			orientation      : 'p',
			unit             : 'pt',
			format           : 'letter',
			putOnlyUsedFonts : true,
		});
		const bookInsanity = "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";
		doc.addFileToVFS('bookInsanity.woff2', bookInsanity);
		doc.addFont('bookInsanity.woff2', 'bookInsanity', 'normal');
		doc.setFont('bookInsanity');
		doc.html(pages, {
			callback : function(doc) {
				console.log('Trying to save!');
				doc.save('test.pdf');
			},
			html2canvas : {
				allowTaint      : true,
				useCORS: false,
				backgroundColor : null,
				logging         : true,
				dpi             : 300,
				letterRendering : true,
				width           : doc.internal.pageSize.getWidth(),
				height          : doc.internal.pageSize.getHeight(),
				scale           : .75,
				x               : 0,
				y               : 0
			},
			windowWidth : getComputedStyle(pages.children[0]).width
		});
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
		const rendererPath = this.state.brew.renderer == 'V3' ? 'V3' : 'Legacy';
		const themePath    = this.state.brew.theme ?? '5ePHB';
		const baseThemePath = Themes[rendererPath][themePath].baseTheme;

		return <div>
			<Meta name='robots' content='noindex, nofollow' />
			<link href={`/themes/${rendererPath}/Blank/style.css`} rel='stylesheet'/>
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
