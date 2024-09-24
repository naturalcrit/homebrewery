/* eslint-disable max-lines */
/* eslint-disable max-depth */
const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const setCrossRefAnchor = (indexes, pageRef)=>{
	// Set a flag to generate a reflink at the topic or subtopic.
	let index, topic;

	const cleanIndexName = pageRef.index.trim().replace(/^|/, '').replace(/^\+/, '');

	if(indexes.has(cleanIndexName)) {
		index = indexes.get(cleanIndexName);
	} else {
		index = new Map();
	}

	// If the Topic doesn't exist yet....
	if(!index?.has(pageRef.topic.trim())){
		topic = new Map();
		topic.set('pages', []);
		topic.set('entries', new Map());
		index.set(pageRef.topic.trim(), topic);
		indexes.set(cleanIndexName, index);
	} else {
		topic = index.get(pageRef.topic.trim());
	}

	if(pageRef.subtopic?.length > 0) {
		const subEntries = topic.get('entries');
		let subTopicMap;
		// If the subtopic doesn't exist
		if(!subEntries.has(pageRef.subtopic.trim())){
			subTopicMap = new Map();
			subTopicMap.set('pages', []);
			subTopicMap.set('setAnchor', true);
		} else {
			subTopicMap = subEntries.get(pageRef.subtopic.trim());
			subTopicMap.set('setAnchor', true);
		}
		subEntries.set(pageRef.subtopic.trim(), subTopicMap);
		topic.set('entries', subEntries);
	} else {
		topic.set('setAnchor', true);
	}
	index.set(pageRef.topic, topic);
	indexes.set(cleanIndexName, index);
};

const indexSplit=(src)=>{
	let index, topic, subtopic;
	const indexSplitRegex = /(?<!\\):/;
	const subTopicSplit = /(?<!\\)\//;

	let working = [];
	if(src.search(indexSplitRegex) < 0){
		working[1] = src.trim();
		index = 'Index:';
	} else {
		working = src.split(indexSplitRegex);
		if(working[1]?.length > 0) {
			index = working[0].replace('\\:', ':').trim();
			if(!working[1]?.trim()>0) {
				working.splice(1, 1);
			}
			working[1] = working[1]?.trim();
		}
	}

	if(working[1]?.length > 0) {
		if(working[1].search(subTopicSplit) !== -1){
			const topics = working[1].split(subTopicSplit);
			topic = topics[0].trim();
			if(topics[1]) { topics[1] = topics[1].trim(); }
			if(topics[1]?.length>0) {
				subtopic = topics[1].trim();
			}
		} else {
			topic = working[1];
		}
	}

	if(topic?.length>0) {
		return { index: index, topic: topic, subtopic: subtopic };
	} else {
		return undefined;
	}

};


const insertIndex = (indexes, entry, pageNumber, runningErrors)=>{
	const crossReferenceSplit = /(?<!\\)\|/;
	let crossReference = entry.split(crossReferenceSplit);

	const entryMatch = indexSplit(crossReference[0]);
	if(!entryMatch) return;
	const useIndex = entryMatch.index;
	if(!indexes.has(useIndex)) {
		indexes.set(useIndex, new Map());
	}

	// Ugly, but functional. Maybe someone can make a smarter split
	if(crossReference.length == 3) {
		crossReference[2] = `|${crossReference[2]}`;
		crossReference = _.compact(crossReference);
	}

	const pageRef = ((crossReference.length>1) && (crossReference[1].length>0)) ? indexSplit(crossReference[1].trim()) : pageNumber;
	if(typeof pageRef !== 'number') {
		setCrossRefAnchor(indexes, pageRef);
	}

	const topic = entryMatch.topic;
	const subTopic = entryMatch.subtopic;

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

	if(subTopic?.length>0) {
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
		const pageArray = activeTopic.get('pages');
		pageArray.push(pageRef);
		activeTopic.set('pages', pageArray);
	}
	activeIndex.set(topic, activeTopic);
	indexes.set(useIndex, activeIndex);
};

const findIndexEntries = (pages, indexes, runningErrors)=>{
	const theRegex = /^#((.+)(?<!\\):)?(.+)((?:(?<!\\)\/(.+)))?\n/mg;
	for (const [pageNumber, page] of pages.entries()) {
		if(page.match(theRegex)) {
			let match;
			while ((match = theRegex.exec(page)) !== null){
				// Dumb check to make sure we aren't sending a header
				if((match[0][1] !== '#') && (match[0][1] !== ' ')) {
					insertIndex(indexes, match[0].slice(1), pageNumber, runningErrors);
				}
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

const sanityCheckUnders = (indexes, entryAddress)=>{
	// Return undefined if the target does not exist.
	// Return true if the target exists and is a topic and has an assigned page
	// Return true if the target exists and is the subtopic of an entry with more than one subtopic and has an assigned page
	// Return false if the target exists and does not have an assigned page
	// Return false if the target exists and the topic has less than two subtopics.


	// Verify the index exists
	if(indexes.get(entryAddress.index)==undefined) return undefined;
	// Verify the topic exists
	const topic=indexes.get(entryAddress.index).get(entryAddress.topic);
	const topicPages = topic.get('pages');
	if((topic==undefined) || ((topicPages?.length<1) && (topic.get('entries').size<1))) return undefined;
	// Verify the subtopic exists if needed
	if(!entryAddress.subtopic) return true;
	const entries = topic.get('entries');
	const subtopic = entries.get(entryAddress.subtopic);
	if(subtopic==undefined) return undefined;
	const pages=subtopic.get('pages');
	if((topicPages?.length<1) && (pages.length<1)) return undefined;
	if(entries.size < 2) return false;
	return true;
};


// Processes a list of Index Marker targets, either as page numbers or as Cross References
const formatIndexLocations = (indexes, pagesArray, entry, runningErrors)=>{
	let results = '';
	const seeRef = [];
	const seeAlsoRef = [];
	const seeUnderRef = [];
	const seeAlsoUnderRef = [];

	for (const [k, pageNumber] of pagesArray.entries()) {
		if(typeof pageNumber == 'number') {
			if(results.length == 0) results = ' ... pg. ';
			results = results.concat('[', parseInt(pageNumber+1), `](#p${parseInt(pageNumber)}_${entry.toLowerCase().replaceAll(' ', '')}), `);
		} else {
			let targetIndex = pageNumber.index?.length > 0 ? pageNumber.index : 'Index:';
			const targetTopic = pageNumber.topic;
			const targetSubtopic = pageNumber.subtopic;

			const seeUnderFlag = targetIndex[0] == '+';
			const seeAlsoFlag = targetIndex[0] == '|';
			const seeAlsoUnderFlag = targetIndex[0] == '|' && targetIndex[1] == '+';

			targetIndex = targetIndex.replace(/^\|/, '').replace(/^\+/, '');
			const useSubtopic = sanityCheckUnders(indexes, { index: targetIndex, topic: targetTopic, subtopic: targetSubtopic });


			if(useSubtopic !== undefined){
				const topicOrSubtopic = (targetSubtopic?.length > 0) && (useSubtopic) ? `${targetTopic}_${targetSubtopic}` : targetTopic;
				const crossRef = `[${targetTopic}${(useSubtopic) && (targetSubtopic?.length > 0) ? `: ${targetSubtopic}` : ''}](#idx_${targetIndex.replaceAll(' ', '').replaceAll('|', '_').toLowerCase()}_${topicOrSubtopic.replaceAll(' ', '').replaceAll('|', '_').toLowerCase()})`;
				if(seeAlsoUnderFlag) seeAlsoUnderRef.push(crossRef);
				else if(seeAlsoFlag) seeAlsoRef.push(crossRef);
				else if(seeUnderFlag) seeUnderRef.push(crossRef);
				else seeRef.push(crossRef);
			} else {
				runningErrors.push(`Unable to create crossreference to ${targetIndex}: ${targetTopic} - ${targetSubtopic}`);
			}
		}
	}
	if(results[results.length - 1] == ',') results = results.slice(-1);
	if(seeRef.length > 0) results += `\n    see ${seeRef.join(';')}`;
	if(seeUnderRef.length > 0) results += `\n    see under ${seeUnderRef.join(';')}`;
	if(seeAlsoRef.length > 0) results += `\n    see also ${seeAlsoRef.join(';')}`;
	if(seeAlsoUnderRef.length > 0) results += `\n    see also under ${seeAlsoUnderRef.join(';')}`;
	results = results.concat('\n');
	return results;
};

const markup = (indexes, indexName, index, runningErrors)=>{
	const sortedIndex = sortMap(index);
	let results = '';

	for (const [subjectHeading, subjectHeadingContents] of sortedIndex) {
		let topicResults = '';
		let subtopicResults = '';
		const setAnchor = [];
		if(subjectHeadingContents.has('setAnchor')) {
			setAnchor.push(`<a id="idx_${indexName.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}_${subjectHeading.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}"></a>`);
		}
		const topicLocations = formatIndexLocations(indexes, subjectHeadingContents.get('pages'), subjectHeading, runningErrors);
		const subEntries = subjectHeadingContents.get('entries');
		if(subEntries.size) {
			const sortedEntries = sortMap(subEntries);
			for (const [entry, entryPages] of sortedEntries){
				const setSubAnchor = [];
				if(sortedEntries.get(entry).has('setAnchor')) {
					setSubAnchor.push(`<a id="idx_${indexName.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}_${subjectHeading.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}_${entry.replace(/\s/g, '').replace(/\|/g, '_').toLowerCase()}"></a>`);
				}
				const subtopicLocations = formatIndexLocations(indexes, entryPages.get('pages'), entry, runningErrors);
				if(subtopicLocations.length > 1) {
					subtopicResults = subtopicResults.concat('  - ', setSubAnchor.join(''), entry, subtopicLocations);
				}
			}
		}
		if((topicLocations.length>1) || (subtopicResults.length > 0)) {
			// eslint-disable-next-line max-lines
			topicResults = topicResults.concat(`- `, setAnchor.join(''), subjectHeading, topicLocations, subtopicResults);
			results = results.concat(topicResults);
		}
	}
	return results;
};

module.exports = function (props) {
	const indexes = new Map();
	// eslint-disable-next-line max-lines
	indexes.set('Index:', new Map());

	const pages = props.brew.text.split('\\page');

	const runningErrors = [];
	findIndexEntries(pages, indexes, runningErrors);

	let  resultIndexes = '';

	if(indexes.get('Index:').size == 0) indexes.delete('Index:');

	const sortedIndexes = sortMap(indexes);

	for (const [indexName, index] of sortedIndexes) {
		const markdown = markup(indexes, indexName.replace(/[^\w\s\']|_/g, '').replace(/\s+/g, ''), index, runningErrors);
		if(markdown.length > 0) {
			resultIndexes +=dedent`
			{{index,wide
			##### ${indexName}

			${markdown}
			}}
			\page

			`;
			resultIndexes += '\n';
		}
	};

	return resultIndexes;
};