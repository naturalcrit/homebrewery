require('./navbar.less');
const React = require('react');
const { useRef, useEffect } = React;
const cx = require('classnames');

const { NavbarContext } = require('./navbarContext.jsx');

const Navbar = ({ children })=>{
	return (
		<nav>
			{children}
		</nav>
	);
};



const NavSection = ({ className, children })=>{
	return <div className={`navSection ${className ?? ''}`}>
		{children}
	</div>;
};

const NavItem = ({ icon = null, href = null, newTab = false, onClick = ()=>{}, color = null, className = null, children, caret = null, ...props })=>{

	const handleClick = (e)=>{
		onClick(e);
	};

	const renderNavItem = ()=>{
		const classes = cx('navItem', color, className);

		if(icon) icon = <i className={icon} />;

		if(href){
			return <a {...props} className={classes} target={newTab ? '_blank' : '_self'} >
				{icon}
				{children && <span>{children}</span>}
				{caret && <i className='fas fa-caret-right' />}
			</a>;
		} else {
			return <div {...props} className={classes} onClick={handleClick} >
				{icon}
				{children && <span>{children}</span>}
				{caret && <i className='fas fa-caret-right' />}
			</div>;
		}
	};

	return renderNavItem();
};

const Dropdown = ({ className = null, children, disabled = false, id, ...props })=>{
	const myRef = useRef(null);
	const { openMenus, isMenuOpen, openMenu, closeMenu, closeAllMenus } = React.useContext(NavbarContext);
	const isOpen = isMenuOpen(id);

	useEffect(()=>{
		document.addEventListener('click', handleClickOutside);
		return ()=>{
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleClickOutside = (e)=>{
		if(!myRef.current?.contains(e.target)) {
			closeAllMenus();
		}
	};

	const handleTriggerClick = (e)=>{
		e.stopPropagation();
		if(disabled) return;

		const parentMenu = myRef.current?.closest('.navDropdown');
		if(isOpen) {
			closeMenu(id);
		} else {
			// If it's a submenu, keep parent open
			if(!parentMenu) {
				closeAllMenus(); // Close all other menus if this is top-level
			}
			openMenu(id);
		}
	};

	const handleMouseEnter = ()=>{
		if(disabled) return;
		const parentMenu = myRef.current?.closest('.navDropdown');
		// Only handle hover for top-level menus
		if(!parentMenu && openMenus.size > 0 && !isOpen) {
			closeAllMenus();
			openMenu(id);
		}
	};


	const childrenArray = React.Children.toArray(children);
	const triggerElement = childrenArray[0];
	const menuItems = childrenArray.slice(1);

	const trigger = React.cloneElement(triggerElement, {
		onClick : (e)=>{
			triggerElement.props.onClick?.(e);
			handleTriggerClick(e);
		},
		onMouseEnter : handleMouseEnter
	});

	return (
		<div
			className={`navDropdownContainer ${className ?? ''}`}
			ref={myRef}
			data-menu-id={id}
			onMouseEnter={handleMouseEnter}
		>
			{trigger}
			{isOpen && (
				<div className='navDropdown'>
					{menuItems}
				</div>
			)}
		</div>
	);
};

module.exports = { Navbar, NavSection, NavItem, Dropdown };
