module.exports = {
	title : [
		(value)=>{
			return value?.length > 10 ? 'Max title length of 10 characters' : null;
		}
	],
	description : [
		(value)=>{
			return value?.length > 10 ? 'Max description length of 10 characters' : null;
		}
	],
	thumbnail : [
		(value)=>{
			return value?.length > 5 ? 'Max URL length of 5 characters' : null;
		}
	]
};



