
module.exports = {
	addTranslationFunc : function (translationData){
		// Add translation function to String prototype
		String.prototype.translate = function(_groups) {
			const groups = Array.from(_groups);
			const text = this.valueOf();
			let obj = translationData;
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