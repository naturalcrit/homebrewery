/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./brewRenderer.less');
const React = require('react');
const { useState, useRef, useMemo, useEffect } = React;
const _ = require('lodash');

const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
import Markdown from 'naturalcrit/markdown.js';
const ErrorBar = require('./errorBar/errorBar.jsx');
const ToolBar  = require('./toolBar/toolBar.jsx');

//TODO: move to the brew renderer
const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx');
const NotificationPopup = require('./notificationPopup/notificationPopup.jsx');
const Frame = require('react-frame-component').default;
const dedent = require('dedent-tabs').default;
const { printCurrentBrew } = require('../../../shared/helpers.js');

import { safeHTML } from './safeHTML.js';

const PAGE_HEIGHT = 1056;

const INITIAL_CONTENT = dedent`
	<!DOCTYPE html><html><head>
	<link href="//use.fontawesome.com/releases/v6.5.1/css/all.css" rel="stylesheet" type="text/css" />
	<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
	<link href='/homebrew/bundle.css' type="text/css" rel='stylesheet' />
	<base target=_blank>
	</head><body style='overflow: hidden'><div></div></body></html>`;


//v=====----------------------< Brew Page Component >---------------------=====v//
const BrewPage = (props)=>{
	props = {
		contents : '',
		index    : 0,
		...props
	};
	const pageRef = useRef(null);
	const cleanText = safeHTML(props.contents);

	useEffect(()=>{
		if(!pageRef.current) return;

		// Observer for tracking pages within the `.pages` div
		const visibleObserver = new IntersectionObserver(
			(entries)=>{
				entries.forEach((entry)=>{
					if(entry.isIntersecting)
						props.onVisibilityChange(props.index + 1, true, false); // add page to array of visible pages.
					else
						props.onVisibilityChange(props.index + 1, false, false);
				}
			)},
			{ threshold: .3, rootMargin: '0px 0px 0px 0px'  } // detect when >30% of page is within bounds.
		);

		// Observer for tracking the page at the center of the iframe.
		const centerObserver = new IntersectionObserver(
			(entries)=>{
				entries.forEach((entry)=>{
					if(entry.isIntersecting)
						props.onVisibilityChange(props.index + 1, true, true); // Set this page as the center page
				}
			)},
			{ threshold: 0, rootMargin: '-50% 0px -50% 0px' } // Detect when the page is at the center
		);

		// attach observers to each `.page`
		visibleObserver.observe(pageRef.current);
		centerObserver.observe(pageRef.current);
		return ()=>{
			visibleObserver.disconnect();
			centerObserver.disconnect();
		};
	}, []);

	return <div className={props.className} id={`p${props.index + 1}`} data-index={props.index} ref={pageRef} style={props.style}>
	         <div className='columnWrapper' dangerouslySetInnerHTML={{ __html: cleanText }} />
	       </div>;
};


//v=====--------------------< Brew Renderer Component >-------------------=====v//
let renderedPages = [];
let rawPages      = [];

const BrewRenderer = (props)=>{
	props = {
		text                       : '',
		style                      : '',
		renderer                   : 'legacy',
		theme                      : '5ePHB',
		lang                       : '',
		errors                     : [],
		currentEditorCursorPageNum : 1,
		currentEditorViewPageNum   : 1,
		currentBrewRendererPageNum : 1,
		themeBundle                : {},
		onPageChange               : ()=>{},
		...props
	};

	const [state, setState] = useState({
		isMounted    : false,
		visibility   : 'hidden',
		visiblePages : [],
		centerPage   : 1
	});

	const [displayOptions, setDisplayOptions] = useState({
		zoomLevel    : 100,
		spread       : 'single',
		startOnRight : true,
		pageShadows  : true
	});

	const mainRef  = useRef(null);

	if(props.renderer == 'legacy') {
		rawPages = props.text.split('\\page');
	} else {
		rawPages = props.text.split(/^\\page$/gm);
	}

	const handlePageVisibilityChange = (pageNum, isVisible, isCenter)=>{
		setState((prevState)=>{
			const updatedVisiblePages = new Set(prevState.visiblePages);
			if(!isCenter)
				isVisible ? updatedVisiblePages.add(pageNum) : updatedVisiblePages.delete(pageNum);

			return {
				...prevState,
				visiblePages : [...updatedVisiblePages].sort((a, b)=>a - b),
				centerPage   : isCenter ? pageNum : prevState.centerPage
			};
		});

		if(isCenter)
			props.onPageChange(pageNum);
	};

	const isInView = (index)=>{
		if(!state.isMounted)
			return false;

		if(index == props.currentEditorCursorPageNum - 1)	//Already rendered before this step
			return false;

		if(Math.abs(index - props.currentBrewRendererPageNum - 1) <= 3)
			return true;

		return false;
	};

	const renderDummyPage = (index)=>{
		return <div className='phb page' id={`p${index + 1}`} key={index}>
			<i className='fas fa-spinner fa-spin' />
		</div>;
	};

	const renderStyle = ()=>{
		const themeStyles = props.themeBundle?.joinedStyles ?? '<style>@import url("/themes/V3/Blank/style.css");</style>';
		const cleanStyle = safeHTML(`${themeStyles} \n\n <style> ${props.style} </style>`);
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: cleanStyle }} />;
	};

	const renderPage = (pageText, index)=>{

		const styles = {
			...(!displayOptions.pageShadows ? { boxShadow: 'none' } : {})
			// Add more conditions as needed
		};

		if(props.renderer == 'legacy') {
			const html = MarkdownLegacy.render(pageText);

			return <BrewPage className='page phb' index={index} key={index} contents={html} style={styles} onVisibilityChange={handlePageVisibilityChange} />;
		} else {
			pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)
			const html = Markdown.render(pageText, index);

			return <BrewPage className='page' index={index} key={index} contents={html} style={styles} onVisibilityChange={handlePageVisibilityChange} />;
		}
	};

	const renderPages = ()=>{
		if(props.errors && props.errors.length)
			return renderedPages;

		if(rawPages.length != renderedPages.length) // Re-render all pages when page count changes
			renderedPages.length = 0;

		// Render currently-edited page first so cross-page effects (variables, links) can propagate out first
		if(rawPages.length > props.currentEditorCursorPageNum -1)
			renderedPages[props.currentEditorCursorPageNum - 1] = renderPage(rawPages[props.currentEditorCursorPageNum - 1], props.currentEditorCursorPageNum - 1);

		_.forEach(rawPages, (page, index)=>{
			if((isInView(index) || !renderedPages[index]) && typeof window !== 'undefined'){
				renderedPages[index] = renderPage(page, index); // Render any page not yet rendered, but only re-render those in PPR range
			}
		});
		return renderedPages;
	};

	const handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode == P_KEY && props.allowPrint) printCurrentBrew();
		if(e.keyCode == P_KEY) {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	const scrollToHash = (hash)=>{
		if(!hash) return;

		const iframeDoc = document.getElementById('BrewRenderer').contentDocument;
		let anchor = iframeDoc.querySelector(hash);

		if(anchor) {
			anchor.scrollIntoView({ behavior: 'smooth' });
		} else {
			// Use MutationObserver to wait for the element if it's not immediately available
			new MutationObserver((mutations, obs)=>{
				anchor = iframeDoc.querySelector(hash);
				if(anchor) {
					anchor.scrollIntoView({ behavior: 'smooth' });
					obs.disconnect();
				}
			}).observe(iframeDoc, { childList: true, subtree: true });
		}
	};

	const frameDidMount = ()=>{	//This triggers when iFrame finishes internal "componentDidMount"
		scrollToHash(window.location.hash);

		setTimeout(()=>{	//We still see a flicker where the style isn't applied yet, so wait 100ms before showing iFrame
			renderPages(); //Make sure page is renderable before showing
			setState((prevState)=>({
				...prevState,
				isMounted  : true,
				visibility : 'visible'
			}));
		}, 100);
	};

	const emitClick = ()=>{ // Allow clicks inside iFrame to interact with dropdowns, etc. from outside
		if(!window || !document) return;
		document.dispatchEvent(new MouseEvent('click'));
	};

	const handleDisplayOptionsChange = (newDisplayOptions)=>{
		setDisplayOptions(newDisplayOptions);
	};

	const pagesStyle = {
		zoom      : `${displayOptions.zoomLevel}%`,
		columnGap : `${displayOptions.columnGap}px`,
		rowGap    : `${displayOptions.rowGap}px`
	};

	const styleObject = {};

	if(global.config.deployment) {
		styleObject.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='200px'><text x='0' y='15' fill='%23fff7' font-size='20'>${global.config.deployment}</text></svg>")`;
	}

	const renderedStyle = useMemo(()=>renderStyle(), [props.style, props.themeBundle]);
	renderedPages = useMemo(()=>renderPages(), [props.text, displayOptions]);

	return (
		<>
			{/*render dummy page while iFrame is mounting.*/}
			{!state.isMounted
				? <div className='brewRenderer'>
					<div className='pages'>
						{renderDummyPage(1)}
					</div>
				</div>
				: null}

			<ErrorBar errors={props.errors} />
			<div className='popups' ref={mainRef}>
				<RenderWarnings />
				<NotificationPopup />
			</div>

			<ToolBar displayOptions={displayOptions} onDisplayOptionsChange={handleDisplayOptionsChange} visiblePages={displayOptions.spread !== 'single' && state.visiblePages.length > 0 ? state.visiblePages : [state.centerPage]} totalPages={rawPages.length}/>

			{/*render in iFrame so broken code doesn't crash the site.*/}
			<Frame id='BrewRenderer' initialContent={INITIAL_CONTENT}
				style={{ width: '100%', height: '100%', visibility: state.visibility }}
				contentDidMount={frameDidMount}
				onClick={()=>{emitClick();}}
			>
				<div className={`brewRenderer ${global.config.deployment && 'deployment'}`}
					onKeyDown={handleControlKeys}
					tabIndex={-1}
					style={ styleObject }
				>

					{/* Apply CSS from Style tab and render pages from Markdown tab */}
					{state.isMounted
						&&
						<>
							{renderedStyle}
							<div className={`pages ${displayOptions.startOnRight ? 'recto' : 'verso'}	${displayOptions.spread}`} lang={`${props.lang || 'en'}`} style={pagesStyle}>
								{renderedPages}
							</div>
						</>
					}
				</div>
			</Frame>
		</>
	);
};

module.exports = BrewRenderer;
