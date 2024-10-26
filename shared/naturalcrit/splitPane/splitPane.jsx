require('./splitPane.less');
const React = require('react');
const { useState, useEffect, useRef } = React;
const cx = require('classnames');

const SplitPane = (props) => {
	props = {
		storageKey         : 'naturalcrit-pane-split',
		onDragFinish       : function(){}, //fires when dragging
		showDividerButtons : true,
		...props
	};
	const pane1 = useRef(null);
	const pane2 = useRef(null);
	const [currentDividerPos, setCurrentDividerPos] = useState(null);
	const [userSetDividerPos, setUserSetDividerPos] = useState(null);
	const [windowWidth, setWindowWidth] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [moveSource, setMoveSource] = useState(false);
	const [moveBrew, setMoveBrew] = useState(false);
	const [showMoveArrows, setShowMoveArrows] = useState(true);
	const [liveScroll, setLiveScroll] = useState(false);

	const storageKey = props.storageKey || 'naturalcrit-pane-split';
	const onDragFinish = props.onDragFinish || (() => {});

	// Fetch saved divider position and scroll state on mount
	useEffect(() => {
		setWindowWidth(window.innerWidth);
		const dividerPos = window.localStorage.getItem(storageKey);
		const liveScrollSetting = window.localStorage.getItem('liveScroll') === 'true';
		setLiveScroll(liveScrollSetting);

		if (dividerPos) {
			const limitedPos = limitPosition(dividerPos, 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13));
			setCurrentDividerPos(limitedPos);
			setUserSetDividerPos(dividerPos);
		} else {
			setCurrentDividerPos(window.innerWidth / 2);
			setUserSetDividerPos(window.innerWidth / 2);
		}

		const handleResize = () => {
			const newPos = limitPosition(userSetDividerPos, 0.1 * (window.innerWidth - 13), 0.9 * (window.innerWidth - 13));
			setCurrentDividerPos(newPos);
			setWindowWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const limitPosition = (x, min = 1, max = window.innerWidth - 13) => {
		return Math.round(Math.min(max, Math.max(min, x)));
	};

	const handleUp = (e) => {
		e.preventDefault();
		if (isDragging) {
			onDragFinish(currentDividerPos);
			window.localStorage.setItem(storageKey, currentDividerPos);
		}
		setIsDragging(false);
	};

	const handleDown = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMove = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const newSize = limitPosition(e.pageX);
		setCurrentDividerPos(newSize);
		setUserSetDividerPos(newSize);
	};

	const liveScrollToggle = () => {
		const newScrollState = !liveScroll;
		window.localStorage.setItem('liveScroll', String(newScrollState));
		setLiveScroll(newScrollState);
	};

	const renderMoveArrows = () => {
		console.log('showMoveArrows: ', showMoveArrows);
		if (showMoveArrows) {
			return (
				<>
					<div className='arrow left' onClick={() => setMoveSource(!moveSource)}>
						<i className='fas fa-arrow-left' />
					</div>
					<div className='arrow right' onClick={() => setMoveBrew(!moveBrew)}>
						<i className='fas fa-arrow-right' />
					</div>
					<div
						id='scrollToggleDiv'
						className={liveScroll ? 'arrow lock' : 'arrow unlock'}
						onClick={liveScrollToggle}>
						<i id='scrollToggle' className={liveScroll ? 'fas fa-lock' : 'fas fa-unlock'} />
					</div>
				</>
			);
		}
	};

	const renderDivider = () => (
		<div className='divider' onPointerDown={handleDown}>
			{props.showDividerButtons && renderMoveArrows()}
			<div className='dots'>
				<i className='fas fa-circle' />
				<i className='fas fa-circle' />
				<i className='fas fa-circle' />
			</div>
		</div>
	);

	return (
		<div className='splitPane' onPointerMove={handleMove} onPointerUp={handleUp}>
			<Pane ref={pane1} width={currentDividerPos}>
				{React.cloneElement(props.children[0], {
					...(props.showDividerButtons && {
						moveBrew,
						moveSource,
						liveScroll,
						setMoveArrows: setShowMoveArrows,
					}),
				})}
			</Pane>
			{renderDivider()}
			<Pane ref={pane2} isDragging={isDragging}>{props.children[1]}</Pane>
		</div>
	);
};

const Pane = ({ width, children, isDragging, className }) => {
	const styles = width
		? { flex: 'none', width: `${width}px` }
		: { pointerEvents: isDragging ? 'none' : 'auto' };

	return <div className={cx('pane', className)} style={styles}>{children}</div>;
};

module.exports = SplitPane;
