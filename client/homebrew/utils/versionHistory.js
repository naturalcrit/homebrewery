import { initCustomStore } from './customIDBStore.js';

export const HISTORY_PREFIX = 'HOMEBREWERY-HISTORY';
export const HISTORY_SLOTS = 5;

// History values in minutes
const HISTORY_SAVE_DELAYS = {
	'0' : 0,
	'1' : 2,
	'2' : 10,
	'3' : 60,
	'4' : 12 * 60,
	'5' : 2 * 24 * 60
};
// const HISTORY_SAVE_DELAYS = {
// 	'0' : 0,
// 	'1' : 1,
// 	'2' : 2,
// 	'3' : 3,
// 	'4' : 4,
// 	'5' : 5
// };

const GARBAGE_COLLECT_DELAY = 28 * 24 * 60;
// const GARBAGE_COLLECT_DELAY = 10;


const HB_DB = 'HOMEBREWERY-DB';
const HB_STORE = 'HISTORY';

const IDB = initCustomStore(HB_DB, HB_STORE);

function getKeyBySlot(brew, slot){
	// Return a string representing the key for this brew and history slot
	return `${HISTORY_PREFIX}-${brew.shareId}-${slot}`;
};

function parseBrewForStorage(brew, slot = 0) {
	// Strip out unneeded object properties
	// Returns an array of [ key, brew ]
	const archiveBrew = {
		title    : brew.title,
		text     : brew.text,
		style    : brew.style,
		snippets : brew.snippets,
		version  : brew.version,
		shareId  : brew.shareId,
		savedAt  : brew?.savedAt || new Date(),
		expireAt : new Date()
	};

	archiveBrew.expireAt.setMinutes(archiveBrew.expireAt.getMinutes() + HISTORY_SAVE_DELAYS[slot]);

	const key = getKeyBySlot(brew, slot);

	return [key, archiveBrew];
}

export async function loadHistory(brew){
	const DEFAULT_HISTORY_ITEM = { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };

	const historyKeys = [];

	// Create array of all history keys
	for (let i = 1; i <= HISTORY_SLOTS; i++){
		historyKeys.push(getKeyBySlot(brew, i));
	};

	// Load all keys from IDB at once
	const dataArray = await IDB.getMany(historyKeys);
	return dataArray.map((data)=>{ return data ?? DEFAULT_HISTORY_ITEM; });
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

			await IDB.setMany(historyUpdate);

			// Break out of data checks because we found an expired value
			break;
		}
	};
};

export async function versionHistoryGarbageCollection(){
	const entries = await IDB.entries();

	const expiredKeys = [];
	for (const [key, value] of entries){
		const expireAt = new Date(value.savedAt);
		expireAt.setMinutes(expireAt.getMinutes() + GARBAGE_COLLECT_DELAY);
		if(new Date() > expireAt){
			expiredKeys.push(key);
		};
	};
	if(expiredKeys.length > 0){
		await IDB.delMany(expiredKeys);
	}
};