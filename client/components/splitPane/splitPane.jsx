require('./splitPane.less');
const React = require('react');
const { useState, useEffect } = React;

const PANE_WIDTH_KEY = 'HB_editor_splitWidth';
const LIVE_SCROLL_KEY = 'HB_editor_liveScroll';

const SplitPane = (props)=>{
	const {
		onDragFinish = ()=>{},
		showDividerButtons = true
	} = props;

	const [isDragging, setIsDragging] = useState(false);
	const [dividerPos, setDividerPos] = useState(null);
	const [moveSource, setMoveSource] = useState(false);
	const [moveBrew, setMoveBrew] = useState(false);
	const [showMoveArrows, setShowMoveArrows] = useState(true);
	const [liveScroll, setLiveScroll] = useState(false);

	useEffect(()=>{
		const savedPos = window.localStorage.getItem(PANE_WIDTH_KEY);
		setDividerPos(savedPos ? limitPosition(savedPos, 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)) : window.innerWidth / 2);
		setLiveScroll(window.localStorage.getItem(LIVE_SCROLL_KEY) === 'true');

		window.addEventListener('resize', handleResize);
		return ()=>window.removeEventListener('resize', handleResize);
	}, []);

	const limitPosition = (x, min = 1, max = window.innerWidth - 13)=>Math.round(Math.min(max, Math.max(min, x)));

	//when resizing, the divider should grow smaller if less space is given, then grow back if the space is restored, to the original position
	const handleResize = ()=>setDividerPos(limitPosition(window.localStorage.getItem(PANE_WIDTH_KEY), 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)));

	const handleUp =(e)=>{
		e.preventDefault();
		if(isDragging) {
			onDragFinish(dividerPos);
			window.localStorage.setItem(PANE_WIDTH_KEY, dividerPos);
		}
		setIsDragging(false);
	};

	const handleDown = (e)=>{
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMove = (e)=>{
		if(!isDragging) return;
		e.preventDefault();
		setDividerPos(limitPosition(e.pageX));
	};

	const liveScrollToggle = ()=>{
		window.localStorage.setItem(LIVE_SCROLL_KEY, String(!liveScroll));
		setLiveScroll(!liveScroll);
	};

	const  renderMoveArrows = (showMoveArrows &&
		<>
			<div className='arrow left'
				onClick={()=>setMoveSource(!moveSource)} >
				<i className='fas fa-arrow-left' />
			</div>
			<div className='arrow right'
				onClick={()=>setMoveBrew(!moveBrew)} >
				<i className='fas fa-arrow-right' />
			</div>
			<div id='scrollToggleDiv' className={liveScroll ? 'arrow lock' : 'arrow unlock'}
				onClick={liveScrollToggle} >
				<i id='scrollToggle' className={liveScroll ? 'fas fa-lock' : 'fas fa-unlock'} />
			</div>
		</>
	);

	const renderDivider = (
		<div className={`divider ${isDragging && 'dragging'}`} onPointerDown={handleDown}>
			{showDividerButtons && renderMoveArrows}
			<div className='dots'>
				<i className='fas fa-circle' />
				<i className='fas fa-circle' />
				<i className='fas fa-circle' />
			</div>
		</div>
	);

	return (
		<div className='splitPane' onPointerMove={handleMove} onPointerUp={handleUp}>
			<Pane width={dividerPos} moveBrew={moveBrew} moveSource={moveSource} liveScroll={liveScroll} setMoveArrows={setShowMoveArrows}>
				{props.children[0]}
			</Pane>
			{renderDivider}
			<Pane isDragging={isDragging}>{props.children[1]}</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, moveBrew, moveSource, liveScroll, setMoveArrows })=>{
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
