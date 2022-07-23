require('./snippetbar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

//Import all themes

const Themes = require('themes/themes.json');

const ThemeSnippets = {};
ThemeSnippets['Legacy_5ePHB'] = require('themes/Legacy/5ePHB/snippets.js');
ThemeSnippets['V3_5ePHB']     = require('themes/V3/5ePHB/snippets.js');
ThemeSnippets['V3_5eDMG']     = require('themes/V3/5eDMG/snippets.js');
ThemeSnippets['V3_Journal']   = require('themes/V3/Journal/snippets.js');

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
		let snippets = ThemeSnippets[`${rendererPath}_${themePath}`];
		snippets = this.compileSnippets(rendererPath, themePath, snippets);
		this.setState({
			snippets : snippets
		});
	},

	componentDidUpdate : async function(prevProps) {
		if(prevProps.renderer != this.props.renderer || prevProps.theme != this.props.theme) {
			const rendererPath = this.props.renderer == 'V3' ? 'V3' : 'Legacy';
			const themePath    = this.props.theme ?? '5ePHB';
			console.log({ ThemeSnippets: ThemeSnippets });
			let snippets = ThemeSnippets[`${rendererPath}_${themePath}`];
			snippets = this.compileSnippets(rendererPath, themePath, snippets);
			this.setState({
				snippets : snippets
			});
		}
	},

	mergeCustomizer : function(objValue, srcValue) {
		if(_.isArray(objValue)) {
			const result = _.unionBy(srcValue, objValue, 'name'); // Join snippets together, with preference for the current theme over the base theme
			return _.filter(result, 'gen'); //Only keep snippets with a 'gen' property.
		}
	},

	compileSnippets : function(rendererPath, themePath, snippets) {
		let compiledSnippets = snippets;
		const baseSnippetsPath = Themes[rendererPath][themePath].baseSnippets;
		//console.log({ baseSnippets: ThemeSnippets[`${rendererPath}_${baseSnippetsPath}`] });
		//console.log({ themeSnippets: compiledSnippets });

		if(baseSnippetsPath) {
			compiledSnippets = _.mergeWith([], ThemeSnippets[`${rendererPath}_${baseSnippetsPath}`], compiledSnippets, this.mergeCustomizer);
			console.log({ compiledSnippets: compiledSnippets });
			//this.compileSnippets(rendererPath, themePath, compiledSnippets); (for nested baseSnippets)
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

	renderEditorButtons : function(){
		if(!this.props.showEditButtons) return;

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
	handleSnippetClick : function(snippet){
		this.props.onSnippetClick(execute(snippet.gen, this.props.brew));
	},
	renderSnippets : function(){
		return _.map(this.props.snippets, (snippet)=>{
			return <div className='snippet' key={snippet.name} onClick={()=>this.handleSnippetClick(snippet)}>
				<i className={snippet.icon} />
				{snippet.name}
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
				{this.renderSnippets()}
			</div>
		</div>;
	},

});
