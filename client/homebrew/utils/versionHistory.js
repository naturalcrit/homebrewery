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
	const storedVersion = localStorage.getItem(key);
	const output = storedVersion ? JSON.parse(storedVersion) : { expireAt: '2000-01-01T00:00:00.000Z', shareId: brew.shareId, noData: true };
	return output;
};

function updateStoredBrew(brew, slot = 0) {
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
	localStorage.setItem(key, JSON.stringify(archiveBrew));
}


export function historyExists(brew){
	return Object.keys(localStorage)
		.some((key)=>{
			return key.startsWith(`${HISTORY_PREFIX}-${brew.shareId}`);
		});
}

export function loadHistory(brew){
	const history = {};

	// Load data from local storage to History object
	for (let i = 1; i <= HISTORY_SLOTS; i++){
		history[i] = getVersionBySlot(brew, i);
	};

	return history;
}

export function updateHistory(brew) {
	const history = loadHistory(brew);

	// Walk each version position
	for (let slot = HISTORY_SLOTS; slot > 0; slot--){
		const storedVersion = history[slot];

		// If slot has expired, update all lower slots and break
		if(new Date() >= new Date(storedVersion.expireAt)){
			for (let updateSlot = slot - 1; updateSlot>0; updateSlot--){
				// Move data from updateSlot to updateSlot + 1
				!history[updateSlot]?.noData &&	updateStoredBrew(history[updateSlot], updateSlot + 1);
			};

			// Update the most recent brew
			updateStoredBrew(brew, 1);

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
	Object.keys(localStorage)
		.filter((key)=>{
			return key.startsWith(HISTORY_PREFIX);
		})
		.forEach((key)=>{
			const collectAt = new Date(JSON.parse(localStorage.getItem(key)).savedAt);
			collectAt.setMinutes(collectAt.getMinutes() + GARBAGE_COLLECT_DELAY);
			if(new Date() > collectAt){
				localStorage.removeItem(key);
			}
		});
};