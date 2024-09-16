/*eslint max-lines: ["warn", {"max": 250, "skipBlankLines": true, "skipComments": true}]*/
require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

import { getHistoryItems, historyExists } from '../../utils/versionHistory.js';

//Import all themes
const ThemeSnippets = {};
ThemeSnippets['Legacy_5ePHB'] = require('themes/Legacy/5ePHB/snippets.js');
ThemeSnippets['V3_5ePHB']     = require('themes/V3/5ePHB/snippets.js');
ThemeSnippets['V3_5eDMG']     = require('themes/V3/5eDMG/snippets.js');
ThemeSnippets['V3_Journal']   = require('themes/V3/Journal/snippets.js');
ThemeSnippets['V3_Blank']     = require('themes/V3/Blank/snippets.js');

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
			cursorPos         : {},
			snippetBundle     : [],
			updateBrew        : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			renderer      : this.props.renderer,
			themeSelector : false,
			snippets      : [],
			historyExists : false
		};
	},

	componentDidMount : async function() {
		const snippets = this.compileSnippets();
		this.setState({
			snippets : snippets
		});
	},

	componentDidUpdate : async function(prevProps) {
		const update = {};
		let newData = false;

		if(prevProps.renderer != this.props.renderer || prevProps.theme != this.props.theme || prevProps.snippetBundle != this.props.snippetBundle) {
			update.snippets = this.compileSnippets();
			newData = true;
		};

		if(historyExists(this.props.brew) != this.state.historyExists){
			update.historyExists = !this.state.historyExists;
			newData = true;
		}

		newData && this.setState(update);
	},

	mergeCustomizer : function(oldValue, newValue, key) {
		if(key == 'snippets') {
			const result = _.reverse(_.unionBy(_.reverse(newValue), _.reverse(oldValue), 'name')); // Join snippets together, with preference for the child theme over the parent theme
			return result.filter((snip)=>snip.gen || snip.subsnippets);
		}
	},

	compileSnippets : function() {
		let compiledSnippets = [];

		let oldSnippets = _.keyBy(compiledSnippets, 'groupName');

		for (let snippets of this.props.snippetBundle) {
			if(typeof(snippets) == 'string')	// load staticThemes as needed; they were sent as just a file name
				snippets = ThemeSnippets[snippets];

			const newSnippets = _.keyBy(_.cloneDeep(snippets), 'groupName');
			compiledSnippets = _.values(_.mergeWith(oldSnippets, newSnippets, this.mergeCustomizer));

			oldSnippets = _.keyBy(compiledSnippets, 'groupName');
		}
		return compiledSnippets;
	},

	handleSnippetClick : function(injectedText){
		this.props.onInject(injectedText);
	},

	toggleThemeSelector : function(e){
		if(e.target.tagName != 'SELECT'){
			this.setState({
				themeSelector : !this.state.themeSelector
			});
		}
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
			<select value={this.props.currentEditorTheme} onChange={this.changeTheme} >
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

	replaceContent : function(item){
		return this.props.updateBrew(item);
	},

	renderHistoryItems : function() {
		const historyItems = getHistoryItems(this.props.brew);

		return <div className='dropdown'>
			{_.map(historyItems, (item, index)=>{
				if(!item.savedAt) return;

				const saveTime = new Date(item.savedAt);
				const diffMs = new Date() - saveTime;
				const diffSecs = Math.floor(diffMs / 1000);

				let diffString = `about ${diffSecs} seconds ago`;

				if(diffSecs > 60) diffString = `about ${Math.floor(diffSecs / 60)} minutes ago`;
				if(diffSecs > (60 * 60)) diffString = `about ${Math.floor(diffSecs / (60 * 60))} hours ago`;
				if(diffSecs > (24 * 60 * 60)) diffString = `about ${Math.floor(diffSecs / (24 * 60 * 60))} days ago`;
				if(diffSecs > (7 * 24 * 60 * 60)) diffString = `about ${Math.floor(diffSecs / (7 * 24 * 60 * 60))} weeks ago`;

				return <div className='snippet' key={index} onClick={()=>{this.replaceContent(item);}} >
					<i className={`fas fa-${index+1}`} />
					<span className='name' title={saveTime.toISOString()}>v{item.version} : {diffString}</span>
				</div>;
			})}
		</div>;
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
				</>;

		}

		return <div className='editors'>
			<div className={`editorTool snippetGroup history ${this.state.historyExists ? 'active' : ''}`} >
				<i className='fas fa-clock-rotate-left' />
				{this.state.historyExists && this.renderHistoryItems() }
			</div>
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
				{this.state.themeSelector && this.renderThemeSelector()}
			</div>

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
				<span className='name'title={snippet.name}>{snippet.name}</span>
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
