const _ = require('lodash');
const flux = require('pico-flux');

const Markdown = require('homebrewery/markdown.js');

let State = {
	version : '0.0.0',

	brew : {
		text : '',
		style : '',
		shareId : undefined,
		editId : undefined,
		createdAt : undefined,
		updatedAt : undefined,

		title : '',
		description : '',
		tags : '',
		published : false,
		authors : [],
		systems : []
	},

	errors : [],
	status : 'ready', //ready, pending, saving, error
};

const Store = flux.createStore({
	SET_BREW : (brew) => {
		State.brew = brew;
	},
	UPDATE_BREW_CODE : (brewCode) => {
		State.brew.text = brewCode;

		//TODO: Remove?
		State.errors = Markdown.validate(brewCode);
	},
	UPDATE_BREW_STYLE : (style) => {
		//TODO: add in an error checker?
		State.brew.style = style;
	},
	UPDATE_META : (meta) => {
		State.brew = _.merge({}, State.brew, meta);
	},
	SET_STATUS : (status, error) => {
		if(status == State.status) return false;
		if(error) State.errors = error;
		State.status = status;
	}
});


Store.init = (state)=>{
	State = _.merge({}, State, state);
};
Store.getBrew = ()=>{
	return State.brew;
};
Store.getBrewCode = ()=>{
	return State.brew.text;
};
Store.getBrewStyle = ()=>{
	return State.brew.style;
};
Store.getMetaData = ()=>{
	return _.omit(State.brew, ['text', 'style']);
};
Store.getErrors = ()=>{
	return State.errors;
};
Store.getVersion = ()=>{
	return State.version;
};
Store.getStatus = ()=>{
	return State.status;
};

module.exports = Store;