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



	save : () => {
		const brew = Store.getBrew();
		dispatch('SET_STATUS', 'saving');
		request
			.put('/api/update/' + brew.editId)
			.send(brew)
			.end((err, res) => {
				if(err) return dispatch('SET_STATUS', 'error', err);
				dispatch('SET_STATUS', 'ready');
				dispatch('SET_BREW', res.body);
			});
	},

	saveNew : () => {
		dispatch('SET_STATUS', 'saving');
		request.post('/api')
			.send(Store.getBrew())
			.end((err, res)=>{
				if(err) return dispatch('SET_STATUS', 'error', err);
				const brew = res.body;
				window.location = '/edit/' + brew.editId;
			});
	},
	localPrint : ()=>{
		localStorage.setItem('print', Store.getBrewText());
		window.open('/print?dialog=true&local=print','_blank');
	}
};

module.exports = Actions;