import localStorageKeyMap from './localStorageKeyMap.json' with { type: 'json' };

const addDynamicKeys = function(keyObject){

	if(global?.account?.username){
		const username = global.account.username;
		 keyObject[`HOMEBREWERY-DEFAULT-SAVE-LOCATION-${username}`] = `HB_editor_defaultSave_${username}`;
	}

	return keyObject;
};

const updateLocalStorage = function(){
	// Return if no window and thus no local storage
	if(typeof window === 'undefined') return;

	// Return if the local storage key map has no content
	if(Object.keys(localStorageKeyMap).length == 0) return;

	const storage = window.localStorage;
	const storageKeyMap = addDynamicKeys(localStorageKeyMap);

	Object.keys(storageKeyMap).forEach((key)=>{
		if(storage[key]){
			const data = storage.getItem(key);
			if(!storage[storageKeyMap[key]]) storage.setItem(storageKeyMap[key], data);
			// storage.removeItem(key);
		}
	});

};

export { updateLocalStorage };