module.exports = {
	title : [
		(value)=>{
			return value?.length > 10 ? 'Max URL length of 10 characters' : null;
		}
	],
	description : [
		(value)=>{
			return value?.length > 10 ? 'Max URL length of 10 characters' : null;
		}
	],
	thumbnail : [
		(value)=>{
			return value?.length > 5 ? 'Max URL length of 5 characters' : null;
		},
		(value)=>{
			return (value ?? '')[0] !== 'W' ? 'URL must start with W' : null;
		}
	]
};



