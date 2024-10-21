/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./brewRenderer.less');
const React = require('react');
const { useState, useRef, useCallback, useEffect } = React;
const _ = require('lodash');

const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
const Markdown = require('naturalcrit/markdown.js');
const ErrorBar = require('./errorBar/errorBar.jsx');
const ToolBar  = require('./toolBar/toolBar.jsx');

//TODO: move to the brew renderer
const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx');
const NotificationPopup = require('./notificationPopup/notificationPopup.jsx');
const Frame = require('react-frame-component').default;
const dedent = require('dedent-tabs').default;
const { printCurrentBrew } = require('../../../shared/helpers.js');

const DOMPurify = require('dompurify');
const purifyConfig = { FORCE_BODY: true, SANITIZE_DOM: false };

const PAGE_HEIGHT = 1056;

const INITIAL_CONTENT = dedent`
	<!DOCTYPE html><html><head>
	<link href="//use.fontawesome.com/releases/v6.5.1/css/all.css" rel="stylesheet" type="text/css" />
	<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
	<link href='/homebrew/bundle.css' type="text/css" rel='stylesheet' />
	<base target=_blank>
	</head><body style='overflow: hidden'><div></div></body></html>`;

//v=====----------------------< Brew Page Component >---------------------=====v//
const BrewPage = ({contents = '', index = 0, onVisibilityChange, onCenterPageChange, ...props})=>{
	const pageRef = useRef(null);
	const cleanText = contents; //DOMPurify.sanitize(props.contents, purifyConfig);

	useEffect(()=>{
		if(!pageRef.current) return;
		const observer = new IntersectionObserver(
			(entries)=>{
				entries.forEach((entry)=>{
					if(entry.isIntersecting){
						onVisibilityChange(index + 1, true);
					} else {
						onVisibilityChange(index + 1, false);
					}
				});
			},
			{ threshold: .3, rootMargin: '0px 0px 0px 0px'  }
		);

		// Observer for tracking the page at the center of the iframe.
		const centerObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						onCenterPageChange(index + 1); // Set this page as the center page
					}
				});
			},
			{ threshold: 0, rootMargin: '-50% 0px -50% 0px' } // Detect when the page is at the center
		);

		observer.observe(pageRef.current);
		centerObserver.observe(pageRef.current);

		return ()=>{
			observer.disconnect();
			centerObserver.disconnect();
		};
	}, [index, onVisibilityChange, onCenterPageChange]);

	return <div className={props.className} id={`p${index + 1}`} data-index={index} ref={pageRef}>
	         <div className='columnWrapper' dangerouslySetInnerHTML={{ __html: cleanText }} />
	       </div>;
};


//v=====--------------------< Brew Renderer Component >-------------------=====v//
const renderedPages = [];
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
		isMounted      : false,
		visibility     : 'hidden',
		zoom           : 100,
		visiblePages   : [],
		formattedPages : '',
		centerPage     : 1
	});
	const iframeRef = useRef(null);
	const mainRef  = useRef(null);

	if(props.renderer == 'legacy') {
		rawPages = props.text.split('\\page');
	} else {
		rawPages = props.text.split(/^\\page$/gm);
	}

	useEffect(() => {
		props.onPageChange(formatVisiblePages(state.visiblePages));
	}, [state.visiblePages]);

	const handlePageVisibilityChange = useCallback((pageNum, isVisible) => {
		setState((prevState) => {
			let updatedVisiblePages = new Set(prevState.visiblePages);
			if(isVisible){
				updatedVisiblePages.add(pageNum)
			} else {
				updatedVisiblePages.delete(pageNum)
			}
			const pages = Array.from(updatedVisiblePages);

			return { ...prevState,
				visiblePages   : _.sortBy(pages),
				formattedPages : formatVisiblePages(pages)
			};
		});
	}, []);

	const formatVisiblePages = (pages) => {
		if (pages.length === 0) return '';
	
		const sortedPages = [...pages].sort((a, b) => a - b); // Copy and sort the array
		let ranges = [];
		let start = sortedPages[0];
	
		for (let i = 1; i <= sortedPages.length; i++) {
			// If the current page is not consecutive or it's the end of the list
			if (i === sortedPages.length || sortedPages[i] !== sortedPages[i - 1] + 1) {
				// Push the range to the list
				ranges.push(
					start === sortedPages[i - 1] ? `${start}` : `${start} - ${sortedPages[i - 1]}`
				);
				start = sortedPages[i]; // Start a new range
			}
		}
	
		return ranges.join(', ');
	};

	const handleCenterPageChange = useCallback((pageNum) => {
		setState((prevState) => ({
			...prevState,
			centerPage : pageNum,
		}));
	}, []);

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
		const cleanStyle = props.style; //DOMPurify.sanitize(props.style, purifyConfig);
		const themeStyles = props.themeBundle?.joinedStyles ?? '<style>@import url("/themes/V3/Blank/style.css");</style>';
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `${themeStyles} \n\n <style> ${cleanStyle} </style>` }} />;
	};

	const renderPage = (pageText, index)=>{
		if(props.renderer == 'legacy') {
			const html = MarkdownLegacy.render(pageText);
			return <BrewPage className='page phb' index={index} key={index} contents={html} onVisibilityChange={handlePageVisibilityChange} onCenterPageChange={handleCenterPageChange}  />;
		} else {
			pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)
			const html = Markdown.render(pageText, index);
			return <BrewPage className='page' index={index} key={index} contents={html} onVisibilityChange={handlePageVisibilityChange} onCenterPageChange={handleCenterPageChange}  />;
		}
	};

	const renderPages = ()=>{
		if(props.errors && props.errors.length)
			return renderedPages;

		if(rawPages.length != renderedPages.length) // Re-render all pages when page count changes
			renderedPages.length = 0;

		// Render currently-edited page first so cross-page effects (variables, links) can propagate out first
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

	const frameDidMount = ()=>{	//This triggers when iFrame finishes internal "componentDidMount"
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

	//Toolbar settings:
	const handleZoom = (newZoom)=>{
		setState((prevState)=>({
			...prevState,
			zoom : newZoom
		}));
	};

	const styleObject = {};

	if(global.config.deployment) {
		styleObject.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='200px'><text x='0' y='15' fill='white' font-size='20'>${global.config.deployment}</text></svg>")`;
	}

	return (
		<>
			{/*render dummy page while iFrame is mounting.*/}
			{!state.isMounted
				? <div className='brewRenderer'
					// onScroll={updateCurrentPage}
				>
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

			<ToolBar onZoomChange={handleZoom} centerPage={state.centerPage} visiblePages={state.visiblePages} formattedPages={state.formattedPages} totalPages={rawPages.length}/>

			{/*render in iFrame so broken code doesn't crash the site.*/}
			<Frame id='BrewRenderer' initialContent={INITIAL_CONTENT}
				style={{ width: '100%', height: '100%', visibility: state.visibility }}
				contentDidMount={frameDidMount}
				onClick={()=>{emitClick();}}
			>
				<div className={`brewRenderer ${global.config.deployment && 'deployment'}`}
					// onScroll={updateCurrentPage}
					onKeyDown={handleControlKeys}
					tabIndex={-1}
					style={ styleObject }
				>

					{/* Apply CSS from Style tab and render pages from Markdown tab */}
					{state.isMounted
						&&
						<>
							{renderStyle()}
							<div className='pages' lang={`${props.lang || 'en'}`} style={{ zoom: `${state.zoom}%` }} 
					ref={iframeRef}>
								{renderPages()}
							</div>
						</>
					}
				</div>
			</Frame>
		</>
	);
};

module.exports = BrewRenderer;
