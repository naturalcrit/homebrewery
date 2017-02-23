const Store = require('homebrewery/brew.store.js');
const BrewRenderer = require('./brewRenderer.jsx');


module.exports = Store.createSmartComponent(BrewRenderer, () => {
	const brew = Store.getBrew();


	return {
		brew : Store.getBrew(),

		brewText : Store.getBrewCode(),
		style : Store.getBrewStyle(),


		errors : Store.getErrors()
	}
});