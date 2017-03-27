//const Actions = require('homebrewery/brew.actions.js');
const Store = require('homebrewery/brew.store.js');

const BrewView = require('./brewView.jsx')

module.exports = Store.createSmartComponent(BrewView, ()=>{
	return {
		brew : Store.getBrew()

	};
});