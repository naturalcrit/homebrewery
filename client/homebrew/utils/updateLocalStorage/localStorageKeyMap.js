
const getLocalStorageMap = function(){
	const localStorageMap = {
		'AUTOSAVE_ON'              : 'HB_editor_autoSaveOn',
		'HOMEBREWERY-EDITOR-THEME' : 'HB_editor_theme',
		'liveScroll'               : 'HB_editor_liveScroll',
		'naturalcrit-pane-split'   : 'HB_editor_splitWidth',

		'HOMEBREWERY-LISTPAGE-SORTDIR'                : 'HB_listPage_sortDir',
		'HOMEBREWERY-LISTPAGE-SORTTYPE'               : 'HB_listPage_sortType',
		'HOMEBREWERY-LISTPAGE-VISIBILITY-published'   : 'HB_listPage_visibility_group_published',
		'HOMEBREWERY-LISTPAGE-VISIBILITY-unpublished' : 'HB_listPage_visibility_group_unpublished',

		'hbAdminTab' : 'HB_adminPage_currentTab',

		'homebrewery-new'       : 'HB_newPage_content',
		'homebrewery-new-meta'  : 'HB_newPage_metadata',
		'homebrewery-new-style' : 'HB_newPage_style',

		'homebrewery-recently-edited' : 'HB_nav_recentlyEdited',
		'homebrewery-recently-viewed' : 'HB_nav_recentlyViewed',

		'hb_toolbarState'      : 'HB_renderer_toolbarState',
		'hb_toolbarVisibility' : 'HB_renderer_toolbarVisibility'
	};

	if(global?.account?.username){
		const username = global.account.username;
		localStorageMap[`HOMEBREWERY-DEFAULT-SAVE-LOCATION-${username}`] = `HB_editor_defaultSave_${username}`;
	}

	return localStorageMap;
};

export default getLocalStorageMap;