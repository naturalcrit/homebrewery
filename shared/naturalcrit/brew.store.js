const _ = require('lodash');
const flux = require('pico-flux');

let State = {
	count : 0
};

const Store = flux.createStore({
	INC : (val) => {
		State.count += val;
	},

	SET_INC : (val) => {
		State.count = val;
		return false;
	},

	DELAY_INC : (val) => {
		setTimeout(()=>{
			State.count += val;
			Store.emitChange();
		}, 2000);
		return false;
	}
});

Store.getCount = ()=>{
	return State.count;
};

module.exports = Store;