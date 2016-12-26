const Store = require('homebrewery/brew.store.js');
const BrewRenderer = require('./brewRenderer.jsx');


module.exports = Store.createSmartComponent(BrewRenderer, () => {
	return {
		brewText : Store.getBrewText(),
		errors : Store.getErrors()
	}
});