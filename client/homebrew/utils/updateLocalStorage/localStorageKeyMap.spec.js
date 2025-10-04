import getLocalStorageMap from './localStorageKeyMap.js';

describe('getLocalStorageMap', ()=>{
	it('no username', ()=>{
		const account = global.account;

		delete global.account;

		const map = getLocalStorageMap();

		global.account = account;

		expect(map).toBeInstanceOf(Object);
		expect(Object.entries(map)).toHaveLength(16);
	});

	it('no username', ()=>{
		const account = global.account;

		global.account = { username: 'test' };

		const map = getLocalStorageMap();

		global.account = account;

		expect(map).toBeInstanceOf(Object);
		expect(Object.entries(map)).toHaveLength(17);
		expect(map).toHaveProperty('HOMEBREWERY-DEFAULT-SAVE-LOCATION-test', 'HB_editor_defaultSave_test');
	});
});