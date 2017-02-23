const Actions = require('homebrewery/brew.actions.js');
const Store = require('homebrewery/brew.store.js');

const BrewEditor = require('./brewEditor.jsx')

module.exports = Store.createSmartComponent(BrewEditor, ()=>{
	return {
		brew : Store.getBrew(),

		onCodeChange  : Actions.updateBrewCode,
		onStyleChange : Actions.updateBrewStyle,
		onMetaChange  : Actions.updateMetadata,
	};
});