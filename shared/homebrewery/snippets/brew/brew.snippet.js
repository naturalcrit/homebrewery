const _ = require('lodash');
const Data = require('./random.data.js');


const Snips = _.merge(
	require('./spell.snippet.js'),
	require('./table.snippet.js'),
	require('./class.snippet.js'),
	require('./note.snippet.js'),
	require('./monster.snippet.js')
);

const BrewSnippets = {
	brew : ()=>{
		return _.times(_.random(1,10), ()=>BrewSnippets.page()).join('\n\n\\page\n\n');
	},

	page : ()=>{

		const base = [
			BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph,
			BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph,
			Snips.table, Snips.table,
			Snips.note, Snips.note, Snips.altnote,
			Snips.monster,
			BrewSnippets.title,BrewSnippets.title,BrewSnippets.title

		]

		const fns = Data.mix(base, 15, 10);

		return _.map(fns, (fn)=>fn()).join('\n\n');
	},

	paragraph : (dropcap = false)=>{
		let res = Data.rand(Data.sentences, 6, 3).join(' ');
		if(dropcap || Data.chance(20)) res = `{{dropcap\n${res}\n}}`;
		return res;
	},

	title : ()=>{
		return _.sample(['##', '###', '##', '###','####', '#####']) + ' ' + Data.rand('titles');
	}
}

module.exports = BrewSnippets;