const _ = require('lodash');

var titles = [
    'Introduction to the World of DnD',
    'Creating Your Character',
    'The Rules of the Game',
    'Combat and Combat Strategies',
    'Magic and Spellcasting',
    'Adventuring and Exploration',
    'Dungeon Delving',
    'Campaign Building and World Building',
    'DM Techniques and Tips',
    'Appendix: Reference Material',
    'Monsters and Creatures',
    'Equipment and Treasure',
    'Non-Player Characters (NPCs)',
    'Experience and Leveling',
    'Races and Classes',
    'Skills and Abilities',
    'Alignment and Moral Choices',
    'Player-vs-Player Conflict',
    'Game Mastering 101',
    'Running a Successful Campaign',
    'Worldbuilding and Lore',
    'Designing Encounters and Adventures',
    'Managing Players and their Expectations',
    'Factions and Political Intrigue',
    'Adventure Hooks and Plot Ideas',
    'Building a Campaign Setting',
    'Handling Rules Disputes',
    'Running Large-Scale Battles',
    'Designing Unique Magic Systems',
    'Developing and Using NPCs',
    'Crafting Memorable Quests',
    'Improvising When Things Don\'t Go as Planned',
    'Managing Session Flow and Pacing',
    'Building a World That Feels Alive'
];

module.exports = ()=>{
	return `{{partCover}}

# PART X
## Developing and Using NPCs

{{imageMaskEdge5,--offset:10cm,--rotation:180        
![Background](https://i.imgur.com/dpg5qPT.png)
}}
<!-- Use --offset to shift the mask toward or away from the page center.
     Use --rotation to set rotation angle in degrees. -->
\\page`;
};