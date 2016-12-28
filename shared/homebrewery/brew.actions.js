const dispatch = require('pico-flux').dispatch;

const request = require('superagent');
const Store = require('./brew.store.js');

let pendingTimer;
const PENDING_TIMEOUT = 3000;

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
	pendingSave : () => {
		clearTimeout(pendingTimer);
		pendingTimer = setTimeout(Actions.save, PENDING_TIMEOUT);
		dispatch('SET_STATUS', 'pending');
	},
	save : () => {
		clearTimeout(pendingTimer);
		const brew = Store.getBrew();
		dispatch('SET_STATUS', 'saving');
		request
			.put('/api/update/' + brew.editId)
			.send(brew)
			.end((err, res) => {
				if(err) return dispatch('SET_STATUS', 'error', err);
				dispatch('SET_BREW', res.body);
				dispatch('SET_STATUS', 'ready');
			});
	},
	saveNew : () => {
		dispatch('SET_STATUS', 'saving');
		request.post('/api')
			.send(Store.getBrew())
			.end((err, res)=>{
				if(err) return dispatch('SET_STATUS', 'error', err);
				localStorage.setItem('homebrewery-new', null);
				const brew = res.body;
				window.location = '/edit/' + brew.editId;
			});
	},
	localPrint : ()=>{
		localStorage.setItem('print', Store.getBrewText());
		window.open('/print?dialog=true&local=print','_blank');
	},
	print : ()=>{
		window.open(`/print/${Store.getBrew().shareId}?dialog=true`, '_blank').focus();
	}
};

module.exports = Actions;