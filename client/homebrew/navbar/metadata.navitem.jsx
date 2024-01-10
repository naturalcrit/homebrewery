const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');
const translateOpts = ['nav', 'errorMsg'];

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
		if(!this.props.brew.authors || this.props.brew.authors.length == 0) return 'no authors'.translate();
		return <>
			{this.props.brew.authors.map((author, idx, arr)=>{
				const spacer = arr.length - 1 == idx ? <></> : <span>, </span>;
				return <span key={idx}><a className='userPageLink' href={`/user/${author}`}>{author}</a>{spacer}</span>;
			})}
		</>;
	},

	getTags : function(){
		if(!this.props.brew.tags || this.props.brew.tags.length == 0) return 'no tags'.translate();
		return <>
			{this.props.brew.tags.map((tag, idx)=>{
				return <span className='tag' key={idx}>{tag}</span>;
			})}
		</>;
	},

	getSystems : function(){
		if(!this.props.brew.systems || this.props.brew.systems.length == 0) return 'no systems'.translate();
		return this.props.brew.systems.join(', ');
	},

	renderMetaWindow : function(){
		return <div className={`window ${this.state.showMetaWindow ? 'active' : 'inactive'}`}>
			<div className='row'>
				<h4>{'Description'.translate()}</h4>
				<p>{this.props.brew.description || 'No description.'.translate()}</p>
			</div>
			<div className='row'>
				<h4>{'Authors'.translate()}</h4>
				<p>{this.getAuthors()}</p>
			</div>
			<div className='row'>
				<h4>{'Tags'.translate()}</h4>
				<p>{this.getTags()}</p>
			</div>
			<div className='row'>
				<h4>{'Systems'.translate()}</h4>
				<p>{this.getSystems()}</p>
			</div>
			<div className='row'>
				<h4>{'Updated'.translate()}</h4>
				<p>{Moment(this.props.brew.updatedAt).fromNow()}</p>
			</div>
		</div>;
	},

	render : function(){
		''.setTranslationDefaults(translateOpts);
		return <Nav.item icon='fas fa-info-circle' color='grey' className='metadata'
			onClick={()=>this.toggleMetaWindow()}>
			{this.props.children}
			{this.renderMetaWindow()}
		</Nav.item>;
	}

});

module.exports = MetadataNav;
