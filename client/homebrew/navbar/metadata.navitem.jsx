const React = require('react');
const createClass = require('create-react-class');
const Moment = require('moment');

const Nav = require('client/homebrew/navbar/nav.jsx');


const MetadataNav = createClass({
	displayName     : 'MetadataNav',
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
		if(!this.props.brew.authors || this.props.brew.authors.length == 0) return 'No authors';
		return <>
			{this.props.brew.authors.map((author, idx, arr)=>{
				const spacer = arr.length - 1 == idx ? <></> : <span>, </span>;
				return <span key={idx}><a className='userPageLink' href={`/user/${encodeURIComponent(author)}`}>{author}</a>{spacer}</span>;
			})}
		</>;
	},

	getTags : function(){
		if(!this.props.brew.tags || this.props.brew.tags.length == 0) return 'No tags';
		return <>
			{this.props.brew.tags.map((tag, idx)=>{
				return <span className='tag' key={idx}>{tag}</span>;
			})}
		</>;
	},

	getSystems : function(){
		if(!this.props.brew.systems || this.props.brew.systems.length == 0) return 'No systems';
		return this.props.brew.systems.join(', ');
	},

	renderMetaWindow : function(){
		return <div className={`window ${this.state.showMetaWindow ? 'active' : 'inactive'}`}>
			<div className='row'>
				<h4>Description</h4>
				<p>{this.props.brew.description || 'No description.'}</p>
			</div>
			<div className='row'>
				<h4>Authors</h4>
				<p>{this.getAuthors()}</p>
			</div>
			<div className='row'>
				<h4>Tags</h4>
				<p>{this.getTags()}</p>
			</div>
			<div className='row'>
				<h4>Systems</h4>
				<p>{this.getSystems()}</p>
			</div>
			<div className='row'>
				<h4>Updated</h4>
				<p>{Moment(this.props.brew.updatedAt).fromNow()}</p>
			</div>
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
