export const HISTORY_PREFIX = 'HOMEBREWERY-HISTORY'
// const HISTORY_SAVE_DELAYS = {
//  0: 0,           // 0 minutes (if not specified)
// 	1: 2,			// 2 minutes
// 	2: 10,			// 10 minutes
// 	3: 60,			// 60 minutes
// 	4: 12 * 60,     // 12 hours
// 	5: 2 * 24 * 60  // 2 days
// };

const HISTORY_SAVE_DELAYS = {
    // Test values
    0: 0,           // 0 minutes (if not specified)
	1: 1,			// 1 minutes
	2: 2,			// 2 minutes
	3: 3,			// 3 minutes
	4: 4,           // 4 minutes
	5: 5            // 5 minutes
};

function updateStoredBrew(key, brew, slot=0){
    const archiveBrew = {};

    // Data from brew to be stored
    archiveBrew.title = brew.title;
    archiveBrew.text = brew.text;
    archiveBrew.style = brew.style;
    archiveBrew.version = brew.version;

    // Calculated values
    archiveBrew.savedAt = new Date();
    archiveBrew.expireAt = new Date();
    archiveBrew.expireAt.setMinutes(archiveBrew.expireAt.getMinutes() + HISTORY_SAVE_DELAYS[slot]);
    
    // Store data
    localStorage.setItem(key, JSON.stringify(archiveBrew));
    return;
};

export function updateHistory(brew) {
    const numbers = [1,2,3,4,5];
    const historyKeys = {};
    numbers.forEach((i)=>{
        historyKeys[i] = `${HISTORY_PREFIX}-${brew.shareId}-${i}`;
    });
    numbers.toReversed().every((slot)=>{
        const key = historyKeys[slot];
        const storedVersion = localStorage.getItem(key);

        // If no version stored at this key, update and break
        if(!storedVersion){
            console.log('Empty slot: ', slot);
            updateStoredBrew(key, brew, slot);
            return false;
        }

        // Parse slot data
        const storedObject = JSON.parse(storedVersion);

        // If slot has expired, update
        if(new Date() >= new Date(storedObject.expireAt)){
            console.log('Expired slot: ', slot);
            updateStoredBrew(key, brew, slot);
            return false;
        }
        return true;
    });
};
