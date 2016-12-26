const dispatch = require('pico-flux').dispatch;

const request = require('superagent');
const Store = require('./brew.store.js');

const Actions = {
	init : (initState) => {
		Store.init(initState);
	},
	setBrew : (brew) => {
		dispatch('SET_BREW', brew);
	},
	updateBrewText : (brewText) => {
		dispatch('UPDATE_BREW_TEXT', brewText)
	},
	updateMetaData : (meta) => {
		dispatch('UPDATE_META', meta);
	},



	saveNew : () => {
		//TODO: Maybe set the status?
		request.post('/api')
			.send(Store.getBrew())
			.end((err, res)=>{
				if(err) return;
				const brew = res.body;
				window.location = '/edit/' + brew.editId;
			});
	}
};

module.exports = Actions;