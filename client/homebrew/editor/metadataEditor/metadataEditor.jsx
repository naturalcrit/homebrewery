require('./metadataEditor.less');
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
				systems     : [],
				renderer    : 'legacy'
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
	handleRenderer : function(renderer, e){
		if(e.target.checked){
			this.props.metadata.renderer = renderer;
		}
		this.props.onChange(this.props.metadata);
	},
	handlePublish : function(val){
		this.props.onChange(_.merge({}, this.props.metadata, {
			published : val
		}));
	},

	handleDelete : function(){
		if(this.props.metadata.authors.length <= 1){
			if(!confirm('Are you sure you want to delete this brew? Because you are the only owner of this brew, the document will be deleted permanently.')) return;
			if(!confirm('Are you REALLY sure? You will not be able to recover the document.')) return;
		} else {
			if(!confirm('Are you sure you want to remove this brew from your collection? This will remove you as an editor, but other owners will still be able to access the document.')) return;
			if(!confirm('Are you REALLY sure? You will lose editor access to this document.')) return;
		}

		request.delete(`/api/${this.props.metadata.editId}`)
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
					onChange={(e)=>this.handleSystem(val, e)} />
				{val}
			</label>;
		});
	},

	renderPublish : function(){
		if(this.props.metadata.published){
			return <button className='unpublish' onClick={()=>this.handlePublish(false)}>
				<i className='fas fa-ban' /> unpublish
			</button>;
		} else {
			return <button className='publish' onClick={()=>this.handlePublish(true)}>
				<i className='fas fa-globe' /> publish
			</button>;
		}
	},

	renderDelete : function(){
		if(!this.props.metadata.editId) return;

		return <div className='field delete'>
			<label>delete</label>
			<div className='value'>
				<button className='publish' onClick={this.handleDelete}>
					<i className='fas fa-trash-alt' /> delete brew
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
						<i className='fab fa-reddit-alien' /> share to reddit
					</button>
				</a>
			</div>
		</div>;
	},

	renderRenderOptions : function(){
		if(!global.enable_v3) return;

		return <div className='field systems'>
			<label>Renderer</label>
			<div className='value'>
				<label key='legacy'>
					<input
						type='radio'
						value = 'legacy'
						name = 'renderer'
						checked={this.props.metadata.renderer === 'legacy'}
						onChange={(e)=>this.handleRenderer('legacy', e)} />
					Legacy
				</label>

				<label key='V3'>
					<input
						type='radio'
						value = 'V3'
						name = 'renderer'
						checked={this.props.metadata.renderer === 'V3'}
						onChange={(e)=>this.handleRenderer('V3', e)} />
					V3
				</label>
			</div>
		</div>;
	},

	render : function(){
		return <div className='metadataEditor'>
			<div className='field title'>
				<label>title</label>
				<input type='text' className='value'
					value={this.props.metadata.title}
					onChange={(e)=>this.handleFieldChange('title', e)} />
			</div>
			<div className='field description'>
				<label>description</label>
				<textarea value={this.props.metadata.description} className='value'
					onChange={(e)=>this.handleFieldChange('description', e)} />
			</div>
			{/*}
			<div className='field tags'>
				<label>tags</label>
				<textarea value={this.props.metadata.tags}
					onChange={(e)=>this.handleFieldChange('tags', e)} />
			</div>
			*/}

			{this.renderAuthors()}

			<div className='field systems'>
				<label>systems</label>
				<div className='value'>
					{this.renderSystems()}
				</div>
			</div>

			{this.renderRenderOptions()}

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
