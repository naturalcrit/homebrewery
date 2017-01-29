const _ = require('lodash');
const dispatch = require('pico-flux').dispatch;

const request = require('superagent');
const Store = require('./brew.store.js');

let pendingTimer;
const PENDING_TIMEOUT = 3000;

const APIActions = {
	save : () => {
		clearTimeout(pendingTimer);
		const brew = Store.getBrew();
		dispatch('SET_STATUS', 'saving');
		request
			.put('/api/brew/' + brew.editId)
			.send(brew)
			.end((err, res) => {
				if(err) return dispatch('SET_STATUS', 'error', err);
				dispatch('SET_BREW', res.body);
				dispatch('SET_STATUS', 'ready');
			});
	},
	create : () => {
		dispatch('SET_STATUS', 'saving');
		request.post('/api/brew')
			.send(Store.getBrew())
			.end((err, res)=>{
				if(err) return dispatch('SET_STATUS', 'error', err);
				localStorage.setItem('homebrewery-new', null);
				const brew = res.body;
				window.location = '/edit/' + brew.editId;
			});
	},
	delete : (editId) => {
		dispatch('SET_STATUS', 'deleting');
		request.delete('/api/brew/' + editId)
			.send()
			.end((err, res)=>{
				if(err) return dispatch('SET_STATUS', 'error', err);
				window.location = '/';
			});
	}
}

const Actions = {
	init : (initState) => {
		const filteredState = _.reduce(initState, (r, val, key) => {
			if(typeof val !== 'undefined') r[key] = val;
			return r;
		}, {});
		Store.init(filteredState);
	},
	setBrew : (brew) => {
		dispatch('SET_BREW', brew);
	},
	updateBrewCode : (brewCode) => {
		dispatch('UPDATE_BREW_CODE', brewCode)
	},
	updateBrewStyle : (style) => {
		dispatch('UPDATE_BREW_STYLE', style)
	},
	updateMetadata : (meta) => {
		dispatch('UPDATE_META', meta);
	},
	pendingSave : () => {
		clearTimeout(pendingTimer);
		pendingTimer = setTimeout(APIActions.save, PENDING_TIMEOUT);
		dispatch('SET_STATUS', 'pending');
	},

	localPrint : ()=>{
		localStorage.setItem('print', Store.getBrewText());
		window.open('/print?dialog=true&local=print','_blank');
	},
	print : ()=>{
		window.open(`/print/${Store.getBrew().shareId}?dialog=true`, '_blank').focus();
	}
};

module.exports = _.merge(Actions, APIActions);