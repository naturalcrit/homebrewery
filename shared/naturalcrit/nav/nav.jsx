require('./nav.less');
const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');

const Nav = {
	base : createClass({
		displayName : 'Nav.base',
		render      : function(){
			return <nav>
				<div className='navContent'>
					{this.props.children}
				</div>
			</nav>;
		}
	}),
	logo : function(){
		return <a className='navLogo' href='https://www.naturalcrit.com'>
			<NaturalCritIcon />
			<span className='name'>
				Natural<span className='crit'>Crit</span>
			</span>
		</a>;
	},

	section : createClass({
		displayName : 'Nav.section',
		render      : function(){
			return <div className='navSection'>
				{this.props.children}
			</div>;
		}
	}),

	item : createClass({
		displayName     : 'Nav.item',
		getDefaultProps : function() {
			return {
				icon    : null,
				href    : null,
				newTab  : false,
				onClick : function(){},
				color   : null
			};
		},
		handleClick : function(){
			this.props.onClick();
		},
		render : function(){
			const classes = cx('navItem', this.props.color, this.props.className);

			let icon;
			if(this.props.icon) icon = <i className={this.props.icon} />;

			const props = _.omit(this.props, ['newTab']);

			if(this.props.href){
				return <a {...props} className={classes} target={this.props.newTab ? '_blank' : '_self'} >
					{this.props.children}
					{icon}
				</a>;
			} else {
				return <div {...props} className={classes} onClick={this.handleClick} >
					{this.props.children}
					{icon}
				</div>;
			}
		}
	}),

	dropdown : createClass({
		displayName     : 'Nav.dropdown',
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
				<div className='navDropdown'>
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
				<div className={`navDropdownContainer ${this.props.className}`}
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


module.exports = Nav;
