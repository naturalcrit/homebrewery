import React from 'react';
import { Dropdown } from './dropdown.jsx';
import { renderDropdown, setupDropdownTestLifecycle } from './dropdown.testUtils.js';

setupDropdownTestLifecycle();

describe('Dropdown structure', ()=>{
	it('renders expected structure, classes, and accessibility roles', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Actions' className='extra-class' color='blue'>
				<button className='menu-item' role='menuitem'>Do Thing</button>
			</Dropdown>
		);

		const wrapper = host.querySelector('.menu-wrapper');
		const trigger = wrapper.querySelector('button.menu-item.blue');
		const menu = wrapper.querySelector('.menu-list');

		expect(wrapper).toBeTruthy();
		expect(wrapper.className).toContain('extra-class');
		expect(wrapper.getAttribute('role')).toBe('none');
		expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
		expect(trigger.getAttribute('role')).toBe('menuitem');
		expect(menu.getAttribute('role')).toBe('menu');
		expect(menu.getAttribute('popover')).toBe('auto');

		await cleanup();
	});

	it('creates ids and popovertarget values that match and are unique per instance', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<div>
				<Dropdown groupName='Repeated Label'>
					<button className='menu-item' role='menuitem'>A</button>
				</Dropdown>
				<Dropdown groupName='Repeated Label'>
					<button className='menu-item' role='menuitem'>B</button>
				</Dropdown>
			</div>
		);

		const triggers = Array.from(host.querySelectorAll('.menu-wrapper > .menu-item'));
		const menus = Array.from(host.querySelectorAll('.menu-list'));
		const menuIds = menus.map((menu)=>menu.id);

		expect(triggers).toHaveLength(2);
		expect(menus).toHaveLength(2);
		expect(new Set(menuIds).size).toBe(2);
		expect(triggers[0].getAttribute('popovertarget')).toBe(menuIds[0]);
		expect(triggers[1].getAttribute('popovertarget')).toBe(menuIds[1]);
		expect(triggers[0].id).toBe(`${menuIds[0]}-trigger`);

		await cleanup();
	});

	it('applies css anchor styles to trigger and menu', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Anchored'>
				<button className='menu-item' role='menuitem'>Item</button>
			</Dropdown>
		);

		const trigger = host.querySelector('.menu-wrapper > .menu-item');
		const menu = host.querySelector('.menu-list');
		const menuId = menu.id;

		expect(trigger.getAttribute('style')).toBe(`anchor-name: --${menuId}`);
		expect(menu.getAttribute('style')).toBe(`position-anchor: --${menuId}`);

		await cleanup();
	});

	it('disables the trigger when no children are present', async ()=>{
		const { host, cleanup } = await renderDropdown(<Dropdown groupName='Empty' />);

		expect(host.querySelector('.menu-wrapper > .menu-item').disabled).toBe(true);

		await cleanup();
	});

	it('renders icon class and default caret', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Icons' icon='fas fa-star'>
				<button className='menu-item' role='menuitem'>Item</button>
			</Dropdown>
		);

		const trigger = host.querySelector('.menu-wrapper > .menu-item');
		expect(trigger.querySelector('i.fas.fa-star')).toBeTruthy();
		expect(trigger.querySelector('i.caret').className).toContain('fa-caret-down');

		await cleanup();
	});

	it('renders a custom trigger when provided', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Custom Trigger' customTrigger={<span className='custom-trigger'>Open Menu</span>}>
				<button className='menu-item' role='menuitem'>Item</button>
			</Dropdown>
		);

		const trigger = host.querySelector('.menu-wrapper > .menu-item');
		expect(trigger.querySelector('.custom-trigger')).toBeTruthy();
		expect(trigger.querySelector('.caret')).toBeFalsy();

		await cleanup();
	});

	it('supports nested submenus to at least 3 levels deep', async ()=>{
		const { host, cleanup } = await renderDropdown(
			<Dropdown groupName='Level 1'>
				<Dropdown groupName='Level 2'>
					<Dropdown groupName='Level 3'>
						<button className='menu-item' role='menuitem'>Leaf</button>
					</Dropdown>
				</Dropdown>
			</Dropdown>
		);

		const triggers = Array.from(host.querySelectorAll('.menu-wrapper > .menu-item'));
		const menus = Array.from(host.querySelectorAll('.menu-list'));

		expect(triggers).toHaveLength(3);
		expect(menus).toHaveLength(3);

		for (const trigger of triggers) {
			const targetId = trigger.getAttribute('popovertarget');
			expect(targetId).toBeTruthy();
			expect(host.querySelector(`#${targetId}`)).toBeTruthy();
		}

		expect(triggers[1].querySelector('.caret').className).toContain('fa-caret-right');
		expect(triggers[2].querySelector('.caret').className).toContain('fa-caret-right');

		await cleanup();
	});
});
