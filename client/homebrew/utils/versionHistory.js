import * as IDB from 'idb-keyval/dist/index.js';

export const HISTORY_PREFIX = 'HOMEBREWERY-HISTORY';
export const HISTORY_SLOTS = 5;

// History values in minutes
const DEFAULT_HISTORY_SAVE_DELAYS = {
	'0' : 0,
	'1' : 2,
	'2' : 10,
	'3' : 60,
	'4' : 12 * 60,
	'5' : 2 * 24 * 60
};

const DEFAULT_GARBAGE_COLLECT_DELAY = 28 * 24 * 60;

const HISTORY_SAVE_DELAYS = global.config?.historyData?.HISTORY_SAVE_DELAYS ?? DEFAULT_HISTORY_SAVE_DELAYS;
const GARBAGE_COLLECT_DELAY = global.config?.historyData?.GARBAGE_COLLECT_DELAY ?? DEFAULT_GARBAGE_COLLECT_DELAY;



function getKeyBySlot(brew, slot){
	// Return a string representing the key for this brew and history slot
	return `${HISTORY_PREFIX}-${brew.shareId}-${slot}`;
};

// function getVersionBySlot(brew, slot){
// 	// Read stored brew data
// 	// - If it exists, parse data to object
// 	// - If it doesn't exist, pass default object
// 	const key = getKeyBySlot(brew, slot);
// 	const storedVersion = IDB.get(key);
// 	const output = storedVersion ? storedVersion : { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };
// 	return output;
// };

function parseBrewForStorage(brew, slot = 0) {
	// Strip out unneeded object properties
	// Returns an array of [ key, brew ]
	const archiveBrew = {
		title    : brew.title,
		text     : brew.text,
		style    : brew.style,
		version  : brew.version,
		shareId  : brew.shareId,
		savedAt  : brew?.savedAt || new Date(),
		expireAt : new Date()
	};

	archiveBrew.expireAt.setMinutes(archiveBrew.expireAt.getMinutes() + HISTORY_SAVE_DELAYS[slot]);

	const key = getKeyBySlot(brew, slot);

	return [key, archiveBrew];
}


export async function historyCheck(brew){
	if(!IDB) return false;
	const historyExists = await IDB.keys()
		.then((keys)=>{
			return [...keys].some((key)=>{
				return key.startsWith(`${HISTORY_PREFIX}-${brew.shareId}`);
			});
		})
		.catch(()=>{return false;});

	return historyExists;
}

export async function loadHistory(brew){
	const DEFAULT_HISTORY_ITEM = { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };

	const historyKeys = [];

	// Create array of all history keys
	for (let i = 1; i <= HISTORY_SLOTS; i++){
		historyKeys.push(getKeyBySlot(brew, i));
	};

	const history = [];
	// Load all keys from IDB at once
	await IDB.getMany(historyKeys)
				.then((dataArray)=>{
					return dataArray.forEach((data)=>{
						history.push(data ?? DEFAULT_HISTORY_ITEM);
					});
				})
				.catch(()=>{
					historyKeys.forEach(()=>{
						history.push(DEFAULT_HISTORY_ITEM);
					});
				});

	return history;
}

export async function updateHistory(brew) {
	const history = await loadHistory(brew);

	// Walk each version position
	for (let slot = HISTORY_SLOTS - 1; slot >= 0; slot--){
		const storedVersion = history[slot];

		// If slot has expired, update all lower slots and break
		if(new Date() >= new Date(storedVersion.expireAt)){

			// Create array of arrays : [ [key1, value1], [key2, value2], ..., [keyN, valueN] ]
			// to pass to IDB.setMany
			const historyUpdate = [];

			for (let updateSlot = slot; updateSlot > 0; updateSlot--){
				// Move data from updateSlot to updateSlot + 1
				if(!history[updateSlot - 1]?.noData) {
					historyUpdate.push(parseBrewForStorage(history[updateSlot - 1], updateSlot + 1));
				}
			};

			// Update the most recent brew
			historyUpdate.push(parseBrewForStorage(brew, 1));

			IDB.setMany(historyUpdate);

			// Break out of data checks because we found an expired value
			break;
		}
	};
};

export function versionHistoryGarbageCollection(){
	console.log('Version History Garbage Collection');
	// Object.keys(IDB)
	// 	.filter((key)=>{
	// 		return key.startsWith(HISTORY_PREFIX);
	// 	})
	// 	.forEach((key)=>{
	// 		const collectAt = new Date(JSON.parse(IDB.get(key)).savedAt);
	// 		collectAt.setMinutes(collectAt.getMinutes() + GARBAGE_COLLECT_DELAY);
	// 		if(new Date() > collectAt){
	// 			IDB.removeItem(key);
	// 		}
	// 	});
};