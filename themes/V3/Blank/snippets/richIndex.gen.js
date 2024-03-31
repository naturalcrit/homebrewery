/* eslint-disable max-depth */
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const insertIndex = (indexes, entry, pageNumber, runningErrors)=> {
	const addressRegEx = /^(.+)(?<!\\):([^/]+)(?:(?<!\\)\/([^|]+))/gm;
	const crossReferenceSplit = /(?<!\\)\|/g;

	const crossReference = entry.split(crossReferenceSplit);
	const entryMatch = addressRegEx.exec(crossReference[0]);

	const useIndex = entryMatch[1].trim().length > 0 ? entryMatch[1].trim() : 'Index:';
	if(!indexes.has(useIndex)) {
		indexes.set(useIndex, new Map());
	}

	addressRegEx.lastIndex = 0;
	const pageRef = ((crossReference.length>1) && (crossReference[1].length>0)) ? addressRegEx.exec(crossReference[1]) : pageNumber;
	if(typeof pageRef !== 'number') {
		setCrossRefAnchor(pageRef);
	}

	const topic = entryMatch[2].trim();
	const subTopic = entryMatch[3]?.length > 0 ? entryMatch[3].trim() : '';

	const activeIndex = indexes.get(useIndex);
	let activeTopic;
	if(!activeIndex.has(topic)) {
		// This is a new Topic, initialize it.
		activeIndex.set(topic, new Map());
		activeTopic = activeIndex.get(topic);
		activeTopic.set('entries', new Map());
		activeTopic.set('rich', true);
	} else {
		activeTopic = activeIndex.get(topic);
	}

	if(subTopic.length>0) {
		const subEntries = activeTopic.get('entries');
		if((!subEntries.size > 0) || (!subEntries.has(subTopic))) {
			// This is a new Subtopic, initialize it.
			const subTopicMap = new Map();
			subTopicMap.set('pages', [pageRef]);
			subEntries.set(subTopic, subTopicMap);
		} else {
			const subTopicEntry = subEntries.get(subTopic);
			const pageArray = subTopicEntry.get('pages');
			pageArray.push(pageRef);
			subTopicEntry.set('pages', pageArray);
		}
	} else {
		const pageArray = activeTopic.get(pages);
		pageArray.push(pageRef);
		activeTopic.set('pages', pageArray);
	}

	activeIndex.set(topic, activeTopic);
};

const findIndexEntries = (pages, indexes, runningErrors)=>{
	const theRegex = /#(.+)(?<!\\):(.+)(?:(?<!\\)\/(.+))\n/mg;
	for (const [pageNumber, page] of pages.entries()) {
		if(page.match(theRegex)) {
			let match;
			while ((match = theRegex.exec(page)) !== null){
				insertIndex(indexes, match[0].slice(1), pageNumber, runningErrors);
			}
		}
	};
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
	const indexes = new Map();
	indexes.set('Index:', new Map());

	const pages = props.brew.text.split('\\page');

	const runningErrors = [];
	findIndexEntries(pages, indexes, runningErrors);

	// let  resultIndexes = '';

	// for (const index of indexes) {
	// 	const markdown = markup(index);
	// 	resultIndexes +=dedent`
	// 	{{index,wide
	// 	##### Index

	// 	${markdown}
	// 	}}
	// 	/page`;
	// };

	// return resultIndexes;
	return '';
};