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
	return `${HISTORY_PREFIX}-${brew.shareId}-${slot}`;
};

function getVersionBySlot(brew, slot){
	// Read stored brew data
	// - If it exists, parse data to object
	// - If it doesn't exist, pass default object
	const key = getKeyBySlot(brew, slot);
	const storedVersion = IDB.get(key);
	const output = storedVersion ? storedVersion : { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };
	return output;
};

function parseBrewForStorage(brew, slot = 0) {
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


export async function historyExists(brew){
	console.log('HISTORY CHECK');
	const historyExists = await IDB.keys()
		.then((keys)=>{
			return [...keys].some((key)=>{
				return key.startsWith(`${HISTORY_PREFIX}-${brew.shareId}`);
			});
		})
		.catch(()=>{return false;});
	console.log('HISTORY STATE:', historyExists);
}

export async function loadHistory(brew){
	const DEFAULT_HISTORY_ITEM = { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };

	const historyKeys = [];

	// Load data from local storage to History object
	for (let i = 1; i <= HISTORY_SLOTS; i++){
		historyKeys.push(getKeyBySlot(brew, i));
	};

	const history = [];
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

	console.log('DATA:', history);

	// Walk each version position
	for (let slot = HISTORY_SLOTS - 1; slot >= 0; slot--){
		console.log('SLOT #:', slot, history[slot]);
		const storedVersion = history[slot];

		// If slot has expired, update all lower slots and break
		if(new Date() >= new Date(storedVersion.expireAt)){
			const historyUpdate = [];

			for (let updateSlot = slot - 1; updateSlot > 0; updateSlot--){
				console.log('CHECK DATA IN SLOT #:', updateSlot);
				// Move data from updateSlot to updateSlot + 1
				if(!history[updateSlot - 1]?.noData) {
					console.log('UPDATE SLOT #:', updateSlot - 1, '>', updateSlot);
					historyUpdate.push(parseBrewForStorage(history[updateSlot - 1], updateSlot + 1));
				}
			};

			// Update the most recent brew
			historyUpdate.push(parseBrewForStorage(brew, 1));

			console.log('HISTORY UPDATE OBJECT:', historyUpdate);
			IDB.setMany(historyUpdate);

			// Break out of data checks because we found an expired value
			break;
		}
	};
};

export function getHistoryItems(brew){
	const historyArray = [];

	for (let i = 1; i <= HISTORY_SLOTS; i++){
		historyArray.push(getVersionBySlot(brew, i));
	}

	return historyArray;
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