const Actions = require('homebrewery/brew.actions.js');
const Store = require('homebrewery/brew.store.js');

const BrewEditor = require('./brewEditor.jsx')

module.exports = Store.createSmartComponent(BrewEditor, ()=>{
	return {
		value : Store.getBrewText(),
		onChange : Actions.updateBrewText,
		metadata : Store.getMetaData(),
		onMetadataChange : Actions.updateMetaData,
	};
});