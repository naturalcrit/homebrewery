const _ = require('lodash');
const dedent = require('dedent-tabs').default;

const insertGlossary = (glossaries, entry, definition, runningErrors)=>{

	const glossarySplitRegex = /(?<!\\):/;

	const glossarySplit = entry.split(glossarySplitRegex);

	if(glossarySplit.length != 2) return;

	const useGlossary = glossarySplit[0].trim().length > 0 ? glossarySplit[0].trim() : 'Glossary:';
	const term = glossarySplit[1].trim();

	if((!definition) || (!term)) return;

	if(!glossaries.has(useGlossary)) {
		glossaries.set(useGlossary, new Map());
	}

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
	// const theRegex = /^#((.+)(?<!\\):)?(.+)((?:(?<!\\)\/(.+)))?\n/mg;
	const theRegex = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]\#(?!\() *((?:\n? *[^\s].*)+)(?=\n+|$)/mg;
	for (const [pageNumber, page] of pages.entries()) {
		if(page.match(theRegex)) {
			let match;
			while ((match = theRegex.exec(page)) !== null){
				insertGlossary(glossaries, match[1], match[2], runningErrors);
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