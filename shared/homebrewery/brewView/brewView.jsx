
const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');


//const ErrorBar = require('./errorBar/errorBar.jsx');

const RenderWarnings = require('homebrewery/renderWarnings/renderWarnings.jsx');
//const Store = require('homebrewery/brew.store.js');

const PAGE_HEIGHT = 1056;


const BrewRenderer = require('../brewRenderer/brewRenderer.jsx');


const BrewView = React.createClass({
	getDefaultProps: function() {
		return {
			brew : {
				text : '',
				style : ''
			},


		};
	},
	getInitialState: function() {
		const pages = this.props.brew.text.split('\\page');

		return {
			viewablePageNumber: 0,
			//height : 0,
			//isMounted : false,
			pages : pages,
		};
	},

	//height : 0,
	pageHeight : PAGE_HEIGHT,

	componentWillReceiveProps: function(nextProps) {
		//if(this.refs.pages && this.refs.pages.firstChild) this.pageHeight = this.refs.pages.firstChild.clientHeight;

		const pages = nextProps.brew.text.split('\\page');
		this.setState({
			pages : pages,
			//usePPR : pages.length >= PPR_THRESHOLD
		})
	},


	handleScroll : function(e){
		this.setState({
			viewablePageNumber : Math.floor(e.target.scrollTop / PAGE_HEIGHT) //this.pageHeight)
		});
	},

	renderPageInfo : function(){
		return <div className='pageInfo'>
			{this.state.viewablePageNumber + 1} / {this.state.pages.length}
		</div>
	},


	render: function(){
		return <div className='brewView' onScroll={this.handleScroll}>

			<BrewRenderer
				text={this.props.brew.text}
				style={this.props.brew.style}
				pprPage={2}
				/>


			{this.renderPageInfo()}
		</div>
	}
});

module.exports = BrewView;
