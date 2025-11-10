/* eslint-disable max-lines */
require('./metadataEditor.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
import request from '../../utils/request-middleware.js';
const Combobox = require('client/components/combobox.jsx');
const TagInput = require('../tagInput/tagInput.jsx');


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
				shareId     : null,
				title       : '',
				description : '',
				thumbnail   : '',
				tags        : [],
				published   : false,
				authors     : [],
				systems     : [],
				renderer    : 'legacy',
				theme       : '5ePHB',
				lang        : 'en'
			},

			onChange    : ()=>{},
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

		const debouncedReportValidity = _.debounce((target, errMessage)=>{
			callIfExists(target, 'setCustomValidity', errMessage);
			callIfExists(target, 'reportValidity');
		}, 300); // 300ms debounce delay, adjust as needed

		// if no validation rules, save to props
		if(validationErr.length === 0){
			callIfExists(e.target, 'setCustomValidity', '');
			this.props.onChange({
				...this.props.metadata,
				[name] : e.target.value
			});
			return true;
		} else {
			// if validation issues, display built-in browser error popup with each error.
			const errMessage = validationErr.map((err)=>{
				return `- ${err}`;
			}).join('\n');


			debouncedReportValidity(e.target, errMessage);
			return false;
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
		this.props.onChange(this.props.metadata, 'renderer');
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

		this.props.onChange(this.props.metadata, 'theme');
	},

	handleThemeWritein : function(e) {
		const shareId = e.target.value.split('/').pop(); //Extract just the ID if a URL was pasted in
		this.props.metadata.theme = shareId;

		this.props.onChange(this.props.metadata, 'theme');
	},

	handleLanguage : function(languageCode){
		this.props.metadata.lang = languageCode;
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
		const mergedThemes = _.merge(Themes, this.props.userThemes);

		const listThemes = (renderer)=>{
			return _.map(_.values(mergedThemes[renderer]), (theme)=>{
				if(theme.path == this.props.metadata.shareId) return;
				const preview = theme.thumbnail || `/themes/${theme.renderer}/${theme.path}/dropdownPreview.png`;
				const texture = theme.thumbnail || `/themes/${theme.renderer}/${theme.path}/dropdownTexture.png`;
				return <div className='item' key={`${renderer}_${theme.name}`} value={`${theme.author ?? renderer} : ${theme.name}`} data={theme} title={''}>
					{theme.author ?? renderer} : {theme.name}
					<div className='texture-container'>
						<img src={texture}/>
					</div>
					<div className='preview'>
						<h6>{theme.name} preview</h6>
						<img src={preview}/>
					</div>
				</div>;
			}).filter(Boolean);
		};

		const currentRenderer = this.props.metadata.renderer;
		const currentThemeDisplay = this.props.themeBundle?.name ? `${this.props.themeBundle.author ?? currentRenderer} : ${this.props.themeBundle.name}` : 'No Theme Selected';
		let dropdown;

		if(currentRenderer == 'legacy') {
			dropdown =
				<div className='disabled value' trigger='disabled'>
					<div> Themes are not supported in the Legacy Renderer </div>
				</div>;
		} else {
			dropdown =
				<div className='value'>
					<Combobox trigger='click'
						className='themes-dropdown'
						default={currentThemeDisplay}
						placeholder='Select from below, or enter the Share URL or ID of a brew with the meta:theme tag'
						onSelect={(value)=>this.handleTheme(value)}
						onEntry={(e)=>{
							e.target.setCustomValidity('');	//Clear the validation popup while typing
							if(this.handleFieldChange('theme', e))
								this.handleThemeWritein(e);
						}}
						options={listThemes(currentRenderer)}
						autoSuggest={{
							suggestMethod           : 'includes',
							clearAutoSuggestOnClick : true,
							filterOn                : ['value', 'title']
						}}
					/>
					<small>Select from the list below (built-in themes and brews you have tagged "meta:theme"), or paste in the Share URL or Share ID of any brew.</small>
				</div>;
		}

		return <div className='field themes'>
			<label>theme</label>
			{dropdown}
		</div>;
	},

	renderLanguageDropdown : function(){
		const langCodes = ['en', 'de', 'de-ch', 'fr', 'ja', 'es', 'it', 'sv', 'ru', 'zh-Hans', 'zh-Hant'];
		const listLanguages = ()=>{
			return _.map(langCodes.sort(), (code, index)=>{
				const localName = new Intl.DisplayNames([code], { type: 'language' });
				const englishName = new Intl.DisplayNames('en', { type: 'language' });
				return <div className='item' title={englishName.of(code)} key={`${index}`} value={code} detail={localName.of(code)}>
					{code}
					<div className='detail'>{localName.of(code)}</div>
				</div>;
			});
		};

		return <div className='field language'>
			<label>language</label>
			<div className='value'>
				<Combobox trigger='click'
					className='language-dropdown'
					default={this.props.metadata.lang || ''}
					placeholder='en'
					onSelect={(value)=>this.handleLanguage(value)}
					onEntry={(e)=>{
						e.target.setCustomValidity('');	//Clear the validation popup while typing
						this.handleFieldChange('lang', e);
					}}
					options={listLanguages()}
					autoSuggest={{
						suggestMethod           : 'startsWith',
						clearAutoSuggestOnClick : true,
						filterOn                : ['value', 'detail', 'title']
					}}
				/>
				<small>Sets the HTML Lang property for your brew. May affect hyphenation or spellcheck.</small>
			</div>

		</div>;
	},

	renderRenderOptions : function(){
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
				<small><a href='/legacy' target='_blank' rel='noopener noreferrer'>Click here to see the demo page for the old Legacy renderer!</a></small>
			</div>
		</div>;
	},

	render : function(){
		return <div className='metadataEditor'>
			<h1>Properties Editor</h1>

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

			<TagInput label='tags' valuePatterns={[/^(?:(?:group|meta|system|type):)?[A-Za-z0-9][A-Za-z0-9 \/.\-]{0,40}$/]}
				placeholder='add tag' unique={true}
				values={this.props.metadata.tags}
				onChange={(e)=>this.handleFieldChange('tags', e)}
			/>

			<div className='field systems'>
				<label>systems</label>
				<div className='value'>
					{this.renderSystems()}
				</div>
			</div>

			{this.renderLanguageDropdown()}

			{this.renderThemeDropdown()}

			{this.renderRenderOptions()}

			<h2>Authors</h2>

			{this.renderAuthors()}

			<TagInput label='invited authors' valuePatterns={[/.+/]}
				validators={[(v)=>!this.props.metadata.authors?.includes(v)]}
				placeholder='invite author' unique={true}
				values={this.props.metadata.invitedAuthors}
				notes={['Invited author usernames are case sensitive.', 'After adding an invited author, send them the edit link. There, they can choose to accept or decline the invitation.']}
				onChange={(e)=>this.handleFieldChange('invitedAuthors', e)}
			/>

			<h2>Privacy</h2>

			<div className='field publish'>
				<label>publish</label>
				<div className='value'>
					{this.renderPublish()}
					<small>Published brews are searchable in <a href='/vault'>the Vault</a> and visible on your user page.  Unpublished brews are not indexed in the Vault or visible on your user page, but can still be shared and indexed by search engines.  You can unpublish a brew any time.</small>
				</div>
			</div>

			{this.renderDelete()}

		</div>;
	}
});

module.exports = MetadataEditor;
