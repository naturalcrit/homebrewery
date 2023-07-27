require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');


import * as Menubar from '@radix-ui/react-menubar';
import { LinkItem, ButtonItem, Menu, SubMenu } from '../../navbar/menubarExtensions.jsx';


//Import all themes

const Themes = require('themes/themes.json');

const ThemeSnippets = {};
ThemeSnippets['Legacy_5ePHB'] = require('themes/Legacy/5ePHB/snippets.js');
ThemeSnippets['V3_5ePHB']     = require('themes/V3/5ePHB/snippets.js');
ThemeSnippets['V3_5eDMG']     = require('themes/V3/5eDMG/snippets.js');
ThemeSnippets['V3_Journal']   = require('themes/V3/Journal/snippets.js');
ThemeSnippets['V3_Blank']     = require('themes/V3/Blank/snippets.js');

const execute = function(val, brew){
	if(_.isFunction(val)) return val(brew);
	return val;
};

const Snippetbar = createClass({
	displayName     : 'SnippetBar',
	getDefaultProps : function() {
		return {
			brew            : {},
			view            : 'text',
			onViewChange    : ()=>{},
			onInject        : ()=>{},
			onToggle        : ()=>{},
			showEditButtons : true,
			renderer        : 'legacy',
			undo            : ()=>{},
			redo            : ()=>{},
			historySize     : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			renderer : this.props.renderer,
			snippets : []
		};
	},

	componentDidMount : async function() {
		const rendererPath = this.props.renderer == 'V3' ? 'V3' : 'Legacy';
		const themePath    = this.props.theme ?? '5ePHB';
		let snippets = _.cloneDeep(ThemeSnippets[`${rendererPath}_${themePath}`]);
		snippets = this.compileSnippets(rendererPath, themePath, snippets);
		this.setState({
			snippets : snippets
		});
	},

	componentDidUpdate : async function(prevProps) {
		if(prevProps.renderer != this.props.renderer || prevProps.theme != this.props.theme) {
			const rendererPath = this.props.renderer == 'V3' ? 'V3' : 'Legacy';
			const themePath    = this.props.theme ?? '5ePHB';
			let snippets = _.cloneDeep(ThemeSnippets[`${rendererPath}_${themePath}`]);
			snippets = this.compileSnippets(rendererPath, themePath, snippets);
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

	compileSnippets : function(rendererPath, themePath, snippets) {
		let compiledSnippets = snippets;
		const baseSnippetsPath = Themes[rendererPath][themePath].baseSnippets;

		const objB = _.keyBy(compiledSnippets, 'groupName');

		if(baseSnippetsPath) {
			const objA = _.keyBy(_.cloneDeep(ThemeSnippets[`${rendererPath}_${baseSnippetsPath}`]), 'groupName');
			compiledSnippets = _.values(_.mergeWith(objA, objB, this.mergeCustomizer));
			compiledSnippets = this.compileSnippets(rendererPath, baseSnippetsPath, _.cloneDeep(compiledSnippets));
		} else {
			const objA = _.keyBy(_.cloneDeep(ThemeSnippets[`${rendererPath}_Blank`]), 'groupName');
			compiledSnippets = _.values(_.mergeWith(objA, objB, this.mergeCustomizer));
		}
		return compiledSnippets;
	},

	handleSnippetClick : function(injectedText){
		this.props.onInject(injectedText);
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
			/>;
		});
	},


	render : function(){
		return <Menubar.Root className='snippet-bar' id='snippetBar'>
			{this.renderSnippetGroups()}
		</Menubar.Root >;
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
		this.props.onSnippetClick(execute(snippet.gen, this.props.brew));
	},
	renderSnippets : function(snippets){
		return _.map(snippets, (snippet)=>{
			if(!snippet.subsnippets){
				return <ButtonItem className='snippet' key={snippet.name} onSelect={(e)=>this.handleSnippetClick(e, snippet)}>
				 	<i className={snippet.icon} />
				 	<span className='name'>{snippet.name}</span>
				 	{snippet.experimental && <span className='beta'>beta</span>}
				</ButtonItem>
			} else if(snippet.subsnippets){
				return <SubMenu className='snippet-menu' trigger={snippet.name} key={snippet.name}>
			 			{this.renderSnippets(snippet.subsnippets)}
				</SubMenu>
			}

		});
	},

	render : function(){
		return <Menu className='snippet-menu' trigger={this.props.groupName}>  	{/* needs icons added back in before being finished */}
			{this.renderSnippets(this.props.snippets)}
		</Menu>;
	},

});
