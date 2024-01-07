/*eslint max-lines: ["warn", {"max": 250, "skipBlankLines": true, "skipComments": true}]*/
require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const path = require('path');
//const fs = require('fs-extra');

//Import all themes

const Themes = require('themes/themes.json');

const ThemeSnippets = require('themes/themeSnippets.js');

const EditorThemes = require('build/homebrew/codeMirror/editorThemes.json');

const execute = function(val, props){
	if(_.isFunction(val)) return val(props);
	return val;
};

const Snippetbar = createClass({
	displayName     : 'SnippetBar',
	getDefaultProps : function() {
		return {
			brew              : {},
			view              : 'text',
			onViewChange      : ()=>{},
			onInject          : ()=>{},
			onToggle          : ()=>{},
			showEditButtons   : true,
			renderer          : 'legacy',
			undo              : ()=>{},
			redo              : ()=>{},
			historySize       : ()=>{},
			foldCode          : ()=>{},
			unfoldCode        : ()=>{},
			updateEditorTheme : ()=>{},
			cursorPos         : {}
		};
	},

	getInitialState : function() {
		return {
			renderer      : this.props.renderer,
			themeSelector : false,
			snippets      : []
		};
	},

	componentDidMount : async function() {
		const rendererVersion    = this.props.renderer == 'V4' ? 'V4' : 'V3';
		const themeSlug       = this.props.theme ?? '5ePHB';
		const themeVersion    = this.props?.themeVersion ?? 'latest';
		let snippets = _.cloneDeep(ThemeSnippets[`${rendererVersion}_${themeSlug}_${themeVersion}`]);
		snippets = this.compileSnippets(rendererVersion, themeSlug, themeVersion, snippets);
		this.setState({
			snippets : snippets
		});
	},

	componentDidUpdate : async function(prevProps) {
		if(prevProps.renderer != this.props.renderer || prevProps.theme != this.props.theme) {
			const rendererVersion = this.props.renderer == 'V4' ? 'V4' : 'V3';
			const themeSlug       = this.props.theme ?? '5ePHB';
			const themeVersion    = this.props?.themeVersion ?? 'latest';
			let snippets = _.cloneDeep(ThemeSnippets[`${rendererVersion}_${themeSlug}_${themeVersion}`]);
			snippets = this.compileSnippets(rendererVersion, themeSlug, themeVersion, snippets);
			this.setState({
				snippets : snippets
			});
		}
	},

	mergeCustomizer : function(valueA, valueB, key) {
		if(key == 'snippets') {
			const result = _.reverse(_.unionBy(_.reverse(valueB), _.reverse(valueA), 'name')); // Join snippets together, with preference for the current theme over the base theme
			return _.filter(result, 'gen'); //Only keep snippets with a 'gen' property.
		}
	},

	compileSnippets : function(rendererVersion, themePath, themeVersion, snippets) {
		let compiledSnippets = snippets;
		const baseSnippetsPath = Themes[rendererVersion][themePath]?.baseSnippets;

		const objB = _.keyBy(compiledSnippets, 'groupName');

		if(baseSnippetsPath) {
			const objA = _.keyBy(_.cloneDeep(ThemeSnippets[`${rendererVersion}_${baseSnippetsPath}_${themeVersion}`]), 'groupName');
			compiledSnippets = _.values(_.mergeWith(objA, objB, this.mergeCustomizer));
			compiledSnippets = this.compileSnippets(rendererVersion, baseSnippetsPath, _.cloneDeep(compiledSnippets));
		} else {
			const objA = _.keyBy(_.cloneDeep(ThemeSnippets[`${rendererVersion}_Blank_latest`]), 'groupName');
			compiledSnippets = _.values(_.mergeWith(objA, objB, this.mergeCustomizer));
		}
		return compiledSnippets;
	},

	handleSnippetClick : function(injectedText){
		this.props.onInject(injectedText);
	},

	toggleThemeSelector : function(){
		this.setState({
			themeSelector : !this.state.themeSelector
		});
	},

	changeTheme : function(e){
		if(e.target.value == this.props.currentEditorTheme) return;
		this.props.updateEditorTheme(e.target.value);

		this.setState({
			showThemeSelector : false,
		});
	},

	renderThemeSelector : function(){
		return <div className='themeSelector'>
			<select value={this.props.currentEditorTheme} onChange={this.changeTheme} onMouseDown={(this.changeTheme)}>
				{EditorThemes.map((theme, key)=>{
					return <option key={key} value={theme}>{theme}</option>;
				})}
			</select>
		</div>;
	},

	renderSnippetGroups : function(){
		const snippets = this.state.snippets.filter((snippetGroup)=>snippetGroup.view === this.props.view);

		return _.map(snippets, (snippetGroup)=>{
			return <SnippetGroup
				brew={this.props.brew}
				groupName={snippetGroup.groupName}
				icon={snippetGroup.icon}
				snippets={snippetGroup.snippets}
				key={snippetGroup.groupName}
				onSnippetClick={this.handleSnippetClick}
				cursorPos={this.props.cursorPos}
			/>;
		});
	},

	renderEditorButtons : function(){
		if(!this.props.showEditButtons) return;

		let foldButtons;
		if(this.props.view == 'text'){
			foldButtons =
				<>
					<div className={`editorTool foldAll ${this.props.foldCode ? 'active' : ''}`}
						onClick={this.props.foldCode} >
						<i className='fas fa-compress-alt' />
					</div>
					<div className={`editorTool unfoldAll ${this.props.unfoldCode ? 'active' : ''}`}
						onClick={this.props.unfoldCode} >
						<i className='fas fa-expand-alt' />
					</div>
				</>

		}

		return <div className='editors'>
			<div className={`editorTool undo ${this.props.historySize.undo ? 'active' : ''}`}
				onClick={this.props.undo} >
				<i className='fas fa-undo' />
			</div>
			<div className={`editorTool redo ${this.props.historySize.redo ? 'active' : ''}`}
				onClick={this.props.redo} >
				<i className='fas fa-redo' />
			</div>
			<div className='divider'></div>
			{foldButtons}
			<div className={`editorTool editorTheme ${this.state.themeSelector ? 'active' : ''}`}
				onClick={this.toggleThemeSelector} >
				<i className='fas fa-palette' />
			</div>
			{this.state.themeSelector && this.renderThemeSelector()}
			<div className='divider'></div>
			<div className={cx('text', { selected: this.props.view === 'text' })}
				 onClick={()=>this.props.onViewChange('text')}>
				<i className='fa fa-beer' />
			</div>
			<div className={cx('style', { selected: this.props.view === 'style' })}
				 onClick={()=>this.props.onViewChange('style')}>
				<i className='fa fa-paint-brush' />
			</div>
			<div className={cx('meta', { selected: this.props.view === 'meta' })}
				onClick={()=>this.props.onViewChange('meta')}>
				<i className='fas fa-info-circle' />
			</div>
		</div>;
	},

	render : function(){
		return <div className='snippetBar'>
			{this.renderSnippetGroups()}
			{this.renderEditorButtons()}
		</div>;
	}
});

module.exports = Snippetbar;






const SnippetGroup = createClass({
	displayName     : 'SnippetGroup',
	getDefaultProps : function() {
		return {
			brew           : {},
			groupName      : '',
			icon           : 'fas fa-rocket',
			snippets       : [],
			onSnippetClick : function(){},
		};
	},
	handleSnippetClick : function(e, snippet){
		e.stopPropagation();
		this.props.onSnippetClick(execute(snippet.gen, this.props));
	},
	renderSnippets : function(snippets){
		return _.map(snippets, (snippet)=>{
			return <div className='snippet' key={snippet.name} onClick={(e)=>this.handleSnippetClick(e, snippet)}>
				<i className={snippet.icon} />
				<span className='name'>{snippet.name}</span>
				{snippet.experimental && <span className='beta'>beta</span>}
				{snippet.subsnippets && <>
					<i className='fas fa-caret-right'></i>
					<div className='dropdown side'>
						{this.renderSnippets(snippet.subsnippets)}
					</div></>}
			</div>;

		});
	},

	render : function(){
		return <div className='snippetGroup snippetBarButton'>
			<div className='text'>
				<i className={this.props.icon} />
				<span className='groupName'>{this.props.groupName}</span>
			</div>
			<div className='dropdown'>
				{this.renderSnippets(this.props.snippets)}
			</div>
		</div>;
	},
});
