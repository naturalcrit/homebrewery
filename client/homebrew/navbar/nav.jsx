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

	item : ({ icon, kbd,href, newTab, onClick, color, children, className, disabled, noDismiss, ...props })=>{
		const classes = cx('navItem', color, className);
		if(disabled) {
			return <button className={classes} disabled>{children}{icon && <i className={icon}></i>}</button>
		}
		if(href){
			return <a className={classes} href={href} target={newTab ? '_blank' : '_self'} {...props}>
				{children}
				{icon && <i className={icon}></i>}
			</a>;
		} else {
			return <button {...props} no-dismiss={noDismiss ? 'true' : undefined} className={classes} onClick={onClick} >
				{children}
				{icon && <i className={icon}></i>}
				{kbd && <kbd>{kbd}</kbd>}
			</button>;
		}
	},
	header: ({span, className, children, ...props})=>{
		return <li className={cx([`navItem header`, className])} no-dismiss='true'>
			{children}
		</li>;
	},

};

export default Nav;
