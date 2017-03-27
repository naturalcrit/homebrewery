const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');


const BrewRenderer = require('homebrewery/brewRenderer/brewRenderer.jsx');

const Markdown = require('homebrewery/markdown.js');

const Headtags = require('vitreum/headtags');

const PrintPage = React.createClass({
	getDefaultProps: function() {
		return {
			query : {},
			brew : {
				text : '',
				style : ''
			}
		};
	},
	getInitialState: function() {
		return {
			brew: this.props.brew
		};
	},
	componentDidMount: function() {
		if(this.props.query.local){
			try{
				this.setState({
					brew : JSON.parse(
						localStorage.getItem(this.props.query.local)
					)
				});
			}catch(e){}
		}
		//if(this.props.query.dialog) window.print();
	},
	//TODO: Print page shouldn't replicate functionality in brew renderer
	renderStyle : function(){
		if(!this.state.brew.style) return;
		return <style>{this.state.brew.style.replace(/;/g, ' !important;')}</style>
	},
	renderPages : function(){
		return _.map(this.state.brew.text.split('\\page'), (page, index) => {
			return <div
				className='phb v2'
				id={`p${index + 1}`}
				dangerouslySetInnerHTML={{__html:Markdown.render(page)}}
				key={index} />;
		});
	},

	renderPrintInstructions : function(){
		return <div className='printInstructions'>
			Hey, I'm really cool instructions!!!!!

		</div>
	},

	render : function(){
		return <div className='printPage'>
			<Headtags.title>{this.state.brew.title}</Headtags.title>
			{this.renderPrintInstructions()}

			<BrewRenderer text={this.state.brew.text} style={this.state.brew.style} />

		</div>
	}
});

module.exports = PrintPage;
