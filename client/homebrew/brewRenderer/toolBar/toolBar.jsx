require('./toolBar.less');
const React = require('react');
const { useState, useEffect } = React;

const maxZoom = 300;
const minZoom = 10;
const zoomStep = 10;

const ToolBar = ({ onZoomChange, currentPage, onPageChange, totalPages })=>{
	const [state, setState] = useState({
		currentPage     : currentPage,
		totalPages      : totalPages,
		zoomLevel       : 100,
		pageNumberInput : currentPage,
		zoomInput       : 100,
	});

	useEffect(()=>{
		onZoomChange(state.zoomLevel);
	}, [state.zoomLevel]);

	useEffect(()=>{
		setState((prevState)=>({
			...prevState,
			currentPage     : currentPage,
			pageNumberInput : currentPage,
		}));
	}, [currentPage]);

	const setZoomLevel = (direction)=>{
		let zoomLevel = state.zoomLevel;
		if(direction === 'in') {
			zoomLevel += zoomStep;
		} else {
			zoomLevel -= zoomStep;
		}

		setState((prevState)=>({
			...prevState,
			zoomLevel : zoomLevel,
			zoomInput : zoomLevel,
		}));
	};

	const handleInputChange = (value, type)=>{
		const newValue = parseInt(value, 10);

		if(type === 'zoom' && newValue >= minZoom && newValue <= maxZoom) {
			setState((prevState)=>({
				...prevState,
				zoomInput : newValue,
			}));
		} else if(type === 'page' && newValue >= 1 && newValue <= totalPages) {
			setState((prevState)=>({
				...prevState,
				pageNumberInput : newValue,
			}));
		}
	};

	return (
		<div className='toolBar'>
			<div className='tool'>
				<button
					onClick={()=>setZoomLevel('out')}
					disabled={state.zoomLevel <= minZoom}
				>
					<i className='fas fa-magnifying-glass-minus' />
				</button>
			</div>
			<div className='tool'>
				<input
					className='slider'
					type='range'
					name='zoom'
					list='zoomLevels'
					min={minZoom}
					max={maxZoom}
					step={zoomStep}
					value={state.zoomInput}
					// onChange={(e)=>handleInputChange(e.target.value, 'zoom')}
					onChange={(e)=>{
						const newZoomLevel = parseInt(e.target.value, 10);
						if(newZoomLevel !== state.zoomLevel) {
							setState((prevState)=>({
								...prevState,
								zoomLevel : newZoomLevel,
								zoomInput : newZoomLevel,
							}));
							onZoomChange(newZoomLevel);
						}
					}}
				/>
				<datalist id='zoomLevels'>
					<option value='100' />
				</datalist>
			</div>

			<div className='tool'>
				<button
					onClick={()=>setZoomLevel('in')}
					disabled={state.zoomLevel >= maxZoom}
				>
					<i className='fas fa-magnifying-glass-plus' />
				</button>
			</div>
			<div className='tool'>
				<button
					className='previousPage'
					onClick={()=>{
						console.log(`page is ${state.currentPage}`);
						onPageChange(state.currentPage - 2);
					}}
					disabled={state.currentPage <= 1}
				>
					<i className='fas fa-arrow-left'></i>
				</button>
			</div>

			<input
				type='number'
				name='page'
				min={1}
				max={state.totalPages}
				id='pageInput'
				value={state.pageNumberInput}
				onChange={(e)=>handleInputChange(e.target.value, 'page')}
				onBlur={(e)=>{
					parseInt(state.pageNumberInput) === state.currentPage ||
                        onPageChange(parseInt(state.pageNumberInput) - 1);
				}}
				onKeyPress={(e)=>{
					if(e.key === 'Enter') {
						e.target.blur();
					}
				}}
			/>

			<div className='tool'>
				<button
					className='nextPage'
					onClick={()=>{
						console.log(
							`page is ${state.currentPage} and i move to ${state.currentPage}`
						);
						onPageChange(state.currentPage);
					}}
					disabled={state.currentPage >= state.totalPages}
				>
					<i className='fas fa-arrow-right'></i>
				</button>
			</div>
		</div>
	);
};

module.exports = ToolBar;
