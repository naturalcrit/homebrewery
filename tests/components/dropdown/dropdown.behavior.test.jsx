import React from 'react';
import { Dropdown } from '../../../client/components/dropdown/dropdown.jsx';
import { createOpenMenu, renderDropdown, setupDropdownTestLifecycle } from './dropdown.testUtils.js';

setupDropdownTestLifecycle();

describe('Dropdown behavior', ()=>{
	it('calls child click handlers when menu items are clicked', async ()=>{
		const onClick = jest.fn();
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Events'>
				<button className='menu-item' role='menuitem' onClick={onClick}>Click Me</button>
			</Dropdown>
		);

		host.querySelector('.menu-list .menu-item').click();
		expect(onClick).toHaveBeenCalledTimes(1);

		await cleanup();
	});

	it('dismisses open menus when clicking a normal menu action', async ()=>{
		const openMenu1 = createOpenMenu();
		const openMenu2 = createOpenMenu();
		const querySpy = jest.spyOn(document, 'querySelectorAll').mockImplementation((selector)=>{
			if(selector === '.menu-list:popover-open') return [openMenu1, openMenu2];
			return [];
		});

		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Dismiss'>
				<button className='menu-item' role='menuitem'>Close</button>
			</Dropdown>
		);

		host.querySelector('.menu-list .menu-item').click();

		expect(querySpy).toHaveBeenCalledWith('.menu-list:popover-open');
		expect(openMenu1.hidePopover).toHaveBeenCalledTimes(1);
		expect(openMenu2.hidePopover).toHaveBeenCalledTimes(1);

		await cleanup();
	});

	it('does not dismiss when no-dismiss is set to empty string or true', async ()=>{
		for (const noDismissValue of ['', 'true']) {
			const openMenu = createOpenMenu();
			const querySpy = jest.spyOn(document, 'querySelectorAll').mockImplementation((selector)=>{
				if(selector === '.menu-list:popover-open') return [openMenu];
				return [];
			});

			const { host, cleanup } = await renderDropdown(
				<Dropdown groupName={`No Dismiss ${noDismissValue || 'empty'}`}>
					<button className='menu-item' role='menuitem' no-dismiss={noDismissValue}>Stay Open</button>
				</Dropdown>
			);

			host.querySelector('.menu-list .menu-item').click();
			expect(querySpy).not.toHaveBeenCalled();
			expect(openMenu.hidePopover).not.toHaveBeenCalled();

			await cleanup();
			querySpy.mockRestore();
		}
	});

	it('does dismiss when no-dismiss is explicitly false', async ()=>{
		const openMenu = createOpenMenu();
		const querySpy = jest.spyOn(document, 'querySelectorAll').mockImplementation((selector)=>{
			if(selector === '.menu-list:popover-open') return [openMenu];
			return [];
		});

		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='No Dismiss False'>
				<button className='menu-item' role='menuitem' no-dismiss='false'>Close</button>
			</Dropdown>
		);

		host.querySelector('.menu-list .menu-item').click();

		expect(querySpy).toHaveBeenCalledWith('.menu-list:popover-open');
		expect(openMenu.hidePopover).toHaveBeenCalledTimes(1);

		await cleanup();
	});

	it('does not dismiss when clicking submenu trigger actions', async ()=>{
		const querySpy = jest.spyOn(document, 'querySelectorAll');
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Top'>
				<Dropdown groupName='Child'>
					<button className='menu-item' role='menuitem'>Leaf</button>
				</Dropdown>
			</Dropdown>
		);

		const submenuTrigger = host.querySelectorAll('.menu-wrapper > .menu-item')[1];
		submenuTrigger.click();

		expect(submenuTrigger.hasAttribute('popovertarget')).toBe(true);
		expect(querySpy).not.toHaveBeenCalledWith('.menu-list:popover-open');

		await cleanup();
	});

	it('handles iframe-click by hiding the open popover for this menu', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Iframe Dismiss'>
				<button className='menu-item' role='menuitem'>Item</button>
			</Dropdown>
		);

		const menu = host.querySelector('.menu-list');
		menu.matches = jest.fn((selector)=>selector === ':popover-open');
		menu.hidePopover = jest.fn();

		document.dispatchEvent(new Event('iframe-click'));

		expect(menu.matches).toHaveBeenCalledWith(':popover-open');
		expect(menu.hidePopover).toHaveBeenCalledTimes(1);

		await cleanup();
	});
});
