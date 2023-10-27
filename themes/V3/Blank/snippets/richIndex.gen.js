/* eslint-disable max-depth */
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
		const results = [];
		let richIndex;
		while (richIndex=theRegex.exec(page)) {
			if(richIndex[1].trim().length>0) {
				results.push(richIndex);
			}
		}
		return (results);
	}));
};

const findIndexTerms = (pages, terms, results)=>{
	const lowerTerms = terms.map((term)=>term.toLowerCase());
	for (const [pageNumber, page] of pages.entries()) {
		const lowerPage = page.toLowerCase();
		for (const [term, lt] of lowerTerms.entries()) {
			// convert to a regex to gain some regex benefits over a straight up match.
			const regExTerm = new RegExp(lt.replace(' ', '\s').replace(/\n/g, '\s'));
			if(lowerPage.match(regExTerm)) {
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
	return results;
};

const addRichIndexes = (richEntries, results)=>{
	for (const [entryPageNumber, richEntriesOnPage] of richEntries.entries()) {
		if(richEntriesOnPage.length>0) {
			for (const richTags of richEntriesOnPage) {
				const parents = richTags[2].split('|');
				if(parents.length>0){
					for (const parent of parents) {
						if(results.has(parent)){
							const entry = results.get(parent);
							if(!entry.children.has(richTags[1])){
								entry.children.set(richTags[1], [entryPageNumber]);
							} else {
								const children = entry.children.get(richTags[1]);
								children.push(entryPageNumber);
								entry.children.set(richTags[1], children);
							}
							results.set(parent, entry);
						} else {
							const childMap = new Map();
							childMap.set(richTags[1], [entryPageNumber]);
							results.set(parent, {
								pages: [],
								children: childMap
							});
						}
					}
				}
			}
		}
	}
};

const sortMap = (m)=> {
	return (new Map([...m.entries()].sort()));
};

const markup = (index)=>{
	const sortedIndex = sortMap(index);
	let results = '';

	for (const [parent, parentPages] of sortedIndex) {
		results = results.concat(`- `, parent, parentPages.pages.length > 0 ? ' ... pg. ':'');
		for (const [k, pageNumber] of parentPages.pages.entries()) {
			results = results.concat(parseInt(pageNumber+1));
			if(k < (parentPages.pages.length - 1)) {
				results = results.concat(`, `);
			}
		}
		results = results.concat('\n');
		if(parentPages.hasOwnProperty('children')) {
			const sortedChildren = sortMap(parentPages.children);
			for (const [child, childPages] of sortedChildren){
				results = results.concat('  - ', child, ' ... pg. ');
				for (const [k, pageNumber] of childPages.entries()) {
					results = results.concat(parseInt(pageNumber+1));
					if(k < (childPages.length - 1)) {
						results = results.concat(`, `);
					}
				}
				results = results.concat('\n');
			}
		}
	}
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
		findIndexTerms(pages, indexTag.split('|'), index);
	}

	if(richIndexEntries.length>0) {
		addRichIndexes(richIndexEntries, index);
	}

	const markdown = markup(index);

//	return dedent``;
	return dedent`
		{{index,wide
		##### Index

		${markdown}
		}}`;
};