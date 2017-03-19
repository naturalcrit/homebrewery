const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');
const Markdown = require('homebrewery/markdown.js');

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
		if(this.props.query.dialog) window.print();
	},
	//TODO: This is pretty bad
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

	render : function(){
		return <div>
			{this.renderStyle()}
			{this.renderPages()}
		</div>
	}
});

module.exports = PrintPage;
