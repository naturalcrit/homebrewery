
module.exports = {
	addTranslationFunc : function (localeData){
		// Add translation function to String prototype
		String.prototype.translate = function(_groups) {
			const text = this.valueOf();
			const groups = _groups ? Array.from(_groups) : [];
			let obj = localeData;
			while (groups?.length > 0) {
				if(obj[groups[0]]) {
					obj = obj[groups[0]];
					groups.shift();
					continue;
				}
				break;
			}

			if(obj[text] && obj[text].length > 0) return obj[text];
			return text;
		};
	}
};