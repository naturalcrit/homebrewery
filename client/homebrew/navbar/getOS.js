const getOS = function (){
	const userAgent = window.navigator.userAgent;
	let os = null;

	if(userAgent.indexOf('Mac') !== -1){
		os = 'mac';
	} else {
		os = 'pc';
	};

	return os;
};

export default getOS;