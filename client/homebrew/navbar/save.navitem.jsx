import React from 'react';

import { MenuItem } from 'client/components/menubar/menubar.jsx';

const Save = ({
	alerts = {},
	setAutoSaveWarning = ()=>{},
	unsavedTime = 0,
	trySave = ()=>{},
	autoSave = true
})=>{

	// #1 - Currently saving, show SAVING
	if(alerts.isSaving){
		return <MenuItem className='save' icon='fas fa-spinner fa-spin'>saving...</MenuItem>;
	}

	// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
	if(alerts.unsavedChanges && alerts.autoSaveWarning){
		setAutoSaveWarning();
		const elapsedTime = Math.round((new Date() - unsavedTime) / 1000 / 60);
		const text = elapsedTime == 0 ? 'Autosave is OFF.' : `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

		return <MenuItem className='save error' icon='fas fa-exclamation-circle'>
		Reminder...
			<div className='errorContainer'>
				{text}
			</div>
		</MenuItem>;
	}

	// #3 - Unsaved changes exist, click to save, show SAVE NOW
	// Use trySave(true) instead of save() to use debounced save function
	if(alerts.unsavedChanges){
		return <MenuItem className='save' onClick={()=>trySave(true)} color='orange' icon='fas fa-save'>Save Now</MenuItem>;
	}
	// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
	if(autoSave){
		return <MenuItem className='save saved disabled' icon='fas fa-save'>auto-saved.</MenuItem>;
	}
	// DEFAULT - No unsaved changes, show SAVED
	return <MenuItem className='save saved disabled' icon='fas fa-save'>saved.</MenuItem>;
}

MenuItem.Save = Save;

module.exports = { SaveButton: Save };