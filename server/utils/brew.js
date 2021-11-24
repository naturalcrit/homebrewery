const yaml = require('js-yaml');

module.exports = {
	mergeBrewText : (brew, { style, metadata, fullMetadata })=>{
		let text = brew.text;
		if(style) {
			text = `\`\`\`css\n` +
                `${brew.style || ''}\n` +
                `\`\`\`\n\n` +
                `${text}`;
		}
		if(metadata) {
			let metadata = {
				title       : brew.title,
				description : brew.description,
				tags        : brew.tags,
				systems     : brew.systems,
				renderer    : brew.renderer,
				authors     : brew.authors,
				published   : brew.published
			};
			if(fullMetadata) {
				metadata = {
					...metadata,
					shareId    : brew.shareId,
					pageCount  : brew.pageCount,
					createdAt  : brew.createdAt,
					updatedAt  : brew.updatedAt,
					lastViewed : brew.lastViewed,
					views      : brew.views,
					version    : brew.version
				};
			}
			text = `\`\`\`metadata\n` +
                `${yaml.dump(metadata)}\n` +
                `\`\`\`\n\n` +
                `${text}`;
		}
		return text;
	}
};