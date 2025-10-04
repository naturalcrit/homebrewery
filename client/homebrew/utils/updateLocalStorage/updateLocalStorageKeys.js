import getLocalStorageMap from './localStorageKeyMap.js';

const updateLocalStorage = function(){
	// Return if no window and thus no local storage
	if(typeof window === 'undefined') return;

	// Return if the local storage key map has no content
	const localStorageKeyMap = getLocalStorageMap();
	if(Object.keys(localStorageKeyMap).length == 0) return;

	const storage = window.localStorage;

	const deleteKeys = storage?.getItem('HB_deleteKeys') != null;
	console.log('DELETE KEYS:', deleteKeys);

	Object.keys(localStorageKeyMap).forEach((key)=>{
		if(storage[key] && !storage[localStorageKeyMap[key]]){
			const data = storage.getItem(key);
			storage.setItem(localStorageKeyMap[key], data);
			if(deleteKeys) storage.removeItem(key);
		}
	});

};

export { updateLocalStorage };