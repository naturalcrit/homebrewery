const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');


const MetadataNav = createClass({
	DisplayName     : 'MetadataNav',
	getDefaultProps : function() {
		return {
		};
	},

	getInitialState : function() {
		return {
			showMetaWindow : false
		};
	},

	componentDidMount : function() {
	},

	toggleMetaWindow : function(){
		this.setState((prevProps)=>({
			showMetaWindow : !prevProps.showMetaWindow
		}));
	},

	getAuthors : function(){
		if(!this.props.brew.authors) return 'No authors';
		return this.props.brew.authors.join(', ');
	},

	getTags : function(){
		if(!this.props.brew.tags) return 'No tags';
		return this.props.brew.tags.join(', ');
	},

	getSystems : function(){
		if(!this.props.brew.systems) return 'No systems';
		return this.props.brew.systems.join(', ');
	},

	renderMetaWindow : function(){
		if(!this.state.showMetaWindow) return null;

		return <div className='dropdown'>
			<h4>Description</h4>
			<p>{this.props.brew.description || 'No description.'}</p>
			<h4>Authors</h4>
			<p>{this.getAuthors()}</p>
			<h4>Tags</h4>
			<p>{this.getTags()}</p>
			<h4>Systems</h4>
			<p>{this.getSystems()}</p>
			<h4>Last Updated</h4>
			<p>{Moment(this.props.brew.updatedAt).fromNow()}</p>
		</div>;
	},

	render : function(){
		return <Nav.item icon='fas fa-info-circle' color='grey' className='metadata'
			onClick={()=>this.toggleMetaWindow()}>
			{this.props.children}
			{this.renderMetaWindow()}
		</Nav.item>;
	}

});

module.exports = MetadataNav;
