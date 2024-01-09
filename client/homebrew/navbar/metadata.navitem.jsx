const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const Moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');
const translateOpts = ['nav', 'errorMsg'];

const MetadataNav = createClass({
	displayName     : 'MetadataNav',
	getDefaultProps : function() {
		''.setTranslationDefaults(translateOpts);
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
		if(!this.props.brew.authors || this.props.brew.authors.length == 0) return 'noAuthors'.translate();
		return <>
			{this.props.brew.authors.map((author, idx, arr)=>{
				const spacer = arr.length - 1 == idx ? <></> : <span>, </span>;
				return <span key={idx}><a className='userPageLink' href={`/user/${author}`}>{author}</a>{spacer}</span>;
			})}
		</>;
	},

	getTags : function(){
		if(!this.props.brew.tags || this.props.brew.tags.length == 0) return 'noTags'.translate();
		return <>
			{this.props.brew.tags.map((tag, idx)=>{
				return <span className='tag' key={idx}>{tag}</span>;
			})}
		</>;
	},

	getSystems : function(){
		if(!this.props.brew.systems || this.props.brew.systems.length == 0) return 'noSystems'.translate();
		return this.props.brew.systems.join(', ');
	},

	renderMetaWindow : function(){
		return <div className={`window ${this.state.showMetaWindow ? 'active' : 'inactive'}`}>
			<div className='row'>
				<h4>{'description'.translate()}</h4>
				<p>{this.props.brew.description || 'noDescription'.translate()}</p>
			</div>
			<div className='row'>
				<h4>{'authors'.translate()}</h4>
				<p>{this.getAuthors()}</p>
			</div>
			<div className='row'>
				<h4>{'tags'.translate()}</h4>
				<p>{this.getTags()}</p>
			</div>
			<div className='row'>
				<h4>{'systems'.translate()}</h4>
				<p>{this.getSystems()}</p>
			</div>
			<div className='row'>
				<h4>{'updated'.translate()}</h4>
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
