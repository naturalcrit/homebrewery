const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const findBasicIndex = (pages, theRegex)=>{
	for (const page of pages) {
		if(page.match(theRegex)) {
			return (theRegex.exec(page)[2].trim());
		}
	};
	return '';
};

const findRichTags = (pages, theRegex)=>{
	return (pages.map(function(page) {
		const richIndex=theRegex.exec(page);
		if(richIndex) { return richIndex; };
	}));
};

const findIndexTerms = (pages, terms, results)=>{
	const lowerTerms = terms.map((term)=>term.toLowerCase());
	for (const [pageNumber, page] of pages.entries()) {
		const lowerPage = page.toLowerCase();
		for (const [term, lt] of lowerTerms.entries()) {
			// convert to a regex to gain some regex benefits over a straight up match.
			const regExTerm = new RegExp(lt.replace(' ', '\s').replace(/\n/g, '\s'));
			console.log(regExTerm);
			console.log(lowerPage);
			if(lowerPage.match(regExTerm)) {
				console.log(`Found the term ${lt}`);
				console.log(`Mapping to ${terms[term]}`);
				if(results.has(terms[term])) {
					const currentEntry = results.get(terms[term]);
					currentEntry.pages.push(pageNumber);
					results.set(terms[term], currentEntry);
				} else {
					results.set(terms[term], { pages: [pageNumber], children: [] });
				}
			}
		}
	}
	console.log(results);
	return results;
};

module.exports = function (props) {
	const index = new Map();

	const pages = props.brew.text.split('\\page');
	const indexMarkdownRegex = /@((?:\\.|[^\[\]\\^@^\)])*)@\(((?:\\.|[^\[\]\\^@^\)])*)\)/gm;
	const indexMarkdownRegexBasic = /@(\W*)@\(((?:\\.|[^\[\]\\^@^\)])+)\)/m;

	const indexTag = findBasicIndex(pages, indexMarkdownRegexBasic);
	const richIndexEntries = findRichTags(pages, indexMarkdownRegex);

	if(indexTag.length > 0) {
		// We have search terms!
		console.log('We found the index tag in a page.');
		console.log(indexTag);

		findIndexTerms(pages, indexTag.split('|'), index);
	}

	console.log(index);
	console.log(`Found ${richIndexEntries.length} rich tags`);
	console.log(richIndexEntries);


	return dedent``;
	// return dedent`
	// 	{{index,wide
	// 	##### Index

	// 	$markdown
	// 	}}
	// \n`;
};