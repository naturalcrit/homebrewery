export const HISTORY_PREFIX = 'HOMEBREWERY-HISTORY'
// const HISTORY_SAVE_DELAYS = {
//  0: 0,           // 0 minutes (if not specified)
// 	1: 2,			// 2 minutes
// 	2: 10,			// 10 minutes
// 	3: 60,			// 60 minutes
// 	4: 12 * 60,     // 12 hours
// 	5: 2 * 24 * 60  // 2 days
// };
// 
// const GARBAGE_COLLECT_AT = 28 * 24 * 60; // 28 days


// <=================== TEST VALUES STARTS ===================>

// Test values
const HISTORY_SAVE_DELAYS = {
    0: 0,           // 0 minutes (if not specified)
	1: 1,			// 1 minutes
	2: 2,			// 2 minutes
	3: 3,			// 3 minutes
	4: 4,           // 4 minutes
	5: 5            // 5 minutes
};
const GARBAGE_COLLECT_DELAY = 10; // 10 minutes

// <==================== TEST VALUES ENDS ====================>



const DEFAULT_STORED_BREW = {
    shareId  : 'default_brew',
    expireAt : '2000-01-01T00:00:00.000Z'
};

function getKeyBySlot(brew, slot){
    return `${HISTORY_PREFIX}-${brew.shareId}-${slot}`;
};

function getVersionBySlot(brew, slot){
    // Read stored brew data
    // - If it exists, parse data to object
    // - If it doesn't exist, pass default object
    const key = getKeyBySlot(brew, slot);
    const storedVersion = localStorage.getItem(key);
    const output = storedVersion ? JSON.parse(storedVersion) : { ...DEFAULT_STORED_BREW, ...brew };
    return output;
};

function updateStoredBrew(brew, slot=0){
    const archiveBrew = {};

    // Data from brew to be stored
    archiveBrew.title = brew.title;
    archiveBrew.text = brew.text;
    archiveBrew.style = brew.style;
    archiveBrew.version = brew.version;
    archiveBrew.shareId = brew.shareId;

    // Calculated values
    archiveBrew.savedAt = new Date();
    archiveBrew.expireAt = new Date();
    archiveBrew.expireAt.setMinutes(archiveBrew.expireAt.getMinutes() + HISTORY_SAVE_DELAYS[slot]);
    
    // Store data
    const key = getKeyBySlot(brew, slot);
    localStorage.setItem(key, JSON.stringify(archiveBrew));
    return;
};

export function updateHistory(brew) {
    const numbers = [1,2,3,4,5];
    const history = {};

    // Load data from local storage to History object
    numbers.forEach((i)=>{
        history[i] = getVersionBySlot(brew, i);
    });

    // Walk each version position
    numbers.toReversed().every((slot)=>{
        const storedVersion = history[slot];

        // If slot has expired, update all lower slots and break
        if(new Date() >= new Date(storedVersion.expireAt)){
            const slots = Array.from(Array(slot - 1).keys());
            slots.toReversed().every((slot)=>{
                const actualSlot = slot + 1;
                // Move data from actualSlot to actualSlot + 1
                updateStoredBrew({ ...history[actualSlot], shareId: brew.shareId }, actualSlot + 1);
                // If first slot, fill with current data
                if(actualSlot == 1) {
                    updateStoredBrew(brew, 1);
                    // Break after updating first slot
                    return false;
                }
                // Continue loop to move data in remaining slots
                return true;
            });
            // Break out of data checks because we found an expired value
            return false;
        }
        // Continue data checks because this one wasn't expired
        return true;
    });
};

export function versionHistoryGarbageCollection(){
    Object.keys(localStorage)
        .filter((key)=>{
            return key.startsWith(HISTORY_PREFIX);
        })
        .forEach((key)=>{
            const collectAt = new Date(JSON.parse(localStorage.getItem(key)).expireAt);
            collectAt.setMinutes(collectAt.getMinutes() + GARBAGE_COLLECT_DELAY);
            if(new Date() > collectAt){
                console.log('GARBAGE COLLECTION:', key);
                localStorage.removeItem(key);
            }
        });
};