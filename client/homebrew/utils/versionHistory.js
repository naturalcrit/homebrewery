const HISTORY_PREFIX = 'HOMEBREWERY-HISTORY'
const HISTORY_SAVE_DELAYS = [
	1,			// 1 minute
	30,			// 30 minutes
	60,			// 60 minutes
	24 * 60,	// 24 hours
	5 * 24 * 60 // 5 days
];
const HISTORY_VERSION_DIFFS = [
	1,
	10,
	50,
	100,
	250
]

function updateStoredBrew(key, brew){
    const archiveBrew = {};
    archiveBrew.title = brew.title;
    archiveBrew.text = brew.text;
    archiveBrew.style = brew.style;
    archiveBrew.savedAt = new Date();
    archiveBrew.version = brew.version;
    localStorage.setItem(key, JSON.stringify(archiveBrew));
    return;
};

export function updateHistory(brew) {
    const historyKeys = [];
    [1,2,3,4,5].forEach((i)=>{
        historyKeys.push(`${HISTORY_PREFIX}-${brew.shareId}-${i}`);
    });
    historyKeys.forEach((key, i)=>{
        const storedVersion = localStorage.getItem(key);
        if(!storedVersion){
            updateStoredBrew(key, brew);
            return;
        }
        
        const storedObject = JSON.parse(storedVersion);
        let targetTime = new Date(storedObject.savedAt);
        targetTime.setMinutes(targetTime.getMinutes() + HISTORY_SAVE_DELAYS[i]);

        const targetVersion = storedObject.version + HISTORY_VERSION_DIFFS[i];

        if(new Date() >= targetTime && brew.version >= targetVersion){
            updateStoredBrew(key, brew);
        }
    });
};
