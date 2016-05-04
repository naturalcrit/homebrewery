var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var SplitPane = React.createClass({

	getInitialState: function() {
		return {
			storageKey : 'naturalcrit-pane-split-test',
			size : null,
			isDragging : false
		};
	},

	componentDidMount: function() {
		var paneSize = window.localStorage.getItem(this.props.storageKey);
		if(paneSize){
			this.setState({
				size : paneSize
			})
		}
	},

	handleUp : function(){
		this.setState({ isDragging : false })
	},
	handleDown : function(){
		this.setState({ isDragging : true })
	},
	handleMove : function(e){
		if(!this.state.isDragging) return;
		this.setState({
			size : e.pageX
		});
		window.localStorage.setItem(this.props.storageKey, e.pageX);
	},

	renderDivider : function(){
		return <div
			className='divider'
			onMouseDown={this.handleDown}
		/>
	},

	render : function(){
		return <div className='splitPane' onMouseMove={this.handleMove} onMouseUp={this.handleUp}>
			<Pane width={this.state.size}>{this.props.children[0]}</Pane>
			{this.renderDivider()}
			<Pane>{this.props.children[1]}</Pane>
		</div>
	}
});

var Pane = React.createClass({
	getDefaultProps: function() {
		return {
			width : null
		};
	},
	render : function(){
		var styles = {};
		if(this.props.width){
			styles = {
				flex : 'none',
				width : this.props.width + 'px'
			}
		}

		return <div className={cx('pane', this.props.className)} style={styles}>
			{this.props.children}
		</div>
	}
});


module.exports = SplitPane;
