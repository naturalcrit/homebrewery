const _ = require('lodash');

const ClassFeatureGen = require('./classfeature.gen.js');

const ClassTableGen = require('./classtable.gen.js');

module.exports = function(){

	const classname = _.sample(['Archivist', 'Fancyman', 'Linguist', 'Fletcher',
		'Notary', 'Berserker-Typist', 'Fishmongerer', 'Manicurist', 'Haberdasher', 'Concierge']);


	const image = _.sample(_.map([
		'http://orig01.deviantart.net/4682/f/2007/099/f/c/bard_stick_figure_by_wrpigeek.png',
		'http://img07.deviantart.net/a3c9/i/2007/099/3/a/archer_stick_figure_by_wrpigeek.png',
		'http://pre04.deviantart.net/d596/th/pre/f/2007/099/5/2/adventurer_stick_figure_by_wrpigeek.png',
		'http://img13.deviantart.net/d501/i/2007/099/d/4/black_mage_stick_figure_by_wrpigeek.png',
		'http://img09.deviantart.net/5cf3/i/2007/099/d/d/dark_knight_stick_figure_by_wrpigeek.png',
		'http://pre01.deviantart.net/7a34/th/pre/f/2007/099/6/3/monk_stick_figure_by_wrpigeek.png',
		'http://img11.deviantart.net/5dcc/i/2007/099/d/1/mystic_knight_stick_figure_by_wrpigeek.png',
		'http://pre08.deviantart.net/ad45/th/pre/f/2007/099/a/0/thief_stick_figure_by_wrpigeek.png',
	], function(url){
		return `<img src = '${url}' style='max-width:8cm;max-height:25cm' />`;
	}));


	return `${[
		image,
		'',
		'```',
		'```',
		'<div style=\'margin-top:240px\'></div>\n\n',
		`## ${classname}`,
		'Cool intro stuff will go here',

		'\\page',
		ClassTableGen(classname),
		ClassFeatureGen(classname),



	].join('\n')}\n\n\n`;
};