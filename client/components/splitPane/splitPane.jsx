// currently a SplitPane must only have two children.

require('./splitPane.less');
const React = require('react');
const { useState, useEffect } = React;
import Button from 'client/components/Button.jsx';

const storageKey = 'naturalcrit-pane-split';

const SplitPane = ({ onDragFinish= ()=>{}, paneOrder = [0, 1], dividerButtons = [], ...props })=>{

	const [isDragging, setIsDragging] = useState(false);
	const [dividerPos, setDividerPos] = useState(null);
	const [dragStartTime, setDragStartTime] = useState(0);
  	const [dragStartPos, setDragStartPos] = useState(0);
  	const [lastWidth, setLastWidth] = useState(null);
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(()=>{
		const savedPos = window.localStorage.getItem(storageKey);
		setDividerPos(savedPos ? limitPosition(savedPos, 0.1 * (window.innerWidth - 4), 0.9 * (window.innerWidth - 13)) : window.innerWidth / 2);
		setWindowWidth(window.innerWidth);

		const handleWindowResize = ()=>{
			setWindowWidth(window.innerWidth);
			handleResize();
		};

		window.addEventListener('resize', handleWindowResize);
		return ()=>window.removeEventListener('resize', handleWindowResize);
	}, []);

	const limitPosition = (x, min = 1, max = window.innerWidth - 4)=>Math.round(Math.min(max, Math.max(min, x)));

	//when resizing, the divider should grow smaller if less space is given, then grow back if the space is restored, to the original position
	const handleResize = ()=>setDividerPos(limitPosition(window.localStorage.getItem(storageKey), 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)));

	const handleUp =(e)=>{
		e.preventDefault();
		if(isDragging) {
			const dragTime = Date.now() - dragStartTime;
			const dragDistance = Math.abs(e.pageX - dragStartPos);

			if(dragTime < 200 && dragDistance < 5 && (e.target.closest('#split-pane-tools') == null)){
				if(dividerPos < 50){
					setDividerPos(limitPosition(lastWidth) || window.innerWidth / 2);
				} else {
          			setLastWidth(dividerPos);
					setDividerPos(limitPosition(0));
				}
			}
			onDragFinish(dividerPos);
			window.localStorage.setItem(storageKey, dividerPos);
		}
		setIsDragging(false);
	};

	const handleDown = (e)=>{
		e.preventDefault();
    	e.target.setPointerCapture(e.pointerId);
		setIsDragging(true);
		setDragStartTime(Date.now());
		setDragStartPos(e.pageX);
	};

	const handleMove = (e)=>{
		if(!isDragging) return;
		e.preventDefault();
		setDividerPos(limitPosition(e.pageX));
	};

	const handleSwapClick = ()=>{
		if(props.setPaneOrder) {
			const newOrder = [paneOrder[1], paneOrder[0]];
			props.setPaneOrder(newOrder);
		}
	};

	const onRightEdge = ()=>{
		return dividerPos > (windowWidth - 16);
	};

	const  renderSplitPaneTools = ()=>{
		return (
			<div id='split-pane-tools'>
				{dividerButtons && dividerButtons.map((button, i)=>{
					return React.isValidElement(button) ?
						button :
						<Button
							key={i}
							iconOnly
							icon={button.icon}
							tooltipDirection={['right']}
							onClick={button.onClick}
						>
							{button.tooltip}
						</Button>;
				})}
				<Button id='swap-panes'
					tooltipDirection={['right']}
					iconOnly
					icon='fas fa-arrow-right-arrow-left'
					onClick={handleSwapClick}>
						Swap Panes
				</Button>
			</div>

		);
	};

	const renderDivider = (
		<div className={`divider${isDragging ? ' dragging' : ''}${onRightEdge() ? ' on-right-edge' : ''}`} onPointerDown={handleDown}>
			<div id='flip-box'>
				{renderSplitPaneTools()}
				<div className={`dots`}>
					<i className='fas fa-grip-vertical' />
				</div>
			</div>
		</div>
	);

	const children = React.Children.toArray(props.children);

	return (
		<div className='splitPane' onPointerMove={handleMove} onPointerUp={handleUp}>
			<Pane key={`pane-${paneOrder[0]}`} width={dividerPos}>
				{children[paneOrder[0]]}
			</Pane>
			{renderDivider}
			<Pane key={`pane-${paneOrder[1]}`}isDragging={isDragging}>
				{children[paneOrder[1]]}
			</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, ...props })=>{
	const styles = width
		? { flex: 'none', width: `${width}px` }
		: { pointerEvents: isDragging ? 'none' : 'auto' }; //Disable mouse capture in the right pane; else dragging into the iframe drops the divider

	return (
		<div className='pane' style={styles}>
			{children}
		</div>
	);
};

module.exports = { SplitPane, Pane };
