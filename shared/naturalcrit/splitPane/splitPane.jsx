require('./splitPane.less');
const React = require('react');
const { useState, useEffect, useRef } = React;
const cx = require('classnames');

const SplitPane = (props)=>{
	const {
		storageKey = 'naturalcrit-pane-split',
		onDragFinish = ()=>{},
		showDividerButtons = true
	} = props;

	const [isDragging, setIsDragging] = useState(false);
	const [dividerPos, setDividerPos] = useState(null); // Initial divider position is set to `null`
	const [moveSource, setMoveSource] = useState(false);
	const [moveBrew, setMoveBrew] = useState(false);
	const [showMoveArrows, setShowMoveArrows] = useState(true);
	const [liveScroll, setLiveScroll] = useState(false);

	const dividerRef = useRef(null);

	// Set initial divider position and liveScroll only after mounting
	useEffect(()=>{
		const savedPos = window.localStorage.getItem(storageKey);
		setDividerPos(savedPos ? parseInt(savedPos, 10) : window.innerWidth / 2);
		setLiveScroll(window.localStorage.getItem('liveScroll') === 'true');

		const handleResize = ()=>{
			setDividerPos((pos)=>limitPosition(pos,0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13))
			);
		};
		window.addEventListener('resize', handleResize);
		return ()=>window.removeEventListener('resize', handleResize);
	}, [storageKey]);

	const limitPosition = (x, min = 1, max = window.innerWidth - 13)=>{
		return Math.round(Math.min(max, Math.max(min, x)));
	};

	const handleUp =(e)=>{
		e.preventDefault();
		if(isDragging) {
			onDragFinish(dividerPos);
			window.localStorage.setItem(storageKey, dividerPos);
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
		const newSize = limitPosition(e.pageX);
		setDividerPos(newSize);
	};

	const liveScrollToggle = ()=>{
		window.localStorage.setItem('liveScroll', String(!liveScroll));
		setLiveScroll(!liveScroll);
	};

	const moveArrows = showMoveArrows && (
		<>
			{['left', 'right'].map((direction, index) => (
				<div
					key={direction}
					className={`arrow ${direction}`}
					onClick={index === 0 ? () => setMoveSource(!moveSource) : () => setMoveBrew(!moveBrew)}
				>
					<i className={`fas fa-arrow-${direction}`} />
				</div>
			))}
			<div
				id='scrollToggleDiv'
				className={`arrow ${liveScroll ? 'lock' : 'unlock'}`}
				onClick={liveScrollToggle}
			>
				<i id='scrollToggle' className={`fas fa-${liveScroll ? 'lock' : 'unlock'}`} />
			</div>
		</>
	);

	const renderDivider = ()=>(
		<div className='divider' onPointerDown={handleDown} ref={dividerRef}>
			{showDividerButtons && moveArrows}
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
			{renderDivider()}
			<Pane isDragging={isDragging}>{props.children[1]}</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, className, moveBrew, moveSource, liveScroll, setMoveArrows })=>{
	const styles = width
		? { flex: 'none', width: `${width}px` }
		: { pointerEvents: isDragging ? 'none' : 'auto' };

	return (
		<div className={cx('pane', className)} style={styles}>
			{React.cloneElement(children, { moveBrew, moveSource, liveScroll, setMoveArrows })}
		</div>
	);
};

module.exports = SplitPane;
