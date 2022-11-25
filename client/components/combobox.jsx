const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
require('./combobox.less');

const Combobox = createClass({
	displayName     : 'Combobox',
	getDefaultProps : function() {
		return {
			className   : '',
			trigger     : 'hover',
			default     : '',
			autoSuggest : {
				clearAutoSuggestOnClick : true,
				suggestMethod           : 'includes',
				filterOn                : 'data-value'  // should allow as array to filter on multiple attributes, or even custom filter
			},
		};
	},
	getInitialState : function() {
		return {
			showDropdown : false,
			value        : '',
			options      : [...this.props.options],
			inputFocused : false
		};
	},
	componentDidMount : function() {
		if(this.props.trigger == 'click')
			document.addEventListener('click', this.handleClickOutside);
		this.setState({
			value : this.props.default
		});
	},
	componentWillUnmount : function() {
		if(this.props.trigger == 'click')
			document.removeEventListener('click', this.handleClickOutside);
	},
	handleClickOutside : function(e){
		// Close dropdown when clicked outside
		if(this.refs.dropdown && !this.refs.dropdown.contains(e.target)) {
			this.handleDropdown(false);
		}
	},
	handleDropdown : function(show){
		this.setState({
			showDropdown : show,
			inputFocused : this.props.autoSuggest.clearAutoSuggestOnClick ? show : false
		});
	},
	handleInput : function(e){
		e.persist();
		this.setState({
			value        : e.target.value,
			inputFocused : false
		}, ()=>{
			this.props.onEntry(e);
		});
	},
	handleSelect : function(e){
		this.setState({
			value : e.currentTarget.getAttribute('data-value')
		}, ()=>{this.props.onSelect(this.state.value);});
		;
	},
	renderTextInput : function(){
		return (
			<div className='dropdown-input item'
				onMouseEnter={this.props.trigger == 'hover' ? ()=>{this.handleDropdown(true);} : undefined}
				onClick=     {this.props.trigger == 'click' ? ()=>{this.handleDropdown(true);} : undefined}>
				<input type='text' onChange={(e)=>this.handleInput(e)} value={this.state.value || ''} />
			</div>
		);
	},
	renderDropdown : function(dropdownChildren){
		if(!this.state.showDropdown) return null;

		if(this.props.autoSuggest && !this.state.inputFocused){
			const suggestMethod = this.props.autoSuggest.suggestMethod;
			const filterOn = this.props.autoSuggest.filterOn;
			dropdownChildren = dropdownChildren.map((item)=>({
				...item,
				value : item.props[filterOn]
			}));
			if(suggestMethod === 'includes'){
				console.log('includes');
				dropdownChildren = dropdownChildren.filter((item)=>item.value.includes(this.state.value));
			} else if(suggestMethod === 'sequential'){
				dropdownChildren = dropdownChildren.filter((item)=>item.value.startsWith(this.state.value));
			}

		}


		return (
			<div className='dropdown-options'>
				{dropdownChildren}
			</div>
		);
	},
	render : function () {
		const dropdownChildren = this.state.options.map((child, i)=>{
			const clone = React.cloneElement(child, { onClick: (e)=>this.handleSelect(e) });
			return clone;
		});
		return (
			<div className={`dropdown-container ${this.props.className}`}
				ref='dropdown'
				onMouseLeave={this.props.trigger == 'hover' ? ()=>{this.handleDropdown(false);} : undefined}>
				{this.renderTextInput()}
				{this.renderDropdown(dropdownChildren)}
			</div>
		);
	}
});

module.exports = Combobox;