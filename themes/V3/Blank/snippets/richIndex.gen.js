/* eslint-disable max-depth */
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const setCrossRefAnchor = (indexes, pageRef)=>{
	// Set a flag to generate a reflink at the topic or subtopic.
	let index;

	if(indexes.has(pageRef[1])) {
		index = indexes.get(pageRef[1].trim());
	} else {
		index = new Map();
	}

	// If the Topic doesn't exist yet....
	if(!index?.has(pageRef[2].trim())){
		const topic = new Map();
		topic.set('pages', []);
		topic.set('entries', new Map());
		const subEntries = topic.get('entries');
		if(pageRef[3].trim().length > 0) {
			const subTopicMap = new Map();
			subTopicMap.set('pages', []);
			subTopicMap.set('setAnchor', true);
			subEntries.set(pageRef[3].trim(), subTopicMap);
		} else {
			const subTopicMap = subEntries.get(pageRef[3].trim());
			subTopicMap.set('setAnchor', true);
			subEntries.set(pageRef[3].trim(), subTopicMap);
		}
		topic.set('entries', subEntries);
		index.set(pageRef[2].trim(), topic);
		indexes.set(pageRef[1].trim(), index);
		return;
	}

	const topic = index.get(pageRef[2].trim());
	if(pageRef[3].trim().length > 0) {
		const subEntries = topic.get('entries');
		let subTopicMap;
		// If the subtopic doesn't exist
		if(!subEntries.has(pageRef[3].trim())){
			subTopicMap = new Map();
			subTopicMap.set('pages', []);
			subTopicMap.set('setAnchor', true);
		} else {
			subTopicMap = subEntries.get(pageRef[3].trim());
			subTopicMap.set('pages', []);
			subTopicMap.set('setAnchor', true);
		}
		subEntries.set(pageRef[3].trim(), subTopicMap);
		topic.set('entries', subEntries);
	} else {
		topic.set('setAnchor', true);
	}
	index.set(pageRef[2], topic);
	indexes.set(pageRef[1], index);
};

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
		setCrossRefAnchor(indexes, pageRef);
	}

	const topic = entryMatch[2].trim();
	const subTopic = entryMatch[3]?.length > 0 ? entryMatch[3].trim() : '';

	const activeIndex = indexes.get(useIndex);
	let activeTopic;
	if(!activeIndex.has(topic)) {
		// This is a new Topic, initialize it.
		activeIndex.set(topic, new Map());
		activeTopic = activeIndex.get(topic);
		activeTopic.set('pages', []);
		activeTopic.set('entries', new Map());
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

const sortMap = (m)=>{
	return (new Map([...m.entries()].sort((a, b)=>{
		const lowA = a[0].toLowerCase();
		const lowB = b[0].toLowerCase();
		if(lowA == lowB) return 0;
		if(lowA > lowB) return 1;
		return -1;
	})));
};


// Processes a list of Index Marker targets, either as page numbers or as Cross References
const formatIndexLocations = (pagesArray)=>{
	let results = '';
	const seeRef = [];
	const seeAlsoRef = [];
	const seeUnderRef = [];
	const seeAlsoUnderRef = [];

	for (const [k, pageNumber] of pagesArray.entries()) {
		if(typeof pageNumber == 'number') {
			if(results.length == 0 ) results = ' ... pg. ';
			results = results.concat('[', parseInt(pageNumber+1), `](#p${parseInt(pageNumber+1)}_${entry.toLowerCase().replaceAll(' ', '')}), `);
		} else {
			const cRef = pageNumber[0];
			let targetIndex = cRef[1].length > 0 ? cRef[1].trim() : 'Index:';
			const targetTopic = cRef[2].trim();
			const targetSubtopic = cRef[3].trim();

			const seeUnderFlag = targetIndex[0] == '+';
			const seeAlsoFlag = targetIndex[0] == '|';
			const seeAlsoUnderFlag = targetIndex[0] == '|' && targetIndex[1] == '+';

			targetIndex = targetIndex.replace(/^\|/).replace(/^\+/);

			const topicOrSubtopic = targetSubtopic.length > 0 ? targetSubtopic : targetTopic;
			const crossRef = `[${targetTopic}${targetSubtopic.length > 0 ? `: ${targetSubtopic}` : ''}](#idx_${targetIndex}_${topicOrSubtopic.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()})`;
			if(seeAlsoUnderFlag) seeAlsoUnderRef.push(crossRef);
			else if(seeAlsoFlag) seeAlsoRef.push(crossRef);
			else if(seeUnderFlag) seeUnderRef.push(crossRef);
			else seeRef.push(crossRef);
		}
		if(results[results.length - 1] == ',') results = results.slice(-1);
		if(seeRef.length > 0) results += `\n    see ${seeRef.join(';')}`;
		if(seeUnderRef.length > 0) results += `\n    see under ${seeUnderRef.join(';')}`;
		if(seeAlsoRef.length > 0) results += `\n    see also ${seeAlsoRef.join(';')}`;
		if(seeAlsoUnderRef.length > 0) results += `\n    see also under ${seeAlsoUnderRef.join(';')}`;
	}
	results = results.concat('\n');
	return results;
};

const markup = (indexName, index)=>{
	const sortedIndex = sortMap(index);
	let results = '';

	for (const [subjectHeading, subjectHeadingContents] of sortedIndex) {
		const subjectHeadingPages = subjectHeadingContents.get('pages');
		let setAnchor = '';
		if(subjectHeadingContents.has('setAnchor')) {
			setAnchor = `[#idx_${indexName}_${subjectHeading.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}]"/>`;
		}
		results = results.concat(`- `, setAnchor, subjectHeading);
		results += formatIndexLocations(subjectHeadingPages);
		const subEntries = subjectHeadingContents.get('entries');
		if(subEntries.size) {
			const sortedEntries = sortMap(subEntries);
			for (const [entry, entryPages] of sortedEntries){
				if(sortedEntries.get(entry).has('setAnchor')) {
					setAnchor = `[#idx_${indexName}_${entry.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}]"/>`;
				}
				results = results.concat('  - ', entry);
				results += formatIndexLocations(entryPages.get('pages'));
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

	let  resultIndexes = '';

	if(indexes.get('Index:').size == 0) indexes.delete('Index:');

	const sortedIndexes = sortMap(indexes);


	for (const [indexName, index] of sortedIndexes) {
		const markdown = markup(indexName.replace(/[^\w\s\']|_/g, '').replace(/\s+/g, ''), index);
		resultIndexes +=dedent`
		{{index,wide
		##### ${indexName}

		${markdown}
		}}
		\page

		`;
		resultIndexes += '\n';
	};

	return resultIndexes;
};