const Actions = require('homebrewery/brew.actions.js');
const Store = require('homebrewery/brew.store.js');

const Editor = require('./editor.jsx')

module.exports = Store.createSmartComponent(Editor, ()=>{
	return {
		value : Store.getBrewText(),
		onChange : Actions.updateBrewText,
		metadata : Store.getMetaData(),
		onMetadataChange : Actions.updateMetaData,
	};
});