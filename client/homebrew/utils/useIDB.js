import {
	get as iGet,
	getMany as iGetMany,
	set as iSet,
	setMany as iSetMany,
	update as iUpdate,
	del as iDel,
	keys,
	createStore,
	Store
} from 'idb-keyval/dist/index.js'; // EcmaScript Module

const HOMEBREWERY_DB = 'HOMEBREWERY-DB';
const HOMEBREWERY_STORE = 'HOMEBREWERY-STORE';

let hbStore;

function init(){
	if(hbStore) return true;
	if(!hbStore && typeof window != 'undefined' && typeof window.indexedDB != 'undefined'){
		hbStore = createStore(HOMEBREWERY_DB, HOMEBREWERY_STORE);
		return true;
	}
	return false;
}

function checkFn(fn){
	return init() && fn();
};

const get = checkFn(async (key)=>{
	console.log('get:', key);
	return iGet(key, hbStore);
});

const getMany = checkFn(async (keys)=>{
	checkFn(async ()=>{
		console.log('getMany:', keys);
		return await iGetMany(keys, hbStore);
	});
});

const set = checkFn(async (key, val)=>{
	console.log('set:', key, val);
	init();
	return iSet(key, val, hbStore);
});

const setMany = checkFn(async (keyValArray)=>{
	console.log('set:', keyValArray);
	init();
	return iSetMany(keyValArray, hbStore);
});


const update = checkFn(async (key, updateFn)=>{
	init();
	return iUpdate(key, updateFn, hbStore);
});

const remove = checkFn(async (key)=>{
	console.log('remove:', key);
	init();
	return iDel(key, hbStore);
});

const list = checkFn(async ()=>{
	init();
	return await keys(hbStore);
});

module.exports = {
	get,
	getMany,
	set,
	setMany,
	update,
	remove,
	list
};