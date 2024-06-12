/* eslint-disable max-lines */
require('./metadataEditor.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const request = require('../../utils/request-middleware.js');
const Nav = require('naturalcrit/nav/nav.jsx');
const Combobox = require('client/components/combobox.jsx');
const StringArrayEditor = require('../stringArrayEditor/stringArrayEditor.jsx');
const htmlimg = require('html-to-image');
const Themes = require('themes/themes.json');
const validations = require('./validations.js');
const base64url = require('base64-url');


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
				thumbnailSm : null,
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


	thumbnailCapture : async function() {

		function urlReplacer(urlMatch, url) {
			return (`url(/xssp/${base64url.encode(url)})`);
		}
		const bR = parent.document.getElementById('BrewRenderer');
		const brewRenderer = bR.contentDocument || bR.contentWindow.document;
		const pageOne = brewRenderer.getElementsByClassName('page')[0];
		const topPage = pageOne.cloneNode(true);
		pageOne.parentNode.appendChild(topPage);
		// Walk through Top Page's Source and convert all Images to inline data *in* topPage.
		const srcImages = pageOne.getElementsByTagName('img');
		const topImages = topPage.getElementsByTagName('img');
		const topLinks = brewRenderer.getElementsByTagName('link');
		const topStyles = brewRenderer.getElementsByTagName('style');
		// These two should start off with identical contents.
		for (let imgPos = 0; imgPos < srcImages.length; imgPos++) {
			topImages[imgPos].src = `/xssp/${base64url.encode(srcImages[imgPos].src)}`;
		}
		for (let linkPos = 0; linkPos < topLinks.length; linkPos++) {
			topLinks[linkPos].href = `/xssp/${base64url.encode(topLinks[linkPos].href)}`;
		}
		for (let stylePos = 0; stylePos < topStyles.length; stylePos++) {
			const urlRegex = /url\(([^\'\"].*[^\'\"])\)/gs;
			const urlRegexWrapped = /url\(\'(.*)\'\)/gs;
			topStyles[stylePos].innerText = topStyles[stylePos].innerText.replace(urlRegex,  urlReplacer);
			topStyles[stylePos].innerText = topStyles[stylePos].innerText.replace(urlRegexWrapped, urlReplacer);
		}
		const props = this.props;

		const clientHeightLg = topPage.clientHeight * 0.5;
		const clientWidthSm = topPage.clientWidth * (115/topPage.clientHeight);
		const clientWidthLg = topPage.clientWidth * 0.5;

		htmlimg.toPng(topPage, { canvasHeight : clientHeightLg, canvasWidth : clientWidthLg
		}).then(function(dataURL){
		  props.metadata.thumbnailLg = dataURL;
		  	htmlimg.toJpeg(topPage, { canvasHeight : 115, canvasWidth : clientWidthSm, quality : 0.95
		  	}).then(function(dataURL){
				props.metadata.thumbnail = 'Page 1';
				props.metadata.thumbnailSm = dataURL;
				props.onChange(props.metadata);
				topPage.remove();
			});
		  props.onChange(props.metadata);
	  	});
	},

	renderThumbnail : function(){
		if(!this.state.showThumbnail) return;
		const imgURL = this.props.metadata.thumbnail.startsWith('Page 1') ? this.props.metadata.thumbnailSm : this.props.metadata.thumbnail;
		return <img className='thumbnail-preview' src={imgURL || homebreweryThumbnail}></img>;
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
			<label>language</label>
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
				<small>Sets the HTML Lang property for your brew. May affect hyphenation or spellcheck.</small>
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
						<button className='display' onClick={this.thumbnailCapture}>
							<i className={`fas fa-camera`} />
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

			{this.renderLanguageDropdown()}

			{this.renderThemeDropdown()}

			{this.renderRenderOptions()}

			<hr/>

			<h1 className='sectionHead'>Authors</h1>

			{this.renderAuthors()}

			<StringArrayEditor label='invited authors' valuePatterns={[/.+/]}
				validators={[(v)=>!this.props.metadata.authors?.includes(v)]}
				placeholder='invite author' unique={true}
				values={this.props.metadata.invitedAuthors}
				notes={['Invited author usernames are case sensitive.', 'After adding an invited author, send them the edit link. There, they can choose to accept or decline the invitation.']}
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
