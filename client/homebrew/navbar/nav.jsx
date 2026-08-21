import './navbar.less';
import React, { useState, useRef, useEffect } from 'react';
import cx from 'classnames';

import NaturalCritIcon from '@components/svg/naturalcrit-d20.svg.jsx';

const Nav = {
	base : ({ children, className, ...props })=>{
		return <nav className={className}>
			{children}
		</nav>;
	},
	logo : ()=>{
		return <a className='navLogo' href='https://www.naturalcrit.com'>
			<NaturalCritIcon />
			<span className='name'>
				Natural<span className='crit'>Crit</span>
			</span>
		</a>;
	},

	section : ({ children, className, ...props })=>{
		return <div className={cx([`navSection`, className])}>
			{children}
		</div>;
	},

	item : ({ icon,	href,	newTab,	onClick, color, children, className, ...props })=>{
		const classes = cx('navItem', color, className);
		if(href){
			return <a className={classes} href={href} target={newTab ? '_blank' : '_self'} {...props}>
				{children}
				{icon && <i className={icon}></i>}
			</a>;
		} else {
			return <button {...props} className={classes} onClick={onClick} >
				{children}
				{icon && <i className={icon}></i>}
			</button>;
		}
	},

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


export default Nav;
