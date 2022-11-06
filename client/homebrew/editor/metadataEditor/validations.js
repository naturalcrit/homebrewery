module.exports = {
	title : [
		(value)=>{
			return value?.length > 100 ? 'Max title length of 100 characters' : null;
		}
	],
	description : [
		(value)=>{
			return value?.length > 500 ? 'Max description length of 500 characters.' : null;
		}
	],
	thumbnail : [
		(value)=>{
			return value?.length > 256 ? 'Max URL length of 256 characters.' : null;
		},
		(value)=>{
			try {
				Boolean(new URL(value));
				return null;
			} catch (e) {
				return 'Must be a valid URL';
			}
		}
	],
	language : [
		(value)=>{
			return new RegExp(/[a-z]{2,3}(-.*)?/).test(value || '') === false ? 'Invalid language code.' : null;
		}
	]
};



