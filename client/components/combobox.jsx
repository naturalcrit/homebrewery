const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');
require('./combobox.less');

const Dropdown = {
	combo : createClass({
		displayName     : 'Dropdown.combo',
		getDefaultProps : function() {
			return {
				trigger : 'hover'
			};
		},
		getInitialState : function() {
			return {
				showDropdown : false
			};
		},
		componentDidMount : function() {
			if(this.props.trigger == 'click')
				document.addEventListener('click', this.handleClickOutside);
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
				showDropdown : show
			});
		},
		renderDropdown : function(dropdownChildren){
			if(!this.state.showDropdown) return null;

			return (
				<div className='dropdown-options'>
					{dropdownChildren}
				</div>
			);
		},
		render : function () {
			const dropdownChildren = React.Children.map(this.props.children, (child, i)=>{
				// Ignore the first child
				if(i < 1) return;
				return child;
			});
			return (
				<div className={`dropdown-container ${this.props.className}`}
					ref='dropdown'
					onMouseEnter={this.props.trigger == 'hover' ? ()=>{this.handleDropdown(true);} : undefined}
					onClick=     {this.props.trigger == 'click' ? ()=>{this.handleDropdown(true);} : undefined}
					onMouseLeave={this.props.trigger == 'hover' ? ()=>{this.handleDropdown(false);} : undefined}>
					{this.props.children[0] || this.props.children /*children is not an array when only one child*/}
					{this.renderDropdown(dropdownChildren)}
				</div>
			);
		}
	})
};

module.exports = Dropdown;