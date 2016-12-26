const dispatch = require('pico-flux').dispatch;

const Actions = {
	addInc : (val = 1) => {
		dispatch('ADD_INC', val);
	},
	delayInc : (val = 1) => {
		dispatch('DELAY_INC', val)
	},
	setInc : (newInc) => {
		dispatch('SET_INC', newInc);
	},
};

module.exports = Actions;