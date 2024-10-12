require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;
const _ = require('lodash');

import AnchoredBox from '../../../components/anchoredBox.jsx';
// import * as ZoomIcons from '../../../icons/icon-components/zoomIcons.jsx';

const MAX_ZOOM = 300;
const MIN_ZOOM = 10;

const ToolBar = ({ onZoomChange, currentPage, onPageChange, totalPages, onStyleChange })=>{

	const [zoomLevel, setZoomLevel] = useState(100);
	const [pageNum, setPageNum] = useState(currentPage);
	const [arrangement, setArrangement] = useState('single');
	const [startOnRight, setStartOnRight] = useState(true);
	const [pageShadows, setPageShadows] = useState(true);
	const [pagesStyle, setPagesStyle] = useState({});
	const [toolsVisible, setToolsVisible] = useState(true);
	const modes = ['single', 'facing', 'flow'];

	useEffect(()=>{
		onZoomChange(zoomLevel);
	}, [zoomLevel]);

	useEffect(()=>{
		setPageNum(currentPage);
	}, [currentPage]);;

	// update display arrangement when arrangement state is changed.
	// todo: do this the 'react' way, without querying the dom.
	useEffect(()=>{
		const iframe = document.getElementById('BrewRenderer');
		const pagesContainer = iframe?.contentWindow?.document.querySelector('.pages');

		if(pagesContainer) {
			modes.forEach((mode)=>pagesContainer.classList.remove(mode));
			pagesContainer.classList.add(arrangement);
			['recto', 'verso'].forEach((leaf)=>pagesContainer.classList.remove(leaf));
			pagesContainer.classList.add(startOnRight ? 'recto' : 'verso');
		}
	}, [arrangement, startOnRight]);

	useEffect(()=>{
		onStyleChange({ '.page': pageShadows ? {} : { boxShadow: 'none' } });
	}, [pageShadows]);


	const handleZoomButton = (zoom)=>{
		setZoomLevel(_.round(_.clamp(zoom, MIN_ZOOM, MAX_ZOOM)));
	};

	const handlePageInput = (pageInput)=>{
		if(/[0-9]/.test(pageInput))
			setPageNum(parseInt(pageInput)); // input type is 'text', so `page` comes in as a string, not number.
	};

	const scrollToPage = (pageNumber)=>{
		pageNumber = _.clamp(pageNumber, 1, totalPages);
		const iframe = document.getElementById('BrewRenderer');
		const brewRenderer = iframe?.contentWindow?.document.querySelector('.brewRenderer');
		const page = brewRenderer?.querySelector(`#p${pageNumber}`);
		page?.scrollIntoView({ block: 'start' });
		setPageNum(pageNumber);
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

			desiredZoom = (iframeWidth / widestPage) * 100;

		} else if(mode == 'fit'){
			// find the page with the largest single dim (height or width) so that zoom can be adapted to fit it.
			const minDimRatio = [...pages].reduce((minRatio, page)=>Math.min(minRatio, iframeWidth / page.offsetWidth, iframeHeight / page.offsetHeight), Infinity);

			desiredZoom = minDimRatio * 100;
		}

		const margin = 5;  // extra space so page isn't edge to edge (not truly "to fill")

		const deltaZoom = (desiredZoom - zoomLevel) - margin;
		return deltaZoom;
	};

	const setBookMode = (view)=>{
		// const nextMode = modes[(modes.indexOf(arrangement) + 1) % modes.length];
		setArrangement(view);
	};

	return (
		<div className={`toolBar ${toolsVisible ? 'visible' : 'hidden'}`} role='toolbar'>
			<button className='toggleButton' title={`${toolsVisible ? 'Hide' : 'Show'} Preview Toolbar`} onClick={()=>{setToolsVisible(!toolsVisible);}}><i className='fas fa-glasses' /></button>
			{/*v=====----------------------< Zoom Controls >---------------------=====v*/}
			<div className='group'>
				<button
					id='fill-width'
					className='tool'
					onClick={()=>handleZoomButton(zoomLevel + calculateChange('fill'))}
				>
					<i className='fac fit-width' />
				</button>
				<button
					id='zoom-to-fit'
					className='tool'
					onClick={()=>handleZoomButton(zoomLevel + calculateChange('fit'))}
				>
					<i className='fac zoom-to-fit' />
				</button>
				<button
					id='zoom-out'
					className='tool'
					onClick={()=>handleZoomButton(zoomLevel - 20)}
					disabled={zoomLevel <= MIN_ZOOM}
				>
					<i className='fas fa-magnifying-glass-minus' />
				</button>
				<input
					id='zoom-slider'
					className='range-input tool hover-tooltip'
					type='range'
					name='zoom'
					list='zoomLevels'
					min={MIN_ZOOM}
					max={MAX_ZOOM}
					step='1'
					value={zoomLevel}
					onChange={(e)=>handleZoomButton(parseInt(e.target.value))}
				/>
				<datalist id='zoomLevels'>
					<option value='100' />
				</datalist>

				<button
					id='zoom-in'
					className='tool'
					onClick={()=>handleZoomButton(zoomLevel + 20)}
					disabled={zoomLevel >= MAX_ZOOM}
				>
					<i className='fas fa-magnifying-glass-plus' />
				</button>
			</div>

			{/*v=====----------------------< Page Controls >---------------------=====v*/}
			<div className='group'>
				<div className='radio-group' role='group'>
					<button role='radio'
						id='single-view'
						className={`tool${arrangement === 'single' && ' active'}`}
						title='Single Page'
						onClick={()=>setBookMode('single')}
					><i className='fac single-view-alt' /></button>
					<button role='radio'
						id='facing-view'
						className={`tool${arrangement === 'facing' && ' active'}`}
						title='Facing Pages'
						onClick={()=>setBookMode('facing')}
					><i className='fac facing-view-alt' /></button>
					<button role='radio'
						id='flow-view'
						className={`tool${arrangement === 'flow' && ' active'}`}
						title='Flow Pages'
						onClick={()=>setBookMode('flow')}
					><i className='fac flow-view-alt' /></button>

				</div>
				<AnchoredBox id='view-mode-options' className='tool' title='Options'>
					<label title='Modify the horizontal space between pages.'>Column gap<input type='range' min={0} max={200} defaultValue={10} className='range-input' onChange={(evt)=>onStyleChange({ '.pages': { columnGap: `${evt.target.value}px` }})} /></label>
					<label title='Modify the vertical space between rows of pages.'>Row gap<input type='range' min={0} max={200} defaultValue={10} className='range-input' onChange={(evt)=>onStyleChange({ '.pages': { rowGap: `${evt.target.value}px` } })} /></label>
					<label title='Start 1st page on the right side, such as if you have cover page.'>Start on right
						<input type='checkbox'
							onChange={()=>setStartOnRight(!startOnRight)}
							checked={startOnRight}
							title={arrangement !== 'facing' ? 'Switch to Facing to enable toggle.' : null} />
					</label>
					<label title='Remove the page shadow from every page.'>Page shadow<input type='checkbox' checked={pageShadows} onChange={()=>setPageShadows(!pageShadows)} /></label>
				</AnchoredBox>
			</div>

			<div className='group'>
				<button
					id='previous-page'
					className='previousPage tool'
					onClick={()=>scrollToPage(pageNum - 1)}
					disabled={pageNum <= 1}
				>
					<i className='fas fa-arrow-left'></i>
				</button>

				<div className='tool'>
					<input
						id='page-input'
						className='text-input'
						type='text'
						name='page'
						inputMode='numeric'
						pattern='[0-9]'
						value={pageNum}
						onClick={(e)=>e.target.select()}
						onChange={(e)=>handlePageInput(e.target.value)}
						onBlur={()=>scrollToPage(pageNum)}
						onKeyDown={(e)=>e.key == 'Enter' && scrollToPage(pageNum)}
					/>
					<span id='page-count'>/ {totalPages}</span>
				</div>

				<button
					id='next-page'
					className='tool'
					onClick={()=>scrollToPage(pageNum + 1)}
					disabled={pageNum >= totalPages}
				>
					<i className='fas fa-arrow-right'></i>
				</button>
			</div>
		</div>
	);
};

module.exports = ToolBar;
