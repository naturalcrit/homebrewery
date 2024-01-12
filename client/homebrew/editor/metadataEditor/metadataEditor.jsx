/* eslint-disable max-lines */
require('./metadataEditor.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const request = require('../../utils/request-middleware.js');
const Nav = require('naturalcrit/nav/nav.jsx');
const Combobox = require('client/components/combobox.jsx');
const StringArrayEditor = require('../stringArrayEditor/stringArrayEditor.jsx');

const Themes = require('themes/themes.json');
const validations = require('./validations.js');

const SYSTEMS = ['5e', '4e', '3.5e', 'Pathfinder'];

const homebreweryThumbnail = require('../../thumbnail.png');
const translateOpts = ['editPage', 'propertiesTab'];

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

	handleLanguage : function(languageCode){
		this.props.metadata.lang = languageCode;
		this.props.onChange(this.props.metadata);
	},

	handleDelete : function(){
		if(this.props.metadata.authors && this.props.metadata.authors.length <= 1){
			if(!confirm('onlyAuthorDelete'.translate())) return;
			if(!confirm('confirm1'.translate())) return;
		} else {
			if(!confirm('multipleAuthorDelete'.translate())) return;
			if(!confirm('confirm2'.translate())) return;
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
				<i className='fas fa-ban' /> {'unpublish'.translate()}
			</button>;
		} else {
			return <button className='publish' onClick={()=>this.handlePublish(true)}>
				<i className='fas fa-globe' /> {'publish'.translate()}
			</button>;
		}
	},

	renderDelete : function(){
		if(!this.props.metadata.editId) return;

		return <div className='field delete'>
			<label>{'delete'.translate()}</label>
			<div className='value'>
				<button className='publish' onClick={this.handleDelete}>
					<i className='fas fa-trash-alt' /> {'delete brew'.translate()}
				</button>
			</div>
		</div>;
	},

	renderAuthors : function(){
		let text = 'None'.translate()+'.';
		if(this.props.metadata.authors && this.props.metadata.authors.length){
			text = this.props.metadata.authors.join(', ');
		}
		return <div className='field authors'>
			<label>{'authors'.translate()}</label>
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
						{'themesLegacy'.translate()} <i className='fas fa-caret-down'></i>
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
			<label>{'theme'.translate()}</label>
			{dropdown}
		</div>;
	},

	renderLanguageDropdown : function(){
		const langCodes = ['en', 'de', 'de-ch', 'fr', 'ja', 'es', 'it', 'sv', 'ru', 'zh-Hans', 'zh-Hant'];
		const listLanguages = ()=>{
			return _.map(langCodes.sort(), (code, index)=>{
				const localName = new Intl.DisplayNames([code], { type: 'language' });
				const englishName = new Intl.DisplayNames('en', { type: 'language' });
				return <div className='item' title={`${englishName.of(code)}`} key={`${index}`} data-value={`${code}`} data-detail={`${localName.of(code)}`}>
					{`${code}`}
					<div className='detail'>{`${localName.of(code)}`}</div>
				</div>;
			});
		};

		const debouncedHandleFieldChange =  _.debounce(this.handleFieldChange, 500);

		return <div className='field language'>
			<label>{'language'.translate()}</label>
			<div className='value'>
				<Combobox trigger='click'
					className='language-dropdown'
					default={this.props.metadata.lang || ''}
					placeholder='en'
					onSelect={(value)=>this.handleLanguage(value)}
					onEntry={(e)=>{
						e.target.setCustomValidity('');	//Clear the validation popup while typing
						debouncedHandleFieldChange('lang', e);
					}}
					options={listLanguages()}
					autoSuggest={{
						suggestMethod           : 'startsWith',
						clearAutoSuggestOnClick : true,
						filterOn                : ['data-value', 'data-detail', 'title']
					}}
				>
				</Combobox>
				<small>{'languageSub'.translate()}</small>
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
					{'Legacy'.translate()}
				</label>

				<label key='V3'>
					<input
						type='radio'
						value = 'V3'
						name = 'renderer'
						checked={this.props.metadata.renderer === 'V3'}
						onChange={(e)=>this.handleRenderer('V3', e)} />
					{'v3'.translate()}
				</label>

				<a href='/legacy' target='_blank' rel='noopener noreferrer'>
					{'legacyDemoLink'.translate()}
				</a>
			</div>
		</div>;
	},

	render : function(){
		''.setTranslationDefaults(translateOpts);
		return <div className='metadataEditor'>
			<h1 className='sectionHead'>{'Brew'.translate()}</h1>

			<div className='field title'>
				<label>{'title'.translate()}</label>
				<input type='text' className='value'
					defaultValue={this.props.metadata.title}
					onChange={(e)=>this.handleFieldChange('title', e)} />
			</div>
			<div className='field-group'>
				<div className='field-column'>
					<div className='field description'>
						<label>{'description'.translate()}</label>
						<textarea defaultValue={this.props.metadata.description} className='value'
							onChange={(e)=>this.handleFieldChange('description', e)} />
					</div>
					<div className='field thumbnail'>
						<label>{'thumbnail'.translate()}</label>
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

			<StringArrayEditor label={'tags'.translate()} valuePatterns={[/^(?:(?:group|meta|system|type):)?[A-Za-z0-9][A-Za-z0-9 \/.\-]{0,40}$/]}
				placeholder={'add tag'.translate()} unique={true}
				values={this.props.metadata.tags}
				onChange={(e)=>this.handleFieldChange('tags', e)}/>

			<div className='field systems'>
				<label>{'systems'.translate()}</label>
				<div className='value'>
					{this.renderSystems()}
				</div>
			</div>

			{this.renderLanguageDropdown()}

			{this.renderThemeDropdown()}

			{this.renderRenderOptions()}

			<hr/>

			<h1 className='sectionHead'>{'authors'.translate()}</h1>

			{this.renderAuthors()}

			<StringArrayEditor label={'invited authors'.translate()} valuePatterns={[/.+/]}
				validators={[(v)=>!this.props.metadata.authors?.includes(v)]}
				placeholder={'invite author'.translate()} unique={true}
				values={this.props.metadata.invitedAuthors}
				notes={['invitedSub1'.translate(), 'invitedSub2'.translate()]}
				onChange={(e)=>this.handleFieldChange('invitedAuthors', e)}/>

			<hr/>

			<h1 className='sectionHead'>Privacy</h1>

			<div className='field publish'>
				<label>{'publish'.translate()}</label>
				<div className='value'>
					{this.renderPublish()}
					<small>{'publishedSub'.translate()}</small>
				</div>
			</div>

			{this.renderDelete()}

		</div>;
	}
});

module.exports = MetadataEditor;
