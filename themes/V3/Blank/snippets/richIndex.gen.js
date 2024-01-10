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

const findSubjectHeadings = (pages, terms, results)=>{
	const lowerTerms = terms.map((term)=>term.toLowerCase());
	for (const [pageNumber, page] of pages.entries()) {
		const lowerPage = page.toLowerCase();
		for (const [term, lt] of lowerTerms.entries()) {
			const regExTerm = new RegExp(lt);
			if(lowerPage.match(regExTerm)) {
				if(results.has(terms[term])) {
					const currentEntry = results.get(terms[term]);
					currentEntry.pages.push(pageNumber);
					results.set(terms[term], currentEntry);
				} else {
					results.set(terms[term], { pages: [pageNumber], entries: [] });
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
				const subjectHeadings = richTags[2].split('|');
				if(subjectHeadings.length>0){
					for (const subjectHeading of subjectHeadings) {
						if(results.has(subjectHeading)){
							const currentSubjectHeading = results.get(subjectHeading);
							if(!currentSubjectHeading.entries.has(richTags[1])){
								currentSubjectHeading.entries.set(richTags[1], [entryPageNumber]);
							} else {
								const entries = currentSubjectHeading.entries.get(richTags[1]);
								entries.push(entryPageNumber);
								currentSubjectHeading.entries.set(richTags[1], entries);
							}
							results.set(subjectHeading, currentSubjectHeading);
						} else {
							const entriesMap = new Map();
							entriesMap.set(richTags[1], [entryPageNumber]);
							results.set(subjectHeading, {
								pages   : [],
								entries : entriesMap,
								rich    : true
							});
						}
					}
				}
			}
		}
	}
};

const sortMap = (m)=> {
	return (new Map([...m.entries()].sort((a, b)=>{
		const lowA = a[0].toLowerCase();
		const lowB = b[0].toLowerCase();
		if(lowA == lowB) return 0;
		if(lowA > lowB) return 1;
		return -1;
	})));
};

const markup = (index)=>{
	const sortedIndex = sortMap(index);
	let results = '';

	for (const [subjectHeading, subjectHeadingPages] of sortedIndex) {
		results = results.concat(`- `, subjectHeading, subjectHeadingPages.pages.length > 0 ? ' ... pg. ':'');
		for (const [k, pageNumber] of subjectHeadingPages.pages.entries()) {
			if(!subjectHeadingPages.hasOwnProperty('rich')) {
				results = results.concat('[', parseInt(pageNumber+1), `](#p${pageNumber})`);
			}
			if(k < (subjectHeadingPages.pages.length - 1)) {
				results = results.concat(`, `);
			}
		}
		results = results.concat('\n');
		if(subjectHeadingPages.hasOwnProperty('entries')) {
			const sortedEntries = sortMap(subjectHeadingPages.entries);
			for (const [entry, entryPages] of sortedEntries){
				results = results.concat('  - ', entry, ' ... pg. ');
				for (const [k, pageNumber] of entryPages.entries()) {
					results = results.concat('[', parseInt(pageNumber+1), `](#${entry.toLowerCase().replace(' ', '')})`);
					if(k < (entryPages.length - 1)) {
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
	const indexMarkdownRegex = /@\[((?:\\.|[^\[\]\\^@^\)])*)\]\(((?:\\.|[^\[\]\\^@^\)])*)\)/gm;
	const indexMarkdownRegexBasic = /@\[(\W*)\]\(((?:\\.|[^\[\]\\^@^\)])+)\)/m;

	const indexTag = findBasicIndex(pages, indexMarkdownRegexBasic);
	const richIndexEntries = findRichTags(pages, indexMarkdownRegex);

	if(indexTag.length > 0) {
		findSubjectHeadings(pages, indexTag.split('|'), index);
	}

	if(richIndexEntries.length>0) {
		addRichIndexes(richIndexEntries, index);
	}

	const markdown = markup(index);

	return dedent`
		{{index,wide
		##### Index

		${markdown}
		}}`;
};