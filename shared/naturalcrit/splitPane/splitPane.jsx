require('./splitPane.less');
const React = require('react');
const { useState, useEffect } = React;

const storageKey = 'naturalcrit-pane-split';

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
	const [dragStartTime, setDragStartTime] = useState(0);
  	const [dragStartPos, setDragStartPos] = useState(0);
  	const [lastWidth, setLastWidth] = useState(null);
	const [windowWidth, setWindowWidth] = useState(0);

	useEffect(()=>{
		const savedPos = window.localStorage.getItem(storageKey);
		setDividerPos(savedPos ? limitPosition(savedPos, 0.1 * (window.innerWidth - 4), 0.9 * (window.innerWidth - 13)) : window.innerWidth / 2);
		setLiveScroll(window.localStorage.getItem('liveScroll') === 'true');
		setWindowWidth(window.innerWidth);

		const handleWindowResize = () => {
			setWindowWidth(window.innerWidth);
			handleResize();
		};

		window.addEventListener('resize', handleWindowResize);
		return () => window.removeEventListener('resize', handleWindowResize);
	}, []);

	const limitPosition = (x, min = 1, max = window.innerWidth - 4)=>Math.round(Math.min(max, Math.max(min, x)));

	//when resizing, the divider should grow smaller if less space is given, then grow back if the space is restored, to the original position
	const handleResize = ()=>setDividerPos(limitPosition(window.localStorage.getItem(storageKey), 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13)));

	const handleUp =(e)=>{
		e.preventDefault();
		if(isDragging) {
			const dragTime = Date.now() - dragStartTime;
			const dragDistance = Math.abs(e.pageX - dragStartPos);

			if(dragTime < 200 && dragDistance < 5 && (e.target.closest('#split-pane-tools') == false)){
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

	const onRightEdge = ()=>{
		return dividerPos > (windowWidth - 16);
	}

	const  renderMoveArrows = (showMoveArrows &&
		<div id='split-pane-tools'>
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
		</div>
	);

	const renderDivider = (
		<div className={`divider${isDragging ? ' dragging' : ''}${onRightEdge() ? ' on-right-edge' : ''}`} onPointerDown={handleDown}>
			<div id='flip-box'>
				{showDividerButtons && renderMoveArrows}
				<div className={`dots`}>
					<i className='fas fa-grip-vertical' />
				</div>
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
