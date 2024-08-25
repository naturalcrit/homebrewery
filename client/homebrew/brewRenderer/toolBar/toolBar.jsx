require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;
const _ = require('lodash');

const MAX_ZOOM = 300;
const MIN_ZOOM = 10;

const ToolBar = ({ onZoomChange, currentPage, onPageChange, totalPages })=>{

	const [zoomLevel, setZoomLevel] = useState(100);
	const [pageNum, setPageNum]     = useState(currentPage);

	useEffect(()=>{
		onZoomChange(zoomLevel);
	}, [zoomLevel]);

	useEffect(()=>{
		setPageNum(currentPage);
	}, [currentPage]);

	const handleZoomButton = (delta)=>{
		setZoomLevel(_.clamp(zoomLevel + delta, MIN_ZOOM, MAX_ZOOM));
	};

	const handlePageInput = (pageInput)=>{
		if(/[0-9]/.test(pageInput))
			setPageNum(parseInt(pageInput)); // input type is 'text', so `page` comes in as a string, not number.
	};

	const scrollToPage = (pageNumber)=>{
		pageNumber = _.clamp(pageNumber, 1, totalPages);
		const iframe = document.getElementById('BrewRenderer');
		const brewRenderer = iframe?.contentWindow?.document.querySelector('.brewRenderer');
		const page = brewRenderer?.querySelector(`#p${pageNumber}`)
		page?.scrollIntoView({ block: 'start' });
		setPageNum(pageNumber);
	};

	return (
		<div className='toolBar'>
			{/*v=====----------------------< Zoom Controls >---------------------=====v*/}
			<div className='group'>
				<button
					id='zoom-out'
					className='tool'
					onClick={()=>handleZoomButton(-20)}
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
					onChange={(e) => setZoomLevel(parseInt(e.target.value))}
				/>
				<datalist id='zoomLevels'>
					<option value='100' />
				</datalist>

				<button
					id='zoom-in'
					className='tool'
					onClick={()=>handleZoomButton(20)}
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
						onClick={(e) => e.target.select()}
						onChange={(e)=>handlePageInput(e.target.value)}
						onBlur={()=>scrollToPage(pageNum)}
						onKeyDown={(e) => e.key == 'Enter' && scrollToPage(pageNum)}
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
