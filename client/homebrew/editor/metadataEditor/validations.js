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
			} catch {
				return 'Must be a valid URL';
			}
		}
	],
	lang : [
		(value)=>{
			return new RegExp(/^([a-zA-Z]{2,3})(-[a-zA-Z]{4})?(-(?:[0-9]{3}|[a-zA-Z]{2}))?$/).test(value) === false && (value.length > 0) ? 'Invalid language code.' : null;
		}
	],
	theme : [
		(value)=>{
			const URL = global.config.baseUrl.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); //Escape any regex characters
			const shareIDPattern = '[a-zA-Z0-9-_]{12}';
			const shareURLRegex  = new RegExp(`^${URL}\\/share\\/${shareIDPattern}$`);
			const shareIDRegex   = new RegExp(`^${shareIDPattern}$`);
			if(value?.length === 0)       return null;
			if(shareURLRegex.test(value)) return null;
			if(shareIDRegex.test(value))  return null;

			return 'Must be a valid Share URL or a 12-character ID.';
		}
	]
};



