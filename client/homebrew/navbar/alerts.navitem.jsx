import React from 'react';

const Alerts = ({ alerts, trySave })=>{
	if(!alerts) return;

	const saveButton = ()=>{
		if(alerts.isSaving){
			return <i className='save fas fa-spinner fa-spin'/>;
		}
		if(alerts.unsavedChanges){
			return <i className='save fas fa-save' onClick={()=>trySave(true)} title='Pending save.  Click to save now.' />;
		}
	};

	// checks if any this.state.alert is either 'true', or an array with length greater than 0
	console.log(alerts);
	if(Object.values(alerts).some((alert)=>(typeof alert === 'boolean' && alert) || (Array.isArray(alert) && alert.length > 0))){
		const autoSaveWarning = alerts.autoSaveWarning ? <i className='fas fa-triangle-exclamation' title='Autosave is turned OFF, be sure to save your work.'/> : null;
		const htmlWarning = alerts.htmlErrors?.length > 0 ? <i className='fas fa-code' title='There are HTML errors in this brew.' /> : null;
		const googleTrashWarning = alerts.alertTrashedGoogleBrew ? <i className='fas fa-dumpster' title='This brew is currently in your Trash folder on Google Drive!  If you want to keep it, make sure to move it before it is deleted permanently!' /> : null;
		return (<span id='alerts'>
			{saveButton()}
			{autoSaveWarning}
			{htmlWarning}
			{googleTrashWarning}
		</span>);
	};
}

export default Alerts;