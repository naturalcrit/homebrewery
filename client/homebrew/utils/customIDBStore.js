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
	const createCustomStore = async ()=>{
		return await IDB.createStore(db, store);
	};
	return {
		entries : async ()=>{
			// Return all entries : [[key1, value1], [key2, value2], ... [keyN, valueN] ]
			return await IDB.entries(await createCustomStore());
		},
		keys : async ()=>{
			// Return all keys : [ key1, key2, ... keyN ]
			return await IDB.keys(await createCustomStore());
		},
		values : async ()=>{
			// Return all values : [ value1, value2, ... valueN ]
			return await IDB.values(await createCustomStore());
		},
		clear : async ()=>{
			// Delete all keys and values
			return await IDB.clear(await createCustomStore);
		},
		get : async (key)=>{
			// Get a value by its key
			return await IDB.get(key, await createCustomStore());
		},
		getMany : async (keys)=>{
			// Get multiple values at once
			return await IDB.getMany(keys, await createCustomStore());
		},
		set : async (key, value)=>{
			// Set a value in the store by the key
			return await IDB.set(key, value, await createCustomStore());
		},
		setMany : async (entries)=>{
			// Set multiple values at once
			// `entries` is in the form : [ [key1, value1], [key2, value2], ... [keyN, valueN] ]
			return await IDB.setMany(entries, await createCustomStore());
		},
		update : async (key, updateFn)=>{
			// Update a value in a single atomic action
			return await IDB.update(key, updateFn, await createCustomStore());
		},
		del : async (key)=>{
			// Delete a single key and associated value from the store
			return await IDB.del(key, await createCustomStore());
		},
		delMany : async (keys)=>{
			// Delete multiple keys at once
			return await IDB.delMany(keys, await createCustomStore());
		}
	};
};