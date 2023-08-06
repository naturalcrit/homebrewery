// This should all get replaced with a proper useragent npm package, or using device available feature checks rather than regexing user agent strings.

const getOS = function (){
	const userAgent = window.navigator.userAgent;
	let os = null;

	if(userAgent.indexOf('Macintosh') !== -1){
		os = 'mac';
	} else if(userAgent.indexOf('iPhone') !== -1) {
		os = 'iphone';
	} else {
		os = 'pc';
	};

	return os;
};

export default getOS;