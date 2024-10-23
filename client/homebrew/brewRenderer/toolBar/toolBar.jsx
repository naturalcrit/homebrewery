require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;
const _ = require('lodash');


const MAX_ZOOM = 300;
const MIN_ZOOM = 10;

const ToolBar = ({ onZoomChange, visiblePages, totalPages })=>{

	const [zoomLevel, setZoomLevel] = useState(100);
	const [pageNum, setPageNum]     = useState(1);
	const [toolsVisible, setToolsVisible] = useState(true);

	useEffect(()=>{
		if(visiblePages.length !== 0){   // If zoomed in enough, it's possible that no page fits the intersection criteria, so don't update.
			setPageNum(formatVisiblePages(visiblePages));
		}
	}, [visiblePages]);

	useEffect(()=>{
		onZoomChange(zoomLevel);
	}, [zoomLevel]);

	const handleZoomButton = (zoom)=>{
		setZoomLevel(_.round(_.clamp(zoom, MIN_ZOOM, MAX_ZOOM)));
	};

	const handlePageInput = (pageInput)=>{
		console.log(pageInput);
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

	// format the visible pages to work with ranges, including separate ranges ("2-7, 10-15")
	const formatVisiblePages = (pages)=>{
		if(pages.length === 0) return '';

		const sortedPages = [...pages].sort((a, b)=>a - b); // Copy and sort the array
		const ranges = [];
		let start = sortedPages[0];

		for (let i = 1; i <= sortedPages.length; i++) {
			// If the current page is not consecutive or it's the end of the list
			if(i === sortedPages.length || sortedPages[i] !== sortedPages[i - 1] + 1) {
				// Push the range to the list
				ranges.push(
					start === sortedPages[i - 1] ? `${start}` : `${start} - ${sortedPages[i - 1]}`
				);
				start = sortedPages[i]; // Start a new range
			}
		}

		return ranges.join(', ');
	};

	return (
		<div className={`toolBar ${toolsVisible ? 'visible' : 'hidden'}`}>
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
					className='range-input tool'
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
				<button
					id='previous-page'
					className='previousPage tool'
					onClick={()=>{
						const rangeOffset = visiblePages.length > 1 ? 1 : 0;
						scrollToPage(_.min(visiblePages) - visiblePages.length + rangeOffset);
					}}
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
						value={`${pageNum}`}
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
					onClick={()=>{
						const rangeOffset = visiblePages.length > 1 ? 0 : 1;
						scrollToPage(_.max(visiblePages) + rangeOffset);
					}}
					disabled={pageNum >= totalPages}
				>
					<i className='fas fa-arrow-right'></i>
				</button>
			</div>
		</div>
	);
};

module.exports = ToolBar;
