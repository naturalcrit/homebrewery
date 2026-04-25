/**
 * A dropdown menu component that uses the Anchor Positioning API to position the elements.  It supports nested submenus as well.
 * Anchor Positioning is now supported in all major browsers.  If support is needed for older browsers (namely, older firefox)
 * it is possible to use absolute positioning and calculations/resize observers to position things well enough, but adds another layer of complexity to the code.
 * @param {string} props.groupName - Name of the menu. Appears as the trigger text.
 * @param {string} [props.icon] - Icon to display in the trigger.
 * @param {string} [props.color] - Color class to add to the trigger.
 * @param {string} [props.className] - Additional classes for the menu wrapper.
 * @param {React.ReactNode} [props.customTrigger] - Custom element to use as a trigger.
 * @param {React.ReactNode} [props.children] - Child elements to render in the menu.
 * @param {'right'|'left'} [props.dir] - Preferred menu open direction.  Currently does nothing.
 * @returns {React.JSX.Element}
 */

import './dropdown.less';
import React, { useEffect } from 'react';
import _ from 'lodash';

// use react context to keep track of the menu depth (menus in menus)
const MenuDepthContext = React.createContext(0);

const Dropdown = ({ groupName, className = null, icon, children, color = null, customTrigger, dir = 'right', ...props })=>{
	const menuId = `${_.kebabCase(groupName)}-menu`;
	const anchorName = `--${menuId}`;
	const depth = React.useContext(MenuDepthContext);

	// A menu is a submenu if depth > 0
	const isSubMenu = depth > 0;


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
	const trigger = (groupName)=>{
		if(!customTrigger){
			return <>
				<span className='menu-name'>{groupName}</span><i className={`caret fas fa-caret-${isSubMenu ? 'right' : 'down'}`}></i>
			</>;
		} else {
			return customTrigger;
		}
	};

	return (
		<div className={['menu-wrapper', className].join(' ')} style={{ anchorName }} role='none' >
			<button
				id={groupName.replace(' ', '-')}
				className={['menu-item', color].join(' ')}
				popoverTarget={menuId}
				icon={icon}
				aria-haspopup='menu'
				role='menuitem'
				disabled={children.length > 0 ? false : true}
			>
				{trigger(groupName)}
			</button>
			<MenuDepthContext.Provider value={depth + 1}>
				<div
					id={menuId}
					className='menu-list'
					popover='auto'
					style={{ positionAnchor: anchorName }}
					role='menu'
				>
					{children}
				</div>
			</MenuDepthContext.Provider>
		</div>
	);
};

export { Dropdown };