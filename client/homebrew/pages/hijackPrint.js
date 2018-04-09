//TODO: Depricate

module.exports = function(shareId){
	return function(event){
		event = event || window.event;
		if((event.ctrlKey || event.metaKey) && event.keyCode == 80){
			const win = window.open(`/homebrew/print/${shareId}?dialog=true`, '_blank');
			win.focus();
			event.preventDefault();
		}
	};
};