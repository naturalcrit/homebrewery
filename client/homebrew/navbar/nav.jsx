require('client/homebrew/navbar/navbar.less');
const React = require('react');
const { useState, useRef, useEffect } = React;
const createClass = require('create-react-class');
const _ = require('lodash');
const cx = require('classnames');

const NaturalCritIcon = require('client/components/svg/naturalcrit-d20.svg.jsx');

const Nav = {
	base : createClass({
		displayName : 'Nav.base',
		render      : function(){
			return <nav>
				{this.props.children}
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
			return <div className={`navSection ${this.props.className ?? ''}`}>
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
		handleClick : function(e){
			this.props.onClick(e);
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

	dropdown : function dropdown(props) {
		props = Object.assign({}, props, {
			trigger : 'hover click'
		});

		const myRef = useRef(null);
		const [showDropdown, setShowDropdown] = useState(false);

		useEffect(()=>{
			document.addEventListener('click', handleClickOutside);
			return ()=>{
				document.removeEventListener('click', handleClickOutside);
			};
		}, []);

		function handleClickOutside(e) {
			// Close dropdown when clicked outside
			if(!myRef.current?.contains(e.target)) {
				handleDropdown(false);
			}
		}

		function handleDropdown(show) {
			setShowDropdown(show ?? !showDropdown);
		}

		const dropdownChildren = React.Children.map(props.children, (child, i)=>{
			if(i < 1) return;
			return child;
		});

		return (
			<div className={`navDropdownContainer ${props.className ?? ''}`}
				ref={myRef}
				onMouseEnter = { props.trigger.includes('hover') ? ()=>handleDropdown(true)  : undefined }
				onMouseLeave = { props.trigger.includes('hover') ? ()=>handleDropdown(false) : undefined }
				onClick      = { props.trigger.includes('click') ? ()=>handleDropdown(true)  : undefined }
			>
				{props.children[0] || props.children /*children is not an array when only one child*/}
				{showDropdown && <div className='navDropdown'>{dropdownChildren}</div>}
			</div>
		);
	}

};


module.exports = Nav;
