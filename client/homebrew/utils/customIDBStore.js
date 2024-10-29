import * as IDB from 'idb-keyval/dist/index.js';

// The Proxy and the Wrapper _should_ be equivalent

// IndexedDB Proxy

export function initIDBProxy(db, store) {

	const PROP_LIST = [
		'entries',
		'keys',
		'values',
		'clear',
		'get',
		'getMany',
		'set',
		'setMany',
		'update',
		'del',
		'delMany'
	];

	const IDBHandler = {
		get : (target, prop)=>{
			if(!PROP_LIST.includes(prop)){ return target[prop]; }
			return function (...args) {
				return target[prop].apply(target, [...args, target.createStore(db, store)]);
			};
		}
	};

	return new Proxy(IDB, IDBHandler);
}


// IndexedDB Wrapper

export function initCustomStore(db, store){
	const createCustomStore = async ()=>IDB.createStore(db, store);

	return {
		entries : async ()=>IDB.entries(await createCustomStore()),
		keys    : async ()=>IDB.keys(await createCustomStore()),
		values  : async ()=>IDB.values(await createCustomStore()),
		clear   : async ()=>IDB.clear(await createCustomStore),
		get     : async (key)=>IDB.get(key, await createCustomStore()),
		getMany : async (keys)=>IDB.getMany(keys, await createCustomStore()),
		set     : async (key, value)=>IDB.set(key, value, await createCustomStore()),
		setMany : async (entries)=>IDB.setMany(entries, await createCustomStore()),
		update  : async (key, updateFn)=>IDB.update(key, updateFn, await createCustomStore()),
		del     : async (key)=>IDB.del(key, await createCustomStore()),
		delMany : async (keys)=>IDB.delMany(keys, await createCustomStore())
	};
};