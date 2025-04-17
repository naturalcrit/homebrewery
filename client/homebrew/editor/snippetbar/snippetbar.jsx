/*eslint max-lines: ["warn", {"max": 350, "skipBlankLines": true, "skipComments": true}]*/
require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

import { loadHistory } from '../../utils/versionHistory.js';
import { brewSnippetsToJSON } from '../../../../shared/helpers.js';

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
			themeBundle       : [],
			updateBrew        : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			renderer      : this.props.renderer,
			themeSelector : false,
			snippets      : [],
			showHistory   : false,
			historyExists : false,
			historyItems  : []
		};
	},

	componentDidMount : async function(prevState) {
		const snippets = this.compileSnippets();
		this.setState({
			snippets : snippets
		});
	},

	componentDidUpdate : async function(prevProps, prevState) {
		if(prevProps.renderer != this.props.renderer ||
			prevProps.theme != this.props.theme ||
			prevProps.themeBundle != this.props.themeBundle ||
			prevProps.brew.snippets != this.props.brew.snippets) {
			this.setState({
				snippets : this.compileSnippets()
			});
		};

		// Update history list if it has changed
		const checkHistoryItems = await loadHistory(this.props.brew);

		// If all items have the noData property, there is no saved data
		const checkHistoryExists = !checkHistoryItems.every((historyItem)=>{
			return historyItem?.noData;
		});
		if(prevState.historyExists != checkHistoryExists){
			this.setState({
				historyExists : checkHistoryExists
			});
		}

		// If any history items have changed, update the list
		if(checkHistoryExists && checkHistoryItems.some((historyItem, index)=>{
			return index >= prevState.historyItems.length || !_.isEqual(historyItem, prevState.historyItems[index]);
		})){
			this.setState({
				historyItems : checkHistoryItems
			});
		}
	},

	mergeCustomizer : function(oldValue, newValue, key) {
		if(key == 'snippets') {
			const result = _.reverse(_.unionBy(_.reverse(newValue), _.reverse(oldValue), 'name')); // Join snippets together, with preference for the child theme over the parent theme
			return result.filter((snip)=>snip.gen || snip.subsnippets);
		};
	},

	compileSnippets : function() {
		let compiledSnippets = [];

		let oldSnippets = _.keyBy(compiledSnippets, 'groupName');

		if(this.props.themeBundle.snippets) {
			for (let snippets of this.props.themeBundle.snippets) {
				if(typeof(snippets) == 'string')	// load staticThemes as needed; they were sent as just a file name
					snippets = ThemeSnippets[snippets];

				const newSnippets = _.keyBy(_.cloneDeep(snippets), 'groupName');
				compiledSnippets = _.values(_.mergeWith(oldSnippets, newSnippets, this.mergeCustomizer));

				oldSnippets = _.keyBy(compiledSnippets, 'groupName');
			}
		}

		const userSnippetsasJSON = brewSnippetsToJSON(this.props.brew.title || 'New Document', this.props.brew.snippets, this.props.themeBundle.snippets);
		compiledSnippets.push(userSnippetsasJSON);

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
		if(snippets.length === 0) return null;

		return <div className='snippets'>
			{_.map(snippets, (snippetGroup)=>{
				return <SnippetGroup
					brew={this.props.brew}
					groupName={snippetGroup.groupName}
					icon={snippetGroup.icon}
					snippets={snippetGroup.snippets}
					key={snippetGroup.groupName}
					onSnippetClick={this.handleSnippetClick}
					cursorPos={this.props.cursorPos}
				/>;
			})
			}
		</div>;
	},

	replaceContent : function(item){
		return this.props.updateBrew(item);
	},

	toggleHistoryMenu : function(){
		this.setState({
			showHistory : !this.state.showHistory
		});
	},

	renderHistoryItems : function() {
		if(!this.state.historyExists) return;

		return <div className='dropdown'>
			{_.map(this.state.historyItems, (item, index)=>{
				if(item.noData || !item.savedAt) return;

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

		return (
			<div className='editors'>
				{this.props.view !== 'meta' && <><div className='historyTools'>
					<div className={`editorTool snippetGroup history ${this.state.historyExists ? 'active' : ''}`}
						onClick={this.toggleHistoryMenu} >
						<i className='fas fa-clock-rotate-left' />
						{ this.state.showHistory && this.renderHistoryItems() }
					</div>
					<div className={`editorTool undo ${this.props.historySize.undo ? 'active' : ''}`}
						onClick={this.props.undo} >
						<i className='fas fa-undo' />
					</div>
					<div className={`editorTool redo ${this.props.historySize.redo ? 'active' : ''}`}
						onClick={this.props.redo} >
						<i className='fas fa-redo' />
					</div>
				</div>
				<div className='codeTools'>
					<div className={`editorTool foldAll ${this.props.foldCode ? 'active' : ''}`}
						onClick={this.props.foldCode} >
						<i className='fas fa-compress-alt' />
					</div>
					<div className={`editorTool unfoldAll ${this.props.unfoldCode ? 'active' : ''}`}
						onClick={this.props.unfoldCode} >
						<i className='fas fa-expand-alt' />
					</div>
					<div className={`editorTheme ${this.state.themeSelector ? 'active' : ''}`}
						onClick={this.toggleThemeSelector} >
						<i className='fas fa-palette' />
						{this.state.themeSelector && this.renderThemeSelector()}
					</div>
				</div></>}

				<div className='tabs'>
					<div className={cx('text', { selected: this.props.view === 'text' })}
						onClick={()=>this.props.onViewChange('text')}>
						<i className='fa fa-beer' />
					</div>
					<div className={cx('style', { selected: this.props.view === 'style' })}
						onClick={()=>this.props.onViewChange('style')}>
						<i className='fa fa-paint-brush' />
					</div>
					<div className={cx('snippet', { selected: this.props.view === 'snippet' })}
						onClick={()=>this.props.onViewChange('snippet')}>
						<i className='fas fa-th-list' />
					</div>
					<div className={cx('meta', { selected: this.props.view === 'meta' })}
						onClick={()=>this.props.onViewChange('meta')}>
						<i className='fas fa-info-circle' />
					</div>
				</div>

			</div>
		);
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
				<span className={`name${snippet.disabled ? ' disabled' : ''}`} title={snippet.name}>{snippet.name}</span>
				{snippet.experimental && <span className='beta'>beta</span>}
				{snippet.disabled     && <span className='beta' title='temporarily disabled due to large slowdown; under re-design'>disabled</span>}
				{snippet.subsnippets && <>
					<i className='fas fa-caret-right'></i>
					<div className='dropdown side'>
						{this.renderSnippets(snippet.subsnippets)}
					</div></>}
			</div>;

		});
	},

	render : function(){
		const snippetGroup = `snippetGroup snippetBarButton ${this.props.snippets.length === 0 ? 'disabledSnippets' : ''}`;
		return <div className={snippetGroup}>
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
