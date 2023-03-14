const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');


const MetadataNav = createClass({
	DisplayName     : 'MetadataNav',
	getDefaultProps : function() {
		return {
		};
	},

	getInitialState : function() {
		return {
			showDropdown : false
		};
	},

	componentDidMount : function() {
	},

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		});
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

	renderDropdown : function(){
		if(!this.state.showDropdown) return null;

		return <div className='dropdown'>
			<h4>Description</h4>
			<p>{this.props.brew.description || 'No description.'}</p>
			<h4>Authors</h4>
			<p>{this.getAuthors()}</p>
			<h4>Tags</h4>
			<p>{this.getTags()}</p>
			<h4>Systems</h4>
			<p>{this.getSystems()}</p>
		</div>;
	},

	render : function(){
		return <Nav.item icon='fas fa-info-circle' color='grey' className='metadata'
			onMouseEnter={()=>this.handleDropdown(true)}
			onMouseLeave={()=>this.handleDropdown(false)}>
			METADATA
			{this.renderDropdown()}
		</Nav.item>;
	}

});

module.exports = MetadataNav;
