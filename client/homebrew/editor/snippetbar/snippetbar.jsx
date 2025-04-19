/*eslint max-lines: ["warn", {"max": 350, "skipBlankLines": true, "skipComments": true}]*/
require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');

import { loadHistory } from '../../utils/versionHistory.js';

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
		if(prevProps.renderer != this.props.renderer || prevProps.theme != this.props.theme || prevProps.snippetBundle != this.props.snippetBundle) {
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

		return (
			<div id='history-menu' className='dropdown' popover='auto' style={{ positionAnchor: '--history-menu' }}>
				<div className='menu-group'>Restore from...</div>
				{this.state.historyItems.map((item, index)=>{
					if(item.noData || !item.savedAt) return null;

					const saveTime = moment(item.savedAt);
					const diffString = saveTime.fromNow();

					return (
						<div className='snippet' key={index} onClick={()=>this.replaceContent(item)}>
							<i className='fas fa-trash-arrow-up' />
							<span className='name' title={`Restore version from ${moment(saveTime).format('YYYY/MM/DD HH:mm:ss')}`}>
								v{item.version} : {diffString}
							</span>
						</div>
					);
				})}
			</div>
		);
	},

	renderEditorButtons : function(){
		if(!this.props.showEditButtons) return;

		return (
			<div className='tools'>
				<div className='historyTools group'>
					<button id='show-history' type='button' className='tool' popovertarget='history-menu' style={{ anchorName: '--history-menu' }}>
						<i className='fas fa-clock-rotate-left' />
					</button>
					{this.renderHistoryItems()}
					<button id='undo' type='button' disabled={!this.props.historySize.undo ? true : false} className='tool'
						onClick={this.props.undo} >
						<i className='fas fa-undo' />
					</button>
					<button id='redo'type='button' disabled={!this.props.historySize.redo ? true : false} className='tool'
						onClick={this.props.redo} >
						<i className='fas fa-redo' />
					</button>
				</div>
				<div className='codeTools group'>
					<button id='fold-all' type='button' disabled={(this.props.view === 'meta' || !this.props.foldCode) ? true : false} className='tool'
						onClick={this.props.foldCode} >
						<i className='fas fa-compress-alt' />
					</button>
					<button id='unfold-all' type='button' disabled={(this.props.view === 'meta' || !this.props.unfoldCode) ? true : false} className='tool'
						onClick={this.props.unfoldCode} >
						<i className='fas fa-expand-alt' />
					</button>
					<button id='show-themes' type='button' className={`tool${this.state.themeSelector ? ' active' : ''}`}
						onClick={this.toggleThemeSelector} >
						<i className='fas fa-palette' />
						{this.state.themeSelector && this.renderThemeSelector()}
					</button>
				</div>

				<div className='editors group' role='tablist'>
					<button id='brew-tab' role='tab' type='button' className='tab' aria-selected={this.props.view === 'text'}
						onClick={()=>this.props.onViewChange('text')}>
						<i className='fa fa-beer' />
					</button>
					<button id='style-tab' role='tab' type='button' className='tab' aria-selected={this.props.view === 'style'}
						onClick={()=>this.props.onViewChange('style')}>
						<i className='fa fa-paint-brush' />
					</button>
					<button id='properties-tab' role='tab' type='button' className='tab' aria-selected={this.props.view === 'meta'}
						onClick={()=>this.props.onViewChange('meta')}>
						<i className='fas fa-info-circle' />
					</button>
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
			if(snippet.subsnippets){
				return (
					<>
						<button className='snippet menu-trigger' key={snippet.name} popovertarget={`${_.kebabCase(snippet.name)}-menu`} style={{ anchorName: `--${_.kebabCase(snippet.name)}-menu` }}>
							<span className={`name${snippet.disabled ? ' disabled' : ''}`} title={snippet.name}>{snippet.name}</span><i className='fas fa-caret-right'></i>
						</button>
						<div id={`${_.kebabCase(snippet.name)}-menu`} className='dropdown side' popover='auto' style={{ positionAnchor: `--${_.kebabCase(snippet.name)}-menu` }}>
							{this.renderSnippets(snippet.subsnippets)}
						</div>
					</>
				);
			} else {
				return <div className='snippet' key={snippet.name} onClick={(e)=>this.handleSnippetClick(e, snippet)}>
					<i className={snippet.icon} />
					<span className={`name${snippet.disabled ? ' disabled' : ''}`} title={snippet.name}>{snippet.name}</span>
					{snippet.experimental && <span className='beta'>beta</span>}
					{snippet.disabled     && <span className='beta' title='temporarily disabled due to large slowdown; under re-design'>disabled</span>}
				</div>;
			}

		});
	},

	render : function(){
		return <div className='snippet-menu' style={{ anchorName: `--${_.kebabCase(this.props.groupName)}-menu` }}>
			<button popovertarget={`${_.kebabCase(this.props.groupName)}-menu`}>
				<i className={this.props.icon} />
				<span className='groupName'>{this.props.groupName}</span>
			</button>
			<div id={`${_.kebabCase(this.props.groupName)}-menu`} className='dropdown' popover='auto' style={{ positionAnchor: `--${_.kebabCase(this.props.groupName)}-menu` }}>
				{this.renderSnippets(this.props.snippets)}
			</div>
		</div>;
	},
});
