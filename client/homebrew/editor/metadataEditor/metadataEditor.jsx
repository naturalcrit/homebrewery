/* eslint-disable max-lines */
require('./metadataEditor.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const request = require('../../utils/request-middleware.js');
const Nav = require('naturalcrit/nav/nav.jsx');
const StringArrayEditor = require('../stringArrayEditor/stringArrayEditor.jsx');

const Themes = require('themes/themes.json');
const validations = require('./validations.js');

const SYSTEMS = ['5e', '4e', '3.5e', 'Pathfinder'];

const homebreweryThumbnail = require('../../thumbnail.png');

const callIfExists = (val, fn, ...args)=>{
	if(val[fn]) {
		val[fn](...args);
	}
};

const MetadataEditor = createClass({
	displayName     : 'MetadataEditor',
	getDefaultProps : function() {
		return {
			metadata : {
				editId      : null,
				title       : '',
				description : '',
				thumbnail   : '',
				tags        : [],
				published   : false,
				authors     : [],
				systems     : [],
				renderer    : 'legacy',
				theme       : '5ePHB'
			},
			onChange : ()=>{},
			reportError : ()=>{}
		};
	},

	getInitialState : function(){
		return {
			showThumbnail : true
		};
	},

	toggleThumbnailDisplay : function(){
		this.setState({
			showThumbnail : !this.state.showThumbnail
		});
	},

	renderThumbnail : function(){
		if(!this.state.showThumbnail) return;
		return <img className='thumbnail-preview' src={this.props.metadata.thumbnail || homebreweryThumbnail}></img>;
	},

	handleFieldChange : function(name, e){
		// load validation rules, and check input value against them
		const inputRules = validations[name] ?? [];
		const validationErr = inputRules.map((rule)=>rule(e.target.value)).filter(Boolean);

		// if no validation rules, save to props
		if(validationErr.length === 0){
			callIfExists(e.target, 'setCustomValidity', '');
			this.props.onChange({
				...this.props.metadata,
				[name] : e.target.value
			});
		} else {
			// if validation issues, display built-in browser error popup with each error.
			const errMessage = validationErr.map((err)=>{
				return `- ${err}`;
			}).join('\n');
			callIfExists(e.target, 'setCustomValidity', errMessage);
			callIfExists(e.target, 'reportValidity');
		}
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
			if(renderer == 'legacy')
				this.props.metadata.theme = '5ePHB';
		}
		this.props.onChange(this.props.metadata);
	},
	handlePublish : function(val){
		this.props.onChange({
			...this.props.metadata,
			published : val
		});
	},

	handleTheme : function(theme){
		this.props.metadata.renderer = theme.renderer;
		this.props.metadata.theme    = theme.path;
		this.props.onChange(this.props.metadata);
	},

	handleDelete : function(){
		if(this.props.metadata.authors && this.props.metadata.authors.length <= 1){
			if(!confirm('Are you sure you want to delete this brew? Because you are the only owner of this brew, the document will be deleted permanently.')) return;
			if(!confirm('Are you REALLY sure? You will not be able to recover the document.')) return;
		} else {
			if(!confirm('Are you sure you want to remove this brew from your collection? This will remove you as an editor, but other owners will still be able to access the document.')) return;
			if(!confirm('Are you REALLY sure? You will lose editor access to this document.')) return;
		}

		request.delete(`/api/${this.props.metadata.googleId ?? ''}${this.props.metadata.editId}`)
			.send()
			.end((err, res)=>{
				if(err) {
					this.props.reportError(err);
				} else {
					window.location.href = '/';
				}
			});
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
		if(this.props.metadata.authors && this.props.metadata.authors.length){
			text = this.props.metadata.authors.join(', ');
		}
		return <div className='field authors'>
			<label>authors</label>
			<div className='value'>
				{text}
			</div>
		</div>;
	},

	renderThemeDropdown : function(){
		if(!global.enable_themes) return;

		const listThemes = (renderer)=>{
			return _.map(_.values(Themes[renderer]), (theme)=>{
				return <div className='item' key={''} onClick={()=>this.handleTheme(theme)} title={''}>
					{`${theme.renderer} : ${theme.name}`}
					<img src={`/themes/${theme.renderer}/${theme.path}/dropdownTexture.png`}/>
					<div className='preview'>
						<h6>{`${theme.name}`} preview</h6>
						<img src={`/themes/${theme.renderer}/${theme.path}/dropdownPreview.png`}/>
					</div>
				</div>;
			});
		};

		const currentTheme = Themes[`${_.upperFirst(this.props.metadata.renderer)}`][this.props.metadata.theme];
		let dropdown;

		if(this.props.metadata.renderer == 'legacy') {
			dropdown =
				<Nav.dropdown className='disabled value' trigger='disabled'>
					<div>
						{`Themes are not supported in the Legacy Renderer`} <i className='fas fa-caret-down'></i>
					</div>
				</Nav.dropdown>;
		} else {
			dropdown =
				<Nav.dropdown className='value' trigger='click'>
					<div>
						{`${_.upperFirst(currentTheme.renderer)} : ${currentTheme.name}`} <i className='fas fa-caret-down'></i>
					</div>
					{/*listThemes('Legacy')*/}
					{listThemes('V3')}
				</Nav.dropdown>;
		}

		return <div className='field themes'>
			<label>theme</label>
			{dropdown}
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

				<a href='/legacy' target='_blank' rel='noopener noreferrer'>
					Click here to see the demo page for the old Legacy renderer!
				</a>
			</div>
		</div>;
	},

	render : function(){
		return <div className='metadataEditor'>
			<h1 className='sectionHead'>Brew</h1>

			<div className='field title'>
				<label>title</label>
				<input type='text' className='value'
					defaultValue={this.props.metadata.title}
					onChange={(e)=>this.handleFieldChange('title', e)} />
			</div>
			<div className='field-group'>
				<div className='field-column'>
					<div className='field description'>
						<label>description</label>
						<textarea defaultValue={this.props.metadata.description} className='value'
							onChange={(e)=>this.handleFieldChange('description', e)} />
					</div>
					<div className='field thumbnail'>
						<label>thumbnail</label>
						<input type='text'
							defaultValue={this.props.metadata.thumbnail}
							placeholder='https://my.thumbnail.url'
							className='value'
							onChange={(e)=>this.handleFieldChange('thumbnail', e)} />
						<button className='display' onClick={this.toggleThumbnailDisplay}>
							<i className={`fas fa-caret-${this.state.showThumbnail ? 'right' : 'left'}`} />
						</button>
					</div>
				</div>
				{this.renderThumbnail()}
			</div>

			<StringArrayEditor label='tags' valuePatterns={[/^(?:(?:group|meta|system|type):)?[A-Za-z0-9][A-Za-z0-9 \/.\-]{0,40}$/]}
				placeholder='add tag' unique={true}
				values={this.props.metadata.tags}
				onChange={(e)=>this.handleFieldChange('tags', e)}/>

			<div className='field systems'>
				<label>systems</label>
				<div className='value'>
					{this.renderSystems()}
				</div>
			</div>

			{this.renderThemeDropdown()}

			{this.renderRenderOptions()}

			<hr/>

			<h1 className='sectionHead'>Authors</h1>

			{this.renderAuthors()}

			<StringArrayEditor label='invited authors' valuePatterns={[/.+/]}
				validators={[(v)=>!this.props.metadata.authors?.includes(v)]}
				placeholder='invite author' unique={true}
				values={this.props.metadata.invitedAuthors}
				notes={['Invited authors are case sensitive.', 'After adding an invited author, send them the edit link. There, they can choose to accept or decline the invitation.']}
				onChange={(e)=>this.handleFieldChange('invitedAuthors', e)}/>

			<hr/>

			<h1 className='sectionHead'>Privacy</h1>

			<div className='field publish'>
				<label>publish</label>
				<div className='value'>
					{this.renderPublish()}
					<small>Published homebrews will be publicly viewable and searchable (eventually...)</small>
				</div>
			</div>

			{this.renderDelete()}

		</div>;
	}
});

module.exports = MetadataEditor;
