var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Markdown = require('marked');

var PAGE_HEIGHT = 1056 + 30;

var PageContainer = React.createClass({
	getDefaultProps: function() {
		return {
			text : ""
		};
	},
	getInitialState: function() {
		return {
			scrollPosition: 0
		};
	},

	handleScroll : function(e){
		this.setState({
			scrollPosition : e.target.scrollTop
		});
	},

	getViewablePageIndex : function(){
		return Math.floor(this.state.scrollPosition / PAGE_HEIGHT);
	},

	renderDummyPage : function(key){
		return <div className='phb' key={key}>
			yo dawg
		</div>
	},

	renderPages : function(){
		var currentIndex = this.getViewablePageIndex();
		return _.map(this.props.text.split('\\page'), (pageText, index) => {
			if(currentIndex - 1 == index || currentIndex == index || currentIndex + 1 == index){
				return <div className='phb' dangerouslySetInnerHTML={{__html:Markdown(pageText)}} key={index} />
			}else{
				return this.renderDummyPage(index);
			}
		})
	},

	render : function(){
		return <div className="pageContainer" onScroll={this.handleScroll}>
			<div className='pages'>
				{this.renderPages()}
			</div>
		</div>;
	}
});

module.exports = PageContainer;
