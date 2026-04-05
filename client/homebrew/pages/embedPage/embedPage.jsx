import './embedPage.less';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Headtags   from '../../../../vitreum/headtags.js';
import MarkdownLegacy from '@shared/markdownLegacy.js';
import Markdown from '@shared/markdown.js';

const Meta = Headtags.Meta;

import Nav from '@navbar/nav.jsx';
import Navbar from '@navbar/navbar.jsx';
import MetadataNav from '@navbar/metadata.navitem.jsx';
import PrintNavItem from '@navbar/print.navitem.jsx';
import RecentNavItems from '@navbar/recent.navitem.jsx';
const { both: RecentNavItem } = RecentNavItems;
import Account from '@navbar/account.navitem.jsx';
import safeHTML from '../../brewRenderer/safeHTML.js';

import { DEFAULT_BREW_LOAD } from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle } from '@shared/helpers.js';
import _ from 'lodash';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
const PAGEBREAK_REGEX_LEGACY = /\\page(?:break)?/m;
const COLUMNBREAK_REGEX_LEGACY = /\\column(:?break)?/m;

let renderedPages = [];
let rawPages      = [];

const BrewPage = (props)=>{
	props = {
		contents : '',
		index    : 0,
		...props
	};
	const pageRef   = useRef(null);
	const cleanText = safeHTML(props.contents);

	return <div className={props.className} id={`p${props.index + 1}`} data-index={props.index} ref={pageRef} style={props.style} {...props.attributes}>
	         <div className='columnWrapper' dangerouslySetInnerHTML={{ __html: cleanText }} />
	       </div>;
};


const EmbedPage = (props)=>{
	const [displayOptions, setDisplayOptions] = useState({
		zoomLevel    : 100,
		spread       : 'single',
		startOnRight : true,
		pageShadows  : true,
		rowGap       : 5,
		columnGap    : 10,
	});

	if(props.renderer == 'legacy') {
		rawPages = props.brew.text.split(PAGEBREAK_REGEX_LEGACY);
	} else {
		rawPages = props.brew.text.split(PAGEBREAK_REGEX_V3);
	}

	const pagesStyle = {
		zoom      : `${displayOptions.zoomLevel}%`,
		columnGap : `${displayOptions.columnGap}px`,
		rowGap    : `${displayOptions.rowGap}px`,
		overflowY : 'auto'
	};

	const { brew = DEFAULT_BREW_LOAD, disableMeta = false, share = true } = props;

	const [themeBundle,                setThemeBundle]                = useState({});
	const [currentBrewRendererPageNum, setCurrentBrewRendererPageNum] = useState(1);

	const handleBrewRendererPageChange = useCallback((pageNumber)=>{
		setCurrentBrewRendererPageNum(pageNumber);
	}, []);

	const handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode === P_KEY) {
			printCurrentBrew();
			e.stopPropagation();
			e.preventDefault();
		}
	};

	useEffect(()=>{
		document.addEventListener('keydown', handleControlKeys);
		fetchThemeBundle(undefined, setThemeBundle, brew.renderer, brew.theme);

		return ()=>{
			document.removeEventListener('keydown', handleControlKeys);
		};
	}, []);

	const renderStyle = ()=>{
		const themeStyles = themeBundle?.joinedStyles ?? '<style>@import url("/themes/V3/Blank/style.css");</style>';
		const cleanStyle = safeHTML(`${themeStyles} \n\n <style> ${props.brew.style} </style>`);
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: cleanStyle }} />;
	};

	const renderPage = (pageText, index)=>{

		let styles = {
			...(!displayOptions.pageShadows ? { boxShadow: 'none' } : {})
			// Add more conditions as needed
		};
		let classes    = 'page';
		let attributes = {};

		if(props.renderer == 'legacy') {
			pageText.replace(COLUMNBREAK_REGEX_LEGACY, '```\n````\n'); // Allow Legacy brews to use `\column(break)`
			const html = MarkdownLegacy.render(pageText);

			return <BrewPage className='page phb' index={index} key={index} contents={html} style={styles} />;
		} else {
			if(pageText.startsWith('\\page')) {
				const firstLineTokens  = Markdown.marked.lexer(pageText.split('\n', 1)[0])[0].tokens;
				const injectedTags = firstLineTokens?.find((obj)=>obj.injectedTags !== undefined)?.injectedTags;
				if(injectedTags) {
					styles     = { ...styles, ...injectedTags.styles };
					styles     = _.mapKeys(styles, (v, k)=>k.startsWith('--') ? k : _.camelCase(k)); // Convert CSS to camelCase for React
					classes    = [classes, injectedTags.classes].join(' ').trim();
					attributes = injectedTags.attributes;
				}
				pageText = pageText.includes('\n') ? pageText.substring(pageText.indexOf('\n') + 1) : ''; // Remove the \page line
			}

			// DO NOT REMOVE!!! REQUIRED FOR BACKWARDS COMPATIBILITY WITH NON-UPGRADABLE VERSIONS OF CHROME.
			pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)

			const html = Markdown.render(pageText, index);

			return <BrewPage className={classes} index={index} key={index} contents={html} style={styles} attributes={attributes} />;
		}
	};

	const renderPages = ()=>{
		if(props.errors && props.errors.length)
			return renderedPages;

		renderedPages.length = 0;

		_.forEach(rawPages, (page, index)=>{
			{
				renderedPages[index] = renderPage(page, index); // Render any page not yet rendered, but only re-render those in PPR range
			}
		});
		return renderedPages;
	};

	return (
		<div>
			<Meta name='robots' content='noindex, nofollow' />
			{renderStyle()}
			<div className={`pages ${displayOptions.startOnRight ? 'recto' : 'verso'}	${displayOptions.spread}`} lang={`${props.lang || 'en'}`} style={pagesStyle}>
				{renderPages()}
			</div>
		</div>
	);
};

export default EmbedPage;
