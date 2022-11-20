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
			if(value?.length == 0){return null;}
			try {
				Boolean(new URL(value));
				return null;
			} catch (e) {
				return 'Must be a valid URL';
			}
		}
	],
	lang : [
		(value)=>{
			return new RegExp(/^[a-zA-z]{2,3}(-.*)?$/).test(value) === false && (value.length > 0) ? 'Invalid language code.' : null;
		}
	]
};



