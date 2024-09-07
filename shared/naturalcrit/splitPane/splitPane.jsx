require('./splitPane.less');
const React = require('react');
const createClass = require('create-react-class');
const cx = require('classnames');

const SplitPane = createClass({
	displayName     : 'SplitPane',
	getDefaultProps : function() {
		return {
			storageKey         : 'naturalcrit-pane-split',
			onDragFinish       : function(){}, //fires when dragging
			showDividerButtons : true
		};
	},

	getInitialState : function() {
		return {
			currentDividerPos  : null,
			windowWidth        : 0,
			isDragging         : false,
			moveSource         : false,
			moveBrew           : false,
			viewablePageNumber : 0,
			showMoveArrows     : true
		};
	},

	pane1 : React.createRef(null),
	pane2 : React.createRef(null),

	componentDidMount : function() {
		const dividerPos = window.localStorage.getItem(this.props.storageKey);
		if(dividerPos){
			this.setState({
				currentDividerPos : this.limitPosition(dividerPos, 0.1*(window.innerWidth-13), 0.9*(window.innerWidth-13)),
				userSetDividerPos : dividerPos,
				windowWidth       : window.innerWidth
			});
		} else {
			this.setState({
				currentDividerPos : window.innerWidth / 2,
				userSetDividerPos : window.innerWidth / 2
			});
		}
		window.addEventListener('resize', this.handleWindowResize);


		// This lives here instead of in the initial render because you cannot touch localStorage until the componant mounts.
		const loadLiveScroll = window.localStorage.getItem('liveScroll') === 'true';
		this.setState({
			liveScroll : loadLiveScroll
		});
		const toggle = document.getElementById('scrollToggle');
		const toggleDiv = document.getElementById('scrollToggleDiv');
		if(loadLiveScroll) {
			toggle.className = 'fas fa-lock';
			toggleDiv.className = 'arrow lock';
		} else {
			toggle.className = 'fas fa-unlock';
			toggleDiv.className = 'arrow unlock';
		}
	},

	componentWillUnmount : function() {
		window.removeEventListener('resize', this.handleWindowResize);
	},

	handleWindowResize : function() {
		// Allow divider to increase in size to last user-set position
		// Limit current position to between 10% and 90% of visible space
		const newLoc = this.limitPosition(this.state.userSetDividerPos, 0.1*(window.innerWidth-13), 0.9*(window.innerWidth-13));

		this.setState({
			currentDividerPos : newLoc,
			windowWidth       : window.innerWidth
		});
	},

	limitPosition : function(x, min = 1, max = window.innerWidth - 13) {
		const result = Math.round(Math.min(max, Math.max(min, x)));
		return result;
	},

	handleUp : function(e){
		e.preventDefault();
		if(this.state.isDragging){
			this.props.onDragFinish(this.state.currentDividerPos);
			window.localStorage.setItem(this.props.storageKey, this.state.currentDividerPos);
		}
		this.setState({ isDragging: false });
	},

	handleDown : function(e){
		e.preventDefault();
		this.setState({ isDragging: true });
		//this.unFocus()
	},

	handleMove : function(e){
		if(!this.state.isDragging) return;

		e.preventDefault();
		const newSize = this.limitPosition(e.pageX);
		this.setState({
			currentDividerPos : newSize,
			userSetDividerPos : newSize
		});
	},

	liveScrollToggle : function(e) {
		const flipLiveScroll = !this.state.liveScroll;
		const toggle = e.target;
		const toggleDiv = toggle.parentElement;
		if(flipLiveScroll) {
			toggle.className = 'fas fa-lock';
			toggleDiv.className = 'arrow lock';
		} else {
			toggle.className = 'fas fa-unlock';
			toggleDiv.className = 'arrow unlock';
		}
		window.localStorage.setItem('liveScroll', String(flipLiveScroll));
		this.setState({ liveScroll: flipLiveScroll });
	},
	/*
	unFocus : function() {
		if(document.selection){
				document.selection.empty();
		}else{
			window.getSelection().removeAllRanges();
		}
	},
	*/

	setMoveArrows : function(newState) {
		if(this.state.showMoveArrows != newState){
			this.setState({
				showMoveArrows : newState
			});
		}
	},

	renderMoveArrows : function(){
		if(this.state.showMoveArrows) {
			return <>
				<div className='arrow left'
					style={{ left: this.state.currentDividerPos-4 }}
					onClick={()=>this.setState({ moveSource: !this.state.moveSource })} >
					<i className='fas fa-arrow-left' />
				</div>
				<div className='arrow right'
					style={{ left: this.state.currentDividerPos-4 }}
					onClick={()=>this.setState({ moveBrew: !this.state.moveBrew })} >
					<i className='fas fa-arrow-right' />
				</div>
				<div id='scrollToggleDiv' className={`arrow lock`}
					style={{ left: this.state.currentDividerPos-4 }}
					onClick={this.liveScrollToggle} >
					<i id='scrollToggle' className={`fas fa-lock`} />
				</div>
			</>;
		}
	},

	renderDivider : function(){
		return <>
			{this.renderMoveArrows()}
			<div className='divider' onPointerDown={this.handleDown} >
				<div className='dots'>
					<i className='fas fa-circle' />
					<i className='fas fa-circle' />
					<i className='fas fa-circle' />
				</div>
			</div>
		</>;
	},

	render : function(){
		return <div className='splitPane' onPointerMove={this.handleMove} onPointerUp={this.handleUp}>
			<Pane
				width={this.state.currentDividerPos}
			>
				{React.cloneElement(this.props.children[0], {
					...(this.props.showDividerButtons && {
						moveBrew      : this.state.moveBrew,
						moveSource    : this.state.moveSource,
            liveScroll    : this.state.liveScroll,
						setMoveArrows : this.setMoveArrows,
					}),
				})}
			</Pane>
			{this.renderDivider()}
			<Pane isDragging={this.state.isDragging}>{this.props.children[1]}</Pane>
		</div>;
	}
});

const Pane = createClass({
	displayName     : 'Pane',
	getDefaultProps : function() {
		return {
			width : null
		};
	},
	render : function(){
		let styles = {};
		if(this.props.width){
			styles = {
				flex  : 'none',
				width : `${this.props.width}px`
			};
		} else {
			styles = {
				pointerEvents : this.props.isDragging ? 'none' : 'auto' //Disable mouse capture in the rightmost pane; dragging into the iframe drops the divider otherwise
			};
		}

		return <div className={cx('pane', this.props.className)} style={styles}>
			{this.props.children}
		</div>;
	}
});

module.exports = SplitPane;
