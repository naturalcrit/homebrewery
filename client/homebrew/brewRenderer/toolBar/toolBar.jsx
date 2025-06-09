/* eslint-disable max-lines */
require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;
const _ = require('lodash');

import { Anchored, AnchoredBox, AnchoredTrigger } from '../../../components/Anchored.jsx';
const { Menubar, MenuItem, MenuSection } = require('../../../components/menubar/Menubar.jsx');

const MAX_ZOOM = 300;
const MIN_ZOOM = 10;

const ToolBar = ({ displayOptions, onDisplayOptionsChange, visiblePages, totalPages, headerState, setHeaderState, scrollToHash })=>{

	const [pageNum, setPageNum]     = useState(1);
	const [toolsVisible, setToolsVisible] = useState(true);

	useEffect(()=>{
		console.log('toolbar loaded')
	}, []);

	useEffect(()=>{
		// format multiple visible pages as a range (e.g. "150-153")
		const pageRange = visiblePages.length === 1 ? `${visiblePages[0]}` : `${visiblePages[0]} - ${visiblePages.at(-1)}`;
		setPageNum(pageRange);
	}, [visiblePages]);

	useEffect(()=>{
		const visibility = localStorage.getItem('hb_toolbarVisibility') === 'true';
		setToolsVisible(visibility);
	}, []);

	const handleZoomButton = (zoom)=>{
		handleOptionChange('zoomLevel', _.round(_.clamp(zoom, MIN_ZOOM, MAX_ZOOM)));
	};

	const handleOptionChange = (optionKey, newValue)=>{
		onDisplayOptionsChange({ ...displayOptions, [optionKey]: newValue });
	};

	const handlePageInput = (pageInput)=>{
		if(pageInput == ''){
			setPageNum('');
			return;
		};
		if(/[0-9]/.test(pageInput))
			setPageNum(parseInt(pageInput)); // input type is 'text', so `page` comes in as a string, not number.
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
			if(displayOptions.spread === 'facing'){
				minDimRatio = [...pages].reduce(
					(minRatio, page)=>Math.min(minRatio,
						iframeWidth / page.offsetWidth,
						iframeHeight / page.offsetHeight
					),
					Infinity
				);
				console.log('facing minDimRatio: ', minDimRatio);
			} else {
				console.log(displayOptions.columnGap)
				minDimRatio = [...pages].reduce(
					(minRatio, page)=>Math.min(minRatio,
						iframeWidth / ((page.offsetWidth) + parseInt(displayOptions.columnGap)),
						iframeHeight / page.offsetHeight
					),
					Infinity
				);
				console.log('minDimRation: ', minDimRatio);
			}

			desiredZoom = minDimRatio * 100;
		}

		const margin = 5;  // extra space so page isn't edge to edge (not truly "to fill")

		const deltaZoom = (desiredZoom - displayOptions.zoomLevel) - margin;
		return deltaZoom;
	};

	const renderToggleMenuDot = ()=>{
		return (
			<Menubar id='preview-toolbar-dot'>
				<MenuSection role='group' aria-label='Toggles'>
					<MenuItem icon='fas fa-glasses' title={`${toolsVisible ? 'Hide' : 'Show'} Preview Toolbar`} onClick={()=>{setToolsVisible(!toolsVisible);localStorage.setItem('hb_toolbarVisibility', !toolsVisible)}}>{toolsVisible ? 'Hide toolbar' : 'Show toolbar'}</MenuItem>
					<MenuItem icon='fas fa-rectangle-list' title={`${headerState ? 'Hide' : 'Show'} Header Navigation`} onClick={()=>{setHeaderState(!headerState);}}>{headerState ? 'Hide header navigation' : 'Show header navigation'}</MenuItem>
				</MenuSection>
			</Menubar>
		);
	};

	return (
		<>
			{toolsVisible ? <Menubar id='preview-toolbar' className={`toolBar ${toolsVisible ? 'visible' : 'hidden'}`} role='toolbar'>
				<MenuSection id='preview-toggles' role='group' aria-label='UI Toggles' aria-hidden={!toolsVisible}>
					<MenuItem icon='fas fa-glasses' title={`${toolsVisible ? 'Hide' : 'Show'} Preview Toolbar`} onClick={()=>{setToolsVisible(!toolsVisible);localStorage.setItem('hb_toolbarVisibility', !toolsVisible)}}>{toolsVisible ? 'Hide toolbar' : 'Show toolbar'}</MenuItem>
					<MenuItem icon='fas fa-rectangle-list' title={`${headerState ? 'Hide' : 'Show'} Header Navigation`} onClick={()=>{setHeaderState(!headerState);}}>{headerState ? 'Hide header navigation' : 'Show header navigation'}</MenuItem>
				</MenuSection>
				

				{/*v=====----------------------< Spread Controls >---------------------=====v*/}
				<MenuSection role='group' aria-label='Spread' aria-hidden={!toolsVisible}>
					<div className='radio-group' role='radiogroup'>
						<MenuItem role='radio'
							id='single-spread'
							icon='fac single-spread'
							title='Single Page'
							onClick={()=>{handleOptionChange('spread', 'single');}}
							aria-checked={displayOptions.spread === 'single' || 'single'}
						>Single Spread</MenuItem>
						<MenuItem role='radio'
							id='facing-spread'
							icon='fac facing-spread'
							title='Facing Pages'
							onClick={()=>{handleOptionChange('spread', 'facing');}}
							aria-checked={displayOptions.spread === 'facing'}
						>Facing Spread</MenuItem>
						<MenuItem role='radio'
							id='flow-spread'
							icon='fac flow-spread'
							title='Flow Pages'
							onClick={()=>{handleOptionChange('spread', 'flow');}}
							aria-checked={displayOptions.spread === 'flow'}
						>Flow Spreads</MenuItem>

					</div>
					<Anchored>
						<AnchoredTrigger id='spread-settings' title='Spread options' className='menu-item'><i className='fas fa-gear' /></AnchoredTrigger>
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
				</MenuSection>

				{/*v=====----------------------< Zoom Controls >---------------------=====v*/}
				<MenuSection role='group' aria-label='Zoom' aria-hidden={!toolsVisible}>
					<MenuItem
						id='fill-width'
						icon='fac fit-width'
						title='Set zoom to fill preview with one page'
						onClick={()=>handleZoomButton(displayOptions.zoomLevel + calculateChange('fill'))}
					>Fill to Pane Width</MenuItem>
					<MenuItem
						id='zoom-to-fit'
						icon='fac zoom-to-fit'
						title='Set zoom to fit entire page in preview'
						onClick={()=>handleZoomButton(displayOptions.zoomLevel + calculateChange('fit'))}
					>Zoom To Fit Page</MenuItem>
					<MenuItem
						id='zoom-out'
						icon='fas fa-magnifying-glass-minus'
						onClick={()=>handleZoomButton(displayOptions.zoomLevel - 20)}
						disabled={displayOptions.zoomLevel <= MIN_ZOOM}
						title='Zoom Out'
					>Zoom Out</MenuItem>
					<MenuItem
						id='zoom-slider'
						className='range-input hover-tooltip'
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

					<MenuItem
						id='zoom-in'
						icon='fas fa-magnifying-glass-plus'
						onClick={()=>handleZoomButton(displayOptions.zoomLevel + 20)}
						disabled={displayOptions.zoomLevel >= MAX_ZOOM}
						title='Zoom In'
					>Zoom In</MenuItem>
				</MenuSection>

				{/*v=====----------------------< Page Controls >---------------------=====v*/}
				<MenuSection role='group'  aria-label='Pages' aria-hidden={!toolsVisible}>
					<MenuItem
						id='previous-page'
						className='previousPage'
						icon='fas fa-arrow-left'
						type='button'
						title='Previous Page(s)'
						onClick={()=>scrollToHash(`#p${_.min(visiblePages) - visiblePages.length}`)}
						disabled={visiblePages.includes(1)}
					>Previous Page</MenuItem>

					<MenuItem
						id='page-input'
						className='text-input inline-grid'
						type='text'
						name='page'
						title='Current page(s) in view'
						inputMode='numeric'
						pattern='[0-9]'
						value={pageNum}
						onClick={(e)=>e.target.select()}
						onChange={(e)=>handlePageInput(e.target.value)}
						onBlur={()=>{scrollToHash(`#p${pageNum}`);}}
						onKeyDown={(e)=>e.key == 'Enter' && scrollToHash(`#p${pageNum}`)}
						style={{ width: `${pageNum.length}ch` }}
						autoComplete='off'
					>Current Page</MenuItem>
					<span id='page-count' title='Total Page Count'>/ {totalPages}</span>

					<MenuItem
						id='next-page'
						icon='fas fa-arrow-right'
						type='button'
						title='Next Page(s)'
						onClick={()=>scrollToHash(`#p${_.max(visiblePages) + 1}`)}
						disabled={visiblePages.includes(totalPages)}
					>Next Page</MenuItem>
				</MenuSection>
			</Menubar> : renderToggleMenuDot()}
		</>
		
	);
};

module.exports = ToolBar;
