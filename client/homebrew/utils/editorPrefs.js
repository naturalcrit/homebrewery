// Shared constants for editor preferences persisted to localStorage. Single source of truth
// so editPage + newPage stay in lockstep; rename/change here flows to both pages automatically.

export const AUTOSAVE_KEY                      = 'HB_editor_autoSaveOn';
export const PERFORMANCE_MODE_KEY              = 'HB_editor_performanceMode';
export const PERFORMANCE_MODE_SUGGESTED_KEY    = 'HB_editor_performanceMode_suggested';

// Characters in brew.text at which we proactively suggest enabling Performance Mode.
// ~50k lines of typical brew content; below this the default pipeline is plenty fast.
export const PERFORMANCE_MODE_SUGGEST_THRESHOLD = 200_000;

// SSR-safe lazy read. Used as `useState(readPerformanceModePref)` to avoid a first render
// at perfMode=false followed by a second render flipping to true (which triggers CodeMirror
// to rebuild its highlight plugin and tokenize the whole document on mount — exactly the
// cost perf mode is supposed to eliminate).
export const readPerformanceModePref = ()=>{
	if(typeof localStorage === 'undefined') return false;
	// Kill switch: ops can hide/force-disable via server-injected global.config. When the flag
	// is set we force-off regardless of the user's stored preference.
	if(typeof global !== 'undefined' && global.config?.disablePerformanceMode) return false;
	return localStorage.getItem(PERFORMANCE_MODE_KEY) === 'true';
};

// Whether the Performance Mode UI should render at all. Hidden when ops kill-switch is on.
export const isPerformanceModeAvailable = ()=>{
	if(typeof global !== 'undefined' && global.config?.disablePerformanceMode) return false;
	return true;
};
