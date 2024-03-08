/* eslint-disable max-depth */
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const findBasicIndex = (pages, theRegex)=>{
	const results = new Map();
	for (const [pageNumber, page] of pages.entries()) {
		const basics = [];
		if(page.match(theRegex)) {
			let match;
			while (match = theRegex.exec(page)){
				basics.push(match[1].trim());
			}
		}
		if(basics.length > 0) {
			results.set(pageNumber, basics);
		}
	};
	return results;
};

const findRichTags = (pages, theRegex)=>{
	return (pages.map(function(page) {
		const results = [];
		let richIndex;
		while (richIndex=theRegex.exec(page)) {
			if(richIndex[3]?.trim().length>0) {
				results.push(richIndex);
			}
		}
		return (results);
	}));
};

const findSubjectHeadings = (pages, terms, results)=>{
	for (const [pageCount, entry] of terms.entries()) {

		for (const e in entry) {
			const termList = entry[e].split('|');
			for (const term in termList) {
				if(results.has(termList[term])) {
					const currentEntry = results.get(termList[term]);
					currentEntry.pages.push(pageCount);
					results.set(termList[term], currentEntry);
				} else {
					results.set(termList[term], { pages: [pageCount], entries: {} });
				}
			}
		}
	}
	return results;
};

const newRichEntry = (firstTag, pageNumber)=>{
	const entriesMap = new Map();
	entriesMap.set(firstTag, [pageNumber]);
	return {
		pages   : [],
		entries : entriesMap,
		rich    : true
	};
};

const addRichIndexes = (richEntries, results)=>{
	for (const [entryPageNumber, richEntriesOnPage] of richEntries.entries()) {
		if(richEntriesOnPage.length>0) {
			for (const richTags of richEntriesOnPage) {
				const subjectHeadings = richTags[1].split('|');
				if(subjectHeadings.length>0){
					for (const subjectHeading of subjectHeadings) {
						if(results.has(subjectHeading)){
							const currentSubjectHeadingObj = results.get(subjectHeading);
							if(currentSubjectHeadingObj.entries.size) {
								if(currentSubjectHeadingObj.entries?.has(richTags[3])){
									const entries = currentSubjectHeadingObj.entries.get(richTags[3]);
									entries.push(entryPageNumber);
									results.get(subjectHeading).entries.set(richTags[3], entries);
								} else {
									currentSubjectHeadingObj.entries.set(richTags[3], [entryPageNumber]);
								}
								results.set(subjectHeading, currentSubjectHeadingObj);
							} else {
								const entriesMap = new Map();
								entriesMap.set(richTags[3], [entryPageNumber]);
								currentSubjectHeadingObj.entries = Object.assign(entriesMap);
							}
							results.set(subjectHeading, currentSubjectHeadingObj);
						} else {
							results.set(subjectHeading, newRichEntry(richTags[3], entryPageNumber));
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
				results = results.concat('[', parseInt(pageNumber+1), `](#p${parseInt(pageNumber+1)})`);
			}
			if(k < (subjectHeadingPages.pages.length - 1)) {
				results = results.concat(`, `);
			}
		}
		results = results.concat('\n');
		if(subjectHeadingPages.hasOwnProperty('entries') && subjectHeadingPages.entries.size) {
			const sortedEntries = sortMap(subjectHeadingPages.entries);
			for (const [entry, entryPages] of sortedEntries){
				results = results.concat('  - ', entry, ' ... pg. ');
				for (const [k, pageNumber] of entryPages.entries()) {
					results = results.concat('[', parseInt(pageNumber+1), `](#p${parseInt(pageNumber+1)}_${entry.toLowerCase().replaceAll(' ', '')})`);
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
	const indexMarkdownRegex = /@\[((?:\\.|[^\[\]\\^@^\)])*)\](\((((?:\\.|[^\[\]\\^@^\)])*))\))?/gm;
	const indexMarkdownRegexBasic = /@\[((?:\\.|[^\[\]\\^@^\)])*)\][^\(]/gm;

	const basicIndexEntries = findBasicIndex(pages, indexMarkdownRegexBasic);
	const richIndexEntries = findRichTags(pages, indexMarkdownRegex);

	if(basicIndexEntries.size > 0) {
		findSubjectHeadings(pages, basicIndexEntries, index);
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