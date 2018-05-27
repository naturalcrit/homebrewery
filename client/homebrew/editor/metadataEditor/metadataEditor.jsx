const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const request = require('superagent');

const SYSTEMS = ['5e', '4e', '3.5e', 'Pathfinder'];

const MetadataEditor = createClass({
	getDefaultProps : function() {
		return {
			metadata : {
				editId      : null,
				title       : '',
				description : '',
				tags        : '',
				published   : false,
				authors     : [],
				systems     : []
			},
			onChange : ()=>{}
		};
	},

	handleFieldChange : function(name, e){
		this.props.onChange(_.merge({}, this.props.metadata, {
			[name] : e.target.value
		}));
	},
	handleSystem : function(system, e){
		if(e.target.checked){
			this.props.metadata.systems.push(system);
		} else {
			this.props.metadata.systems = _.without(this.props.metadata.systems, system);
		}
		this.props.onChange(this.props.metadata);
	},
	handlePublish : function(val){
		this.props.onChange(_.merge({}, this.props.metadata, {
			published : val
		}));
	},

	handleDelete : function(){
		if(!confirm('are you sure you want to delete this brew?')) return;
		if(!confirm('are you REALLY sure? You will not be able to recover it')) return;

		request.get(`/api/remove/${this.props.metadata.editId}`)
			.send()
			.end(function(err, res){
				window.location.href = '/';
			});
	},

	getRedditLink : function(){
		const meta = this.props.metadata;
		const title = `${meta.title} [${meta.systems.join(' ')}]`;
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Homebrewery Link](http://homebrewery.naturalcrit.com/share/${meta.shareId})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
	},

	renderSystems : function(){
		return _.map(SYSTEMS, (val)=>{
			return <label key={val}>
				<input
					type='checkbox'
					checked={_.includes(this.props.metadata.systems, val)}
					onChange={()=>this.handleSystem(val)} />
				{val}
			</label>;
		});
	},

	renderPublish : function(){
		if(this.props.metadata.published){
			return <button className='unpublish' onClick={()=>this.handlePublish(false)}>
				<i className='fa fa-ban' /> unpublish
			</button>;
		} else {
			return <button className='publish' onClick={()=>this.handlePublish(true)}>
				<i className='fa fa-globe' /> publish
			</button>;
		}
	},

	renderDelete : function(){
		if(!this.props.metadata.editId) return;

		return <div className='field delete'>
			<label>delete</label>
			<div className='value'>
				<button className='publish' onClick={this.handleDelete}>
					<i className='fa fa-trash' /> delete brew
				</button>
			</div>
		</div>;
	},

	renderAuthors : function(){
		let text = 'None.';
		if(this.props.metadata.authors.length){
			text = this.props.metadata.authors.join(', ');
		}
		return <div className='field authors'>
			<label>authors</label>
			<div className='value'>
				{text}
			</div>
		</div>;
	},

	renderShareToReddit : function(){
		if(!this.props.metadata.shareId) return;

		return <div className='field reddit'>
			<label>reddit</label>
			<div className='value'>
				<a href={this.getRedditLink()} target='_blank' rel='noopener noreferrer'>
					<button className='publish'>
						<i className='fa fa-reddit-alien' /> share to reddit
					</button>
				</a>
			</div>
		</div>;
	},

	render : function(){
		return <div className='metadataEditor'>
			<div className='field title'>
				<label>title</label>
				<input type='text' className='value'
					value={this.props.metadata.title}
					onChange={()=>this.handleFieldChange('title')} />
			</div>
			<div className='field description'>
				<label>description</label>
				<textarea value={this.props.metadata.description} className='value'
					onChange={()=>this.handleFieldChange('description')} />
			</div>
			{/*}
			<div className='field tags'>
				<label>tags</label>
				<textarea value={this.props.metadata.tags}
					onChange={()=>this.handleFieldChange('tags')} />
			</div>
			*/}

			<div className='field systems'>
				<label>systems</label>
				<div className='value'>
					{this.renderSystems()}
				</div>
			</div>

			{this.renderAuthors()}

			<div className='field publish'>
				<label>publish</label>
				<div className='value'>
					{this.renderPublish()}
					<small>Published homebrews will be publicly viewable and searchable (eventually...)</small>
				</div>
			</div>

			{this.renderShareToReddit()}

			{this.renderDelete()}

		</div>;
	}
});

module.exports = MetadataEditor;
