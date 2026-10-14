import React from 'react';
import cx from 'classnames';

const Nav = {
	item : ({ icon, kbd, href, newTab, onClick, children, className, disabled, noDismiss, ...props })=>{
		const classes = cx('navItem', className);
		if(disabled) {
			return <button className={classes} disabled>{icon && <i className={icon}></i>}{children}</button>;
		}
		if(href){
			return <a className={classes} href={href} target={newTab ? '_blank' : '_self'} {...props}>
				{icon && <i className={icon}></i>}
				{children}
			</a>;
		} else {
			return <button {...props} no-dismiss={noDismiss ? 'true' : undefined} className={classes} onClick={onClick} >
				{icon && <i className={icon}></i>}
				{children}
				{kbd && <kbd>{kbd}</kbd>}
			</button>;
		}
	},
	header : ({ span, className, children, ...props })=>{
		return <span className={cx([`navItem header`, className])} no-dismiss='true'>
			{children}
		</span>;
	},

};

export default Nav;
