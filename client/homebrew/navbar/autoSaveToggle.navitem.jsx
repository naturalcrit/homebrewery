import React from 'react';
import { MenuItem } from 'client/components/menubar/menubar.jsx';

const Autosave = ({ autoSaveActive, toggleAutoSave })=>{
	return (
		<MenuItem onClick={()=>toggleAutoSave()} color='orange'>
			Autosave {autoSaveActive ? ' is ON' : 'is OFF'}
		</MenuItem>
	);
};

MenuItem.Autosave = Autosave;

module.exports = { AutosaveButton: Autosave };