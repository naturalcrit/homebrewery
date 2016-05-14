var _ = require('lodash');

var spells = require('./5espells.js');

String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}


var parsedSpells = _.map(spells, (spell)=>{

	var comp = {}

	var name = spell.name.replace(' (Ritual)', '');


	return {
		id : _.snakeCase(name),
		name : name,
		description : spell.description
			.replaceAll('\r\n', '\n')
			.replaceAll('&nbsp;', ''),

		scales : spell.athigherlevel,

		components : {},
		classes : _.map(spell.classes || [], (cls)=>{return cls.toLowerCase();}),


		level : Number(spell.level),

		ritual : spell.ritual == "Yes",
		concentration : spell.concentration == "Yes",

		range : spell.range,
		duration : spell.duration,


		school : spell.school.toLowerCase(),

		source : spell.source,
		page : spell.page,
	}




});

module.exports = parsedSpells;

