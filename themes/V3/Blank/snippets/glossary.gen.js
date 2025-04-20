const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const glossarySplit=(src)=>{
	let glossary, term, definition;
	const glossarySplitRegex = /(?<!\\):/;
	const definitionSplit = /(?<!\\)\/\//;

	let working = [];
	if(src.search(glossarySplitRegex) < 0){
		working[1] = src.trim();
		glossary = 'Glossary:';
	} else {
		working = src.split(glossarySplitRegex);
		if(working[1]?.length > 0) {
			glossary = working[0].replace('\\:', ':').trim();
			if(!working[1]?.trim()>0) {
				working.splice(1, 1);
			}
			working[1] = working[1]?.trim();
		}
	}

	if(working[1]?.length > 0) {
		if(working[1].search(definitionSplit) !== -1){
			const terms = working[1].split(definitionSplit);
			term = terms[0].trim();
			if(terms[1]) { terms[1] = terms[1].trim(); }
			if(terms[1]?.length>0) {
				definition = terms[1].trim();
			}
		} else {
			term = working[1];
		}
	}

	if(term?.length>0) {
		return { glossary: glossary, term: term, definition: definition };
	} else {
		return undefined;
	}

};


const insertGlossary = (glossaries, entry, pageNumber, runningErrors)=>{

	const entryMatch = glossarySplit(entry);
	if((!entryMatch) || (!entryMatch.definition) || (!entryMatch.term)) return;

	const useGlossary = entryMatch.glossary;
	if(!glossaries.has(useGlossary)) {
		glossaries.set(useGlossary, new Map());
	}

	const term = entryMatch.term;
	const definition = entryMatch.definition;

	const activeGlossary = glossaries.get(useGlossary);
	let activeTerm;
	if(!activeGlossary.has(term)) {
		// This is a new Term, initialize it.
		activeGlossary.set(term, new Map());
		activeTerm = activeGlossary.get(term);
		activeTerm.set('entries', new Map());
	} else {
		activeTerm = activeGlossary.get(term);
	}

	const subEntries = activeTerm.get('entries');
	if((!subEntries.size > 0) || (!subEntries.has(definition))) {
		// This is a new definition, initialize it.
		const definitionMap = new Map();
		subEntries.set(definition, definitionMap);
	}
	activeGlossary.set(term, activeTerm);
	glossaries.set(useGlossary, activeGlossary);
};

const findGlossaryEntries = (pages, glossaries, runningErrors)=>{
	const theRegex = /^#((.+)(?<!\\):)?(.+)((?:(?<!\\)\/(.+)))?\n/mg;
	for (const [pageNumber, page] of pages.entries()) {
		if(page.match(theRegex)) {
			let match;
			while ((match = theRegex.exec(page)) !== null){
				// Dumb check to make sure we aren't sending a header
				if((match[0][1] !== '#') && (match[0][1] !== ' ')) {
					insertGlossary(glossaries, match[0].slice(1), pageNumber, runningErrors);
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

const markup = (glossaries, glossaryName, glossary, runningErrors)=>{
	const sortedGlossary = sortMap(glossary);
	let results = '';

	for (const [subjectHeading, subjectHeadingContents] of sortedGlossary) {
		let termResults = '';
		let definitionResults = '';
		const subEntries = subjectHeadingContents.get('entries');
		if(subEntries.size) {
			const sortedEntries = sortMap(subEntries);
			for (const [entry, entryPages] of sortedEntries){
				definitionResults = definitionResults.concat('::', entry, '\n');
			}
		}
		if(definitionResults.length > 0) {
			termResults = termResults.concat(subjectHeading, '\n', definitionResults, '\n\n');
			results = results.concat(termResults);
		}
	}
	return results;
};

module.exports = function (props) {
	const glossaries = new Map();
	glossaries.set('Glossary:', new Map());

	const pages = props.brew.text.split('\\page');

	const runningErrors = [];
	findGlossaryEntries(pages, glossaries, runningErrors);

	console.log(glossaries);

	let  resultglossaries = '';

	if(glossaries.get('Glossary:').size == 0) glossaries.delete('Glossary:');

	const sortedglossaries = sortMap(glossaries);

	for (const [glossaryName, glossary] of sortedglossaries) {
		const markdown = markup(glossaries, glossaryName.replace(/[^\w\s\']|_/g, '').replace(/\s+/g, ''), glossary, runningErrors);
		if(markdown.length > 0) {
			resultglossaries +=dedent`
			{{glossary
			##### ${glossaryName}

			${markdown}
			}}
			\page

			`;
			resultglossaries += '\n';
		}
	};

	return resultglossaries;
};