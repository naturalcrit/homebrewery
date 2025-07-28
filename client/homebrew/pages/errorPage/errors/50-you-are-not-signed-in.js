const dedent = require('dedent-tabs').default;


export default function error50() {
	return {
		title : 'You are not signed in',
		text  : dedent`
            You are trying to access the account page, but are not signed in to an account.
            
            Please login or signup at our [login page](https://www.naturalcrit.com/login?redirect=https://homebrewery.naturalcrit.com/account).`,
		image : { uri: null, attribution: null }
	};
}
