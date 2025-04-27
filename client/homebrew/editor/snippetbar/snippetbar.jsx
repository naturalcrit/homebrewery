/*eslint max-lines: ["warn", {"max": 350, "skipBlankLines": true, "skipComments": true}]*/
require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');

import { loadHistory } from '../../utils/versionHistory.js';
const { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } = require('../../../components/menubar/Menubar.jsx');


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
			snippets      : [],
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

	changeTheme : function(e){
		if(e.target.value == this.props.currentEditorTheme) return;
		this.props.updateEditorTheme(e.target.value);
	},

	renderThemeSelector : function(){
		return <MenuItem id='themeSelector' icon='fas fa-palette'>
			<select value={this.props.currentEditorTheme} onChange={this.changeTheme} >
				{EditorThemes.map((theme, key)=>{
					return <option key={key} value={theme}>{theme}</option>;
				})}
			</select>
		</MenuItem>;
	},

	renderSnippetGroups : function(){
		const snippets = this.state.snippets.filter((snippetGroup)=>snippetGroup.view === this.props.view);
		if(snippets.length === 0) return (
			<MenuSection className='snippets'></MenuSection>
		);

		return <MenuSection className='snippets'>
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
		</MenuSection>;
	},

	replaceContent : function(item){
		return this.props.updateBrew(item);
	},


	renderHistoryItems : function() {
		if(!this.state.historyExists) return;

		return (
			<>
				<MenuRule text='Restore from' />
				{this.state.historyItems.map((item, index)=>{
					if(item.noData || !item.savedAt) return null;

					const saveTime = moment(item.savedAt);
					const diffString = saveTime.fromNow();

					return (
						<MenuItem icon='fas fa-trash-arrow-up' key={index} onClick={()=>this.replaceContent(item)}>
							<span title={`Restore version from ${moment(saveTime).format('YYYY/MM/DD HH:mm:ss')}`}>v{item.version} : {diffString}</span>
						</MenuItem>
					);
				})}
			</>
		);
	},

	renderEditorButtons : function(){
		if(!this.props.showEditButtons) return;

		return (
			<MenuSection className='tools'>
				<MenuSection id='history-tools' className='tool-group'>
					<MenuDropdown id='history' className='tool' groupName='history' icon='fas fa-clock-rotate-left' popovertarget='history-menu' style={{ anchorName: '--history-menu' }}>
						{this.renderHistoryItems()}
					</MenuDropdown>
					<MenuItem id='undo' icon='fas fa-undo' disabled={!this.props.historySize.undo ? true : false} className='tool'
						onClick={this.props.undo} >
						Undo
					</MenuItem>
					<MenuItem id='redo' icon='fas fa-redo' disabled={!this.props.historySize.redo ? true : false} className='tool'
						onClick={this.props.redo} >
						Redo
					</MenuItem>
				</MenuSection>
				<MenuSection id='code-tools' className='tool-group'>
					<MenuItem id='fold-all' icon='fas fa-compress-alt' disabled={(this.props.view === 'meta' || !this.props.foldCode) ? true : false} className='tool'
						onClick={this.props.foldCode} >
							Fold All Code
					</MenuItem>
					<MenuItem id='unfold-all' icon='fas fa-expand-alt' disabled={(this.props.view === 'meta' || !this.props.unfoldCode) ? true : false} className='tool'
						onClick={this.props.unfoldCode} >
						Unfold All Code
					</MenuItem>
					<MenuDropdown id='show-themes' className='tool' icon='fas fa-palette' groupName='Editor Themes'>
						{this.renderThemeSelector()}
					</MenuDropdown>
				</MenuSection>

				<MenuSection id='editor-tabs' className='tool-group' role='tablist'>
					<MenuItem id='brew-tab' role='tab' className='tab' icon='fa fa-beer' aria-selected={this.props.view === 'text'}
						onClick={()=>this.props.onViewChange('text')}>
						Brew Editor
					</MenuItem>
					<MenuItem id='style-tab' role='tab' className='tab' icon='fa fa-paint-brush' aria-selected={this.props.view === 'style'}
						onClick={()=>this.props.onViewChange('style')}>
						Style Editor
					</MenuItem>
					<MenuItem id='properties-tab' role='tab' className='tab' icon='fas fa-info-circle' aria-selected={this.props.view === 'meta'}
						onClick={()=>this.props.onViewChange('meta')}>
						Properties Editor
					</MenuItem>
				</MenuSection>
			</MenuSection>
		);
	},

	render : function(){
		return <Menubar id='snippet-bar'>
			{this.renderSnippetGroups()}
			{this.renderEditorButtons()}
		</Menubar>;
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
					<MenuDropdown id={snippet.name} className='snippet-menu' groupName={snippet.name} icon={snippet.icon} dir='right' key={snippet.name}>
						{this.renderSnippets(snippet.subsnippets)}
					</MenuDropdown>
				);
			} else {
				return (
					<MenuItem className={`snippet${snippet.disabled ? ' disabled' : ''}`} icon={snippet.icon} key={snippet.name} onClick={(e)=>this.handleSnippetClick(e, snippet)}>
						{snippet.name}
						{snippet.experimental && <span className='beta'>beta</span>}
						{snippet.disabled     && <span className='beta' title='temporarily disabled due to large slowdown; under re-design'>disabled</span>}

					</MenuItem>
				);
			}

		});
	},

	render : function(){
		return (
			<MenuDropdown id={this.props.groupName} className='snippet-menu' groupName={this.props.groupName} icon={this.props.icon} dir='down'>
				{this.renderSnippets(this.props.snippets)}
			</MenuDropdown>
		);
	},
});
