const _ = require('lodash');
const flux = require('pico-flux');

const Markdown = require('homebrewery/markdown.js');

let State = {
	version : '0.0.0',

	brew : {
		text : '',
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

	errors : []
};

const Store = flux.createStore({
	SET_BREW : (brew) => {
		State.brew = brew;
	},
	UPDATE_BREW_TEXT : (brewText) => {
		State.brew.text = brewText;
		State.errors = Markdown.validate(brewText);
	},
	UPDATE_META : (meta) => {
		State.brew = _.merge({}, State.brew, meta);
	}
});


Store.init = (state)=>{
	State = _.merge({}, State, state);
};
Store.getBrew = ()=>{
	return State.brew;
};
Store.getBrewText = ()=>{
	return State.brew.text;
};
Store.getMetaData = ()=>{
	return _.omit(State.brew, ['text']);
};
Store.getErrors = ()=>{
	return State.errors;
};

Store.getVersion = ()=>{
	return State.version;
};

module.exports = Store;