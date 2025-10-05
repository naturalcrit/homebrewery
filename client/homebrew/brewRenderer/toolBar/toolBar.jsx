/* eslint-disable max-lines */
require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;
const _ = require('lodash');

import { Anchored, AnchoredBox, AnchoredTrigger } from '../../../components/Anchored.jsx';

const MAX_ZOOM = 300;
const MIN_ZOOM = 10;

const TOOLBAR_VISIBILITY = 'HB_renderer_toolbarVisibility';

const ToolBar = ({ displayOptions, onDisplayOptionsChange, visiblePages, totalPages, headerState, setHeaderState })=>{

	const [pageNum, setPageNum]     = useState(1);
	const [toolsVisible, setToolsVisible] = useState(true);

	useEffect(()=>{
		// format multiple visible pages as a range (e.g. "150-153")
		const pageRange = visiblePages.length === 1 ? `${visiblePages[0]}` : `${visiblePages[0]} - ${visiblePages.at(-1)}`;
		setPageNum(pageRange);
	}, [visiblePages]);

	useEffect(()=>{
		const Visibility = localStorage.getItem(TOOLBAR_VISIBILITY);
		if(Visibility) setToolsVisible(Visibility === 'true');

	}, []);

	const handleZoomButton = (zoom)=>{
		handleOptionChange('zoomLevel', _.round(_.clamp(zoom, MIN_ZOOM, MAX_ZOOM)));
	};

	const handleOptionChange = (optionKey, newValue)=>{
		onDisplayOptionsChange({ ...displayOptions, [optionKey]: newValue });
	};

	const handlePageInput = (pageInput)=>{
		if(/[0-9]/.test(pageInput))
			setPageNum(parseInt(pageInput)); // input type is 'text', so `page` comes in as a string, not number.
	};

	// scroll to a page, used in the Prev/Next Page buttons.
	const scrollToPage = (pageNumber)=>{
		if(typeof pageNumber !== 'number') return;
		pageNumber = _.clamp(pageNumber, 1, totalPages);
		const iframe = document.getElementById('BrewRenderer');
		const brewRenderer = iframe?.contentWindow?.document.querySelector('.brewRenderer');
		const page = brewRenderer?.querySelector(`#p${pageNumber}`);
		page?.scrollIntoView({ block: 'start' });
	};

	const calculateChange = (mode)=>{
		const iframe = document.getElementById('BrewRenderer');
		const iframeWidth = iframe.getBoundingClientRect().width;
		const iframeHeight = iframe.getBoundingClientRect().height;
		const pages = iframe.contentWindow.document.getElementsByClassName('page');

		let desiredZoom = 0;

		if(mode == 'fill'){
			// find widest page, in case pages are different widths, so that the zoom is adapted to not cut the widest page off screen.
			const widestPage = _.maxBy([...pages], 'offsetWidth').offsetWidth;

			if(displayOptions.spread === 'facing')
				desiredZoom = (iframeWidth / ((widestPage * 2) + parseInt(displayOptions.columnGap))) * 100;
			else
				desiredZoom = (iframeWidth / (widestPage + 20)) * 100;

		} else if(mode == 'fit'){
			// find the page with the largest single dim (height or width) so that zoom can be adapted to fit it.
			let minDimRatio;
			if(displayOptions.spread === 'single')
				minDimRatio = [...pages].reduce(
					(minRatio, page)=>Math.min(minRatio,
						iframeWidth / page.offsetWidth,
						iframeHeight / page.offsetHeight
					),
					Infinity
				);
			else
				minDimRatio = [...pages].reduce(
					(minRatio, page)=>Math.min(minRatio,
						iframeWidth / ((page.offsetWidth * 2) + parseInt(displayOptions.columnGap)),
						iframeHeight / page.offsetHeight
					),
					Infinity
				);

			desiredZoom = minDimRatio * 100;
		}

		const margin = 5;  // extra space so page isn't edge to edge (not truly "to fill")

		const deltaZoom = (desiredZoom - displayOptions.zoomLevel) - margin;
		return deltaZoom;
	};

	return (
		<div id='preview-toolbar' className={`toolBar ${toolsVisible ? 'visible' : 'hidden'}`} role='toolbar'>
			<div className='toggleButton'>
				<button title={`${toolsVisible ? 'Hide' : 'Show'} Preview Toolbar`} onClick={()=>{
					setToolsVisible(!toolsVisible);
					localStorage.setItem(TOOLBAR_VISIBILITY, !toolsVisible);
				}}><i className='fas fa-glasses' /></button>
				<button title={`${headerState ? 'Hide' : 'Show'} Header Navigation`} onClick={()=>{setHeaderState(!headerState);}}><i className='fas fa-rectangle-list' /></button>
			</div>
			{/*v=====----------------------< Zoom Controls >---------------------=====v*/}
			<div className='group' role='group' aria-label='Zoom' aria-hidden={!toolsVisible}>
				<button
					id='fill-width'
					className='tool'
					title='Set zoom to fill preview with one page'
					onClick={()=>handleZoomButton(displayOptions.zoomLevel + calculateChange('fill'))}
				>
					<i className='fac fit-width' />
				</button>
				<button
					id='zoom-to-fit'
					className='tool'
					title='Set zoom to fit entire page in preview'
					onClick={()=>handleZoomButton(displayOptions.zoomLevel + calculateChange('fit'))}
				>
					<i className='fac zoom-to-fit' />
				</button>
				<button
					id='zoom-out'
					className='tool'
					onClick={()=>handleZoomButton(displayOptions.zoomLevel - 20)}
					disabled={displayOptions.zoomLevel <= MIN_ZOOM}
					title='Zoom Out'
				>
					<i className='fas fa-magnifying-glass-minus' />
				</button>
				<input
					id='zoom-slider'
					className='range-input tool hover-tooltip'
					type='range'
					name='zoom'
					title='Set Zoom'
					list='zoomLevels'
					min={MIN_ZOOM}
					max={MAX_ZOOM}
					step='1'
					value={displayOptions.zoomLevel}
					onChange={(e)=>handleZoomButton(parseInt(e.target.value))}
				/>
				<datalist id='zoomLevels'>
					<option value='100' />
				</datalist>

				<button
					id='zoom-in'
					className='tool'
					onClick={()=>handleZoomButton(displayOptions.zoomLevel + 20)}
					disabled={displayOptions.zoomLevel >= MAX_ZOOM}
					title='Zoom In'
				>
					<i className='fas fa-magnifying-glass-plus' />
				</button>
			</div>

			{/*v=====----------------------< Spread Controls >---------------------=====v*/}
			<div className='group' role='group' aria-label='Spread' aria-hidden={!toolsVisible}>
				<div className='radio-group' role='radiogroup'>
					<button role='radio'
						id='single-spread'
						className='tool'
						title='Single Page'
						onClick={()=>{handleOptionChange('spread', 'single');}}
						aria-checked={displayOptions.spread === 'single'}
					><i className='fac single-spread' /></button>
					<button role='radio'
						id='facing-spread'
						className='tool'
						title='Facing Pages'
						onClick={()=>{handleOptionChange('spread', 'facing');}}
						aria-checked={displayOptions.spread === 'facing'}
					><i className='fac facing-spread' /></button>
					<button role='radio'
						id='flow-spread'
						className='tool'
						title='Flow Pages'
						onClick={()=>{handleOptionChange('spread', 'flow');}}
						aria-checked={displayOptions.spread === 'flow'}
					><i className='fac flow-spread' /></button>

				</div>
				<Anchored>
					<AnchoredTrigger id='spread-settings' className='tool' title='Spread options'><i className='fas fa-gear' /></AnchoredTrigger>
					<AnchoredBox title='Options'>
						<h1>Options</h1>
						<label title='Modify the horizontal space between pages.'>
							Column gap
							<input type='range' min={0} max={200} defaultValue={displayOptions.columnGap || 10} className='range-input' onChange={(evt)=>handleOptionChange('columnGap', evt.target.value)} />
						</label>
						<label title='Modify the vertical space between rows of pages.'>
							Row gap
							<input type='range' min={0} max={200} defaultValue={displayOptions.rowGap || 10} className='range-input' onChange={(evt)=>handleOptionChange('rowGap', evt.target.value)} />
						</label>
						<label title='Start 1st page on the right side, such as if you have cover page.'>
							Start on right
							<input type='checkbox' checked={displayOptions.startOnRight} onChange={()=>{handleOptionChange('startOnRight', !displayOptions.startOnRight);}}
								title={displayOptions.spread !== 'facing' ? 'Switch to Facing to enable toggle.' : null} />
						</label>
						<label title='Toggle the page shadow on every page.'>
							Page shadows
							<input type='checkbox' checked={displayOptions.pageShadows} onChange={()=>{handleOptionChange('pageShadows', !displayOptions.pageShadows);}} />
						</label>
					</AnchoredBox>
				</Anchored>
			</div>

			{/*v=====----------------------< Page Controls >---------------------=====v*/}
			<div className='group' role='group'  aria-label='Pages' aria-hidden={!toolsVisible}>
				<button
					id='previous-page'
					className='previousPage tool'
					type='button'
					title='Previous Page(s)'
					onClick={()=>scrollToPage(_.min(visiblePages) - visiblePages.length)}
					disabled={visiblePages.includes(1)}
				>
					<i className='fas fa-arrow-left'></i>
				</button>

				<div className='tool'>
					<input
						id='page-input'
						className='text-input'
						type='text'
						name='page'
						title='Current page(s) in view'
						inputMode='numeric'
						pattern='[0-9]'
						value={pageNum}
						onClick={(e)=>e.target.select()}
						onChange={(e)=>handlePageInput(e.target.value)}
						onBlur={()=>scrollToPage(pageNum)}
						onKeyDown={(e)=>e.key == 'Enter' && scrollToPage(pageNum)}
						style={{ width: `${pageNum.length}ch` }}
					/>
					<span id='page-count' title='Total Page Count'>/ {totalPages}</span>
				</div>

				<button
					id='next-page'
					className='tool'
					type='button'
					title='Next Page(s)'
					onClick={()=>scrollToPage(_.max(visiblePages) + 1)}
					disabled={visiblePages.includes(totalPages)}
				>
					<i className='fas fa-arrow-right'></i>
				</button>
			</div>
		</div>
	);
};

module.exports = ToolBar;
