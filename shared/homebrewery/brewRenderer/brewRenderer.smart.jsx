const Store = require('homebrewery/brew.store.js');
const BrewRenderer = require('./brewRenderer.jsx');


module.exports = Store.createSmartComponent(BrewRenderer, () => {
	return {
		value : Store.getBrewCode(),
		style : Store.getBrewStyle(),
		errors : Store.getErrors()
	}
});