require('./printPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const { Meta } = require('vitreum/headtags');
const MarkdownLegacy = require('naturalcrit/markdownLegacy.js');
const Markdown = require('naturalcrit/markdown.js');

const PrintPage = createClass({
	getDefaultProps : function() {
		return {
			query : {},
			brew  : {
				text     : '',
				style    : '',
				renderer : 'legacy'
			}
		};
	},

	getInitialState : function() {
		return {
			brewText : this.props.brew.text
		};
	},

	componentDidMount : function() {
		if(this.props.query.local){
			this.setState((prevState, prevProps)=>({
				brewText : localStorage.getItem(prevProps.query.local)
			}));
		}

		if(this.props.query.dialog) window.print();
	},

	renderPages : function(){
		if(this.props.brew.renderer == 'legacy') {
			return _.map(this.state.brewText.split('\\page'), (page, index)=>{
				return <div
					className='phb'
					id={`p${index + 1}`}
					dangerouslySetInnerHTML={{ __html: MarkdownLegacy.render(page) }}
					key={index} />;
			});
		} else {
			return _.map(this.state.brewText.split(/^\\page/gm), (page, index)=>{
				return <div
					className='phb3'
					id={`p${index + 1}`}
					dangerouslySetInnerHTML={{ __html: Markdown.render(page) }}
					key={index} />;
			});
		}

	},

	render : function(){
		return <div>
			<Meta name='robots' content='noindex, nofollow' />
			{/* Apply CSS from Style tab */}
			<div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: `<style> ${this.props.brew.style} </style>` }} />
			{this.renderPages()}
		</div>;
	}
});

module.exports = PrintPage;
