const Store = require('./account.store.js');

const Actions = {
	init : (initState) => {
		Store.init(initState);
	},
	login : ()=>{
		window.location = Store.getLoginPath();
	},
	logout : ()=>{
		document.cookie = 'nc_session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=.naturalcrit.com';
		//Remove local dev cookies too
		document.cookie = 'nc_session=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
		window.location ='/';
	}
};

module.exports = Actions;