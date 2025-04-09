const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
require('./combobox.less');

const Combobox = createClass({
	displayName     : 'Combobox',
	getDefaultProps : function() {
		return {
			className   : '',
			trigger     : 'hover',
			default     : '',
			placeholder : '',
			autoSuggest : {
				clearAutoSuggestOnClick : true,
				suggestMethod           : 'includes',
				filterOn                : []  // should allow as array to filter on multiple attributes, or even custom filter
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
			value        : show ? '' : this.props.default,
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
	handleSelect : function(value, data=value){
		this.setState({
			value : value
		}, ()=>{this.props.onSelect(data);});
		;
	},
	renderTextInput : function(){
		return (
			<div className='dropdown-input item'
				onMouseEnter={this.props.trigger == 'hover' ? ()=>{this.handleDropdown(true);} : undefined}
				onClick=     {this.props.trigger == 'click' ? ()=>{this.handleDropdown(true);} : undefined}>
				<input
					type='text'
					onChange={(e)=>this.handleInput(e)}
					value={this.state.value || ''}
					placeholder={this.props.placeholder}
					onBlur={(e)=>{
						if(!e.target.checkValidity()){
							this.setState({
								value : this.props.default
							});
						}
					}}
				/>
				<i className='fas fa-caret-down'/>
			</div>
		);
	},
	renderDropdown : function(dropdownChildren){
		if(!this.state.showDropdown) return null;
		if(this.props.autoSuggest && !this.state.inputFocused){
			const suggestMethod = this.props.autoSuggest.suggestMethod;
			const filterOn = _.isString(this.props.autoSuggest.filterOn) ? [this.props.autoSuggest.filterOn] : this.props.autoSuggest.filterOn;
			const filteredArrays = filterOn.map((attr)=>{
				const children = dropdownChildren.filter((item)=>{
					if(suggestMethod === 'includes')
						return item.props[attr]?.toLowerCase().includes(this.state.value.toLowerCase());
					if(suggestMethod === 'startsWith')
						return item.props[attr]?.toLowerCase().startsWith(this.state.value.toLowerCase());
				});
				return children;
			});
			dropdownChildren = _.uniq(filteredArrays.flat(1));
		}

		return (
			<div className='dropdown-options'>
				{dropdownChildren}
			</div>
		);
	},
	render : function () {
		const dropdownChildren = this.state.options.map((child, i)=>{
			const clone = React.cloneElement(child, { onClick: ()=>this.handleSelect(child.props.value, child.props.data) });
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
