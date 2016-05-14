var _ = require('lodash');

var spells = [
	{
		name : "Acid Splash",
		casting_time : "1 action",
		components : {v : true, s : true},
		description : `You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other.
			A target must succeed on a Dexterity saving throw or take 1d6 acid damage.
			This spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).`,
		duration : "Instantaneous",
		level : 0,
		range : "60 feet",
		school : "Conjuration",
		classes : ["sorcerer", "wizard"],
		source : "PHB pg.211"
	},
	{
		name : "Aid",
		casting_time : "1 action",
		components : {v : true, s : true, m : "(a tiny strip of white cloth)"},
		description : `Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target’s hit point maximum and current hit points increase by 5 for the duration. At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, a target’s hit points increase by an additional 5 for each slot level above 2nd.`,
		duration : "8 hours",
		level : 2,
		range : "30 feet",
		school : "Abjuration",
		source : "PHB pg.211"
	},
	{
		name : "Antimagic Field",
		casting_time : "1 action",
		components : {v : true, s : true, m : "(a pinch of powdered iron or iron filings)"},
		description : `A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can’t be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you. Spells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can’t protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn’t function, but the time it spends suppressed counts against its duration. Targeted Effects. Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target. Areas of Magic. The area of another spell or magical effect, such as fireball, can’t extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed. For example, the flames created by a wall of fire are suppressed within the sphere, creating a gap in the wall if the overlap is large enough. Spells. Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it. Magic Items. The properties and powers of magic items are suppressed in the sphere. For example, a +1 longsword in the sphere functions as a nonmagical longsword. A magic weapon’s properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or a piece of magic ammunition fully leaves the sphere (for example, if you fire a magic arrow or throw a magic spear at a target outside the sphere), the magic of the item ceases to be suppressed as soon as it exits. Magical Travel. Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere. Creatures and Objects. A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere. Dispel Magic. Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don’t nullify each other.`,
		duration : "Concentration, up to 1 hour",
		level : 8,
		range : "Self (10-foot-radius sphere)",
		school : "Abjuration",
		source : "PHB pg.213"
	}

];



module.exports = _.map(spells, (spell)=>{
	spell.id = _.snakeCase(spell.name);
	return spell;
});