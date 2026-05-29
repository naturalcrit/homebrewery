import globalJsdom from 'jsdom-global';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

let cleanupJsdom;

const setupDropdownTestLifecycle = ()=>{
	beforeAll(()=>{
		cleanupJsdom = globalJsdom();
	});

	afterAll(()=>{
		cleanupJsdom?.();
	});

	afterEach(()=>{
		document.body.innerHTML = '';
		jest.restoreAllMocks();
	});
};

const renderDropdown = async (element)=>{
	const host = document.createElement('div');
	document.body.appendChild(host);
	const root = createRoot(host);

	await act(async ()=>{
		root.render(element);
	});

	return {
		host,
		cleanup : async ()=>{
			await act(async ()=>{
				root.unmount();
			});
			host.remove();
		}
	};
};

const createOpenMenu = ()=>{
	const menu = document.createElement('div');
	menu.className = 'menu-list';
	menu.hidePopover = jest.fn();
	return menu;
};

export { setupDropdownTestLifecycle, renderDropdown, createOpenMenu };
