/**
 * A dropdown menu component that uses the Anchor Positioning API to position the elements.  It supports nested submenus as well.
 * Anchor Positioning is now supported in all major browsers.  A polyfill is conditionally loaded for older browsers.
 * 
 * As-is, the menus will always open down aligned on left to trigger, submenus open to the right initially.
 * If no space, menus will still open down, but aligned to the right of the trigger.  Submenus will flip to the other side of the top menu.
 * This could be customized either in more specific CSS, or as a `direction` prop on the component (in future iterations).
 * 
 * @param {string} props.groupName - Name of the menu. Appears as the trigger text.
 * @param {string} [props.icon] - Icon to display in the trigger.
 * @param {string} [props.color] - Color class to add to the trigger.
 * @param {string} [props.className] - Additional classes for the menu wrapper.
 * @param {React.ReactNode} [props.customTrigger] - Custom element to use as a trigger.
 * @param {React.ReactNode} [props.children] - Child elements to render in the menu.
 * @returns {React.JSX.Element}
 */

import './dropdown.less';
import React, { useEffect, useId, useRef } from 'react';
import _ from 'lodash';

// use react context to keep track of the menu depth (menus in menus)
const MenuDepthContext = React.createContext(0);

const Dropdown = ({ groupName, className = null, icon, children, color = null, customTrigger, ...props })=>{
	const reactId = useId();
	const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
	const menuId = `${_.kebabCase(groupName)}-${safeId}-menu`;
	const anchorName = `--${menuId}`;
	const depth = React.useContext(MenuDepthContext);

	// A menu is a submenu if depth > 0
	const isSubMenu = depth > 0;

	const triggerRef = useRef(null);
	const menuRef = useRef(null);

	// use setAttribute instead of the React style prop because React strips unknown CSS
	// properties (like anchor-name) from inline styles in browsers that don't support them.
	// setAttribute writes raw CSS text that the anchor positioning polyfill can read
	useEffect(()=>{
		triggerRef.current?.setAttribute('style', `anchor-name: ${anchorName}`);
		menuRef.current?.setAttribute('style', `position-anchor: ${anchorName}`);
	}, [anchorName]);

	// hide popover with click inside iframe (not supported by light dismiss)
	useEffect(()=>{
		const menuElement = document.getElementById(menuId);
		if(!menuElement) return;

		const handleClick = ()=>{
			if(menuElement.matches(':popover-open')) {
				menuElement.hidePopover();
			}
		};
		// Listen for clicks from both the main document and the iframe
		document.addEventListener('iframe-click', handleClick);
		return ()=>{
			document.removeEventListener('iframe-click', handleClick);
		};
	}, [menuId]);

	// the trigger is the piece placed inside the opening button of the menu.
	// This method allows for creating a generic span with the group name,
	// or using a bespoke element (like a graphic) passed in from props to be used as the trigger
	const trigger = (groupName = 'menu', icon = '')=>{
		if(!customTrigger){
			return <>
				<i className={icon}></i><span className='menu-name'>{groupName}</span><i className={`caret fas fa-caret-${isSubMenu ? 'right' : 'down'}`}></i>
			</>;
		} else {
			return customTrigger;
		}
	};

	// handle clicks on menu items. By default, actions do dismiss.
	const handleMenuActionClick = (event)=>{
		const menuElement = menuRef.current;
		if(!menuElement) return;

		const menuAction = event.target.closest('button, a, [role="menuitem"]');
		if(!menuAction || !menuElement.contains(menuAction)) return;

		// don't dismiss if the target triggers a submenu
		if(menuAction.hasAttribute('popovertarget')) return;

		// don't dismiss if the target has `no-dismiss` attribute
		const noDismissValue = menuAction.getAttribute('no-dismiss')?.toLowerCase();
		if(noDismissValue === '' || noDismissValue === 'true') return;

		document.querySelectorAll('.menu-list:popover-open').forEach((openMenu)=>openMenu.hidePopover());
	};

	return (
		<div className={['menu-wrapper', className].join(' ')} role='none' >
			<button
				id={`${menuId}-trigger`}
				className={['menu-item', color].join(' ')}
				popoverTarget={menuId}
				aria-haspopup='menu'
				role='menuitem'
				disabled={!React.Children.count(children)}
				ref={triggerRef}
			>
				{trigger(groupName, icon)}
			</button>
			<MenuDepthContext.Provider value={depth + 1}>
				<div
					ref={menuRef}
					id={menuId}
					className='menu-list'
					popover='auto'
					role='menu'
					onClick={handleMenuActionClick}
				>
					{children}
				</div>
			</MenuDepthContext.Provider>
		</div>
	);
};

export { Dropdown };