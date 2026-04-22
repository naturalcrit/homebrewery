import { DEFAULT_BREW } from '../../../../server/brewDefaults.js';

// Cheap shallow array equality. Brew arrays (authors, tags) are tiny.
const arraysEq = (a, b)=>{
	if(a === b) return true;
	if(!a || !b) return false;
	if(a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++)if(a[i] !== b[i]) return false;
	return true;
};

// Replaces `_.isEqual(currentBrew, lastSavedBrew.current)` which deep-walks the entire object
// on every keystroke. With a 50k-line brew the walk dominated the per-flush React commit cost.
// All fields here are primitives or short arrays, so explicit reference / `===` checks are fast
// even when the text is multiple megabytes (string === short-circuits on identity then memcmp).
//
// The list is an implicit allowlist — adding a brew field that isn't compared here will silently
// break the unsaved-changes detection. The test in tests/brew/brewsEqual.test.js asserts that
// every key in DEFAULT_BREW is reflected here so the failure is loud.
const brewsEqual = (a, b)=>{
	if(a === b) return true;
	if(!a || !b) return false;
	return a.text === b.text
		&& a.style === b.style
		&& a.snippets === b.snippets
		&& a.title === b.title
		&& a.description === b.description
		&& a.theme === b.theme
		&& a.renderer === b.renderer
		&& a.lang === b.lang
		&& a.thumbnail === b.thumbnail
		&& a.published === b.published
		&& a.gDrive === b.gDrive
		&& a.trashed === b.trashed
		&& arraysEq(a.authors, b.authors)
		&& arraysEq(a.tags, b.tags);
};

// Fields brewsEqual examines. Keep in sync with the comparison list above; the unit test
// cross-checks this against DEFAULT_BREW so adding a brew field without updating brewsEqual
// fails CI rather than silently disabling autosave.
export const BREWS_EQUAL_FIELDS = [
	'text', 'style', 'snippets', 'title', 'description', 'theme', 'renderer',
	'lang', 'thumbnail', 'published', 'gDrive', 'trashed', 'authors', 'tags'
];

// Fields known to exist on a brew but intentionally NOT compared (mutated by save/load only,
// or intrinsic identifiers that don't reflect user-editable content).
export const BREWS_EQUAL_IGNORED_FIELDS = [
	'editId', 'shareId', 'createdAt', 'updatedAt', 'views', 'pageCount'
];

export { brewsEqual, arraysEq };
export default brewsEqual;
