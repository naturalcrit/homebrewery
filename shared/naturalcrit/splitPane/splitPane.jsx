require('./splitPane.less');
const React = require('react');
const { useState, useEffect } = React;
import Button from 'client/components/Button.jsx';

const storageKey = 'naturalcrit-pane-split';

const SplitPane = ({ onDragFinish= ()=>{}, showDividerButtons = true, paneOrder = [0, 1], ...props })=>{

	const [isDragging, setIsDragging] = useState(false);
	const [dividerPos, setDividerPos] = useState(null);
	const [moveSource, setMoveSource] = useState(false);
	const [moveBrew, setMoveBrew] = useState(false);
	const [showMoveArrows, setShowMoveArrows] = useState(true);
	const [liveScroll, setLiveScroll] = useState(false);
	const [dragStartTime, setDragStartTime] = useState(0);
  	const [dragStartPos, setDragStartPos] = useState(0);
  	const [lastWidth, setLastWidth] = useState(null);
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(()=>{
		const savedPos = window.localStorage.getItem(storageKey);
		setDividerPos(savedPos ? limitPosition(savedPos, 0.1 * (window.innerWidth - 4), 0.9 * (window.innerWidth - 13)) : window.innerWidth / 2);
		setLiveScroll(window.localStorage.getItem('liveScroll') === 'true');
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

	const liveScrollToggle = ()=>{
		window.localStorage.setItem('liveScroll', String(!liveScroll));
		setLiveScroll(!liveScroll);
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



	const  renderSplitPaneTools = (showMoveArrows &&
		<div id='split-pane-tools'>
			<Button id='move-source' iconOnly icon={paneOrder[0] === 0 ? `fas fa-arrow-left` : `fas fa-arrow-right`}
				tooltipDirection={['right']}
				onClick={()=>setMoveSource(!moveSource)} >
				Jump to location in Editor
			</Button>
			<Button id='move-preview' iconOnly icon={paneOrder[0] === 0 ? `fas fa-arrow-right` : `fas fa-arrow-left`}
				tooltipDirection={['right']}
				onClick={()=>setMoveBrew(!moveBrew)} >
				Jump to location in Preview
			</Button>
			<Button id='scroll-lock'
				role='switch'
				aria-checked={liveScroll ? 'true' : 'false'}
				tooltipDirection={['right']}
				iconOnly
				icon={liveScroll ? 'fas fa-lock' : 'fas fa-unlock'}
				onClick={liveScrollToggle} >
				{liveScroll ? 'Un-Sync Editor and Preview locations' : 'Sync Editor and Preview locations'}
			</Button>
			<Button id='swap-panes'
				tooltipDirection={['right']}
				iconOnly
				icon='fas fa-arrow-right-arrow-left'
				onClick={handleSwapClick}>
					Swap Panes
			</Button>
		</div>
	);

	const renderDivider = (
		<div className={`divider${isDragging ? ' dragging' : ''}${onRightEdge() ? ' on-right-edge' : ''}`} onPointerDown={handleDown}>
			<div id='flip-box'>
				{showDividerButtons && renderSplitPaneTools}
				<div className={`dots`}>
					<i className='fas fa-grip-vertical' />
				</div>
			</div>
		</div>
	);

	const children = React.Children.toArray(props.children);


	return (
		<div className='splitPane' onPointerMove={handleMove} onPointerUp={handleUp}>
			<Pane key={`pane-${paneOrder[0]}`} width={dividerPos} moveBrew={moveBrew} moveSource={moveSource} liveScroll={liveScroll} setMoveArrows={setShowMoveArrows}>
				{children[paneOrder[0]]}
			</Pane>
			{renderDivider}
			<Pane key={`pane-${paneOrder[1]}`}isDragging={isDragging}>{children[paneOrder[1]]}</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, moveBrew, moveSource, liveScroll = false, setMoveArrows })=>{
	const styles = width
		? { flex: 'none', width: `${width}px` }
		: { pointerEvents: isDragging ? 'none' : 'auto' }; //Disable mouse capture in the right pane; else dragging into the iframe drops the divider

	return (
		<div className='pane' style={styles}>
			{React.cloneElement(children, { moveBrew, moveSource, liveScroll, setMoveArrows })}
		</div>
	);
};

module.exports = SplitPane;
