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
	brewModel : ()=>{
		return {
			title : Data.rand(Data.titles),
			description : Data.rand(Data.subtitles),
			text : BrewSnippets.brew(),

			authors : _.sampleSize(['userA','userB','userC','userD'], _.random(0, 3)),
			systems : _.sampleSize(['5e', '4e', '3.5e', 'Pathfinder'], _.random(0,2)),
			views   : _.random(0,1000),
			published : !!_.random(0,1)
		}
	},
	brew : ()=>{
		return _.times(_.random(1,10), ()=>_.sample([
			BrewSnippets.page1,
			BrewSnippets.page2
		])()).join('\n\n\\page\n\n');
	},

	page1 : ()=>{
		return BrewSnippets.filler(_.random(10, 15), [Snips.monster, Snips.table]);
	},

	page2 : ()=>{
		const title = '# ' + Data.rand('titles');
		let table = Snips.noncasterTable();

		if(Data.chance(3)){
			table = Snips.casterTable();
			if(Data.chance(2)) table = Snips.halfcasterTable();
			return `${title}\n\n${table}\n\n${BrewSnippets.paragraph(true)}\n\n${BrewSnippets.filler(3)}`;
		}
		return `${title}\n\n${table}\n\n${BrewSnippets.paragraph(true)}\n\n${BrewSnippets.filler(5)}`;
	},

	filler : (count = 1, additional = [])=>{
		const base = _.concat([
			BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph,
			BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph, BrewSnippets.paragraph,
			Snips.table,
			Snips.note, Snips.note, Snips.altnote
		], additional);
		return _.times(count, ()=>{
			let res = _.sample(base)();
			if(Data.chance(8)) res = BrewSnippets.title() + '\n\n' + res;
			return res;
		}).join('\n\n');
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