const _ = require('lodash');
const dedent = require('dedent-tabs').default;

module.exports = () => {
  return dedent`{{index,wide,columns:5;
        ##### Index
        - Abjuration Magic  
        creating spell slots, 12  
        protective wards, 23  
        - Acrobatics Skill  
        checks, 7, 10  
        - Adventurers  
        creating a character, 4-6, 15  
        - Alignment  
        choosing an alignment, 8-9   
        effects of alignment, 18  
        - Arcana Skill  
        checks, 12, 23  
        - Armor  
        types of armor, 5  
        donning and doffing armor, 13-14  
        - Backgrounds  
        choosing a background, 6-7  
        background features, 20-22  
        - Bards  
        class features, 11-12  
        spells, 27-28  
        - Charisma Ability Score  
        determining ability score, 10  
        modifying ability score, 13  
        - Clerics  
        class features, 11  
        spells, 25-26  
        - Combat  
        initiative, 5-6  
        actions in combat, 13  
        resolving attacks, 29-31  
        - Constitution Ability Score  
        determining ability score, 10  
        modifying ability score, 13  
        - Dexterity Ability Score  
        determining ability score, 10  
        modifying ability score, 13  
        - Dungeon Master  
        role of the DM, 4  
        preparing for a game, 16-18  
        - Dungeons & Dragons  
        history of the game, 4-6  
        basic rules, 15  
        - Equipment  
        buying and selling equipment, 5  
        gear, 14-15  
        - Experience Points (XP)  
        gaining XP, 8  
        level advancement, 17  
        - Familiars  
        types of familiars, 12  
        familiar rules, 24  
        - Feats  
        gaining feats, 13  
        types of feats, 30  
        - Fighters  
        class features, 11  
        combat styles, 25  
        - Hit Points (HP)  
        determining HP, 5  
        losing and gaining HP, 13  
        healing, 29-30  
        - Intelligence Ability Score  
        determining ability score, 10  
        modifying ability score, 13  
        - Items  
        types of items, 5  
        using and interacting with items, 14-15  
        - Lore  
        knowledge checks, 12  
        identifying magic, 23-24  
        - Monsters  
        creating and using monsters, 11-12  
        monster stats, 27-28  
        - Nature Skill  
        checks, 12  
        identifying creatures, 23  
        - Paladins  
        class features, 11  
        spells, 26-27  
        - Perception Skill  
        checks, 7, 10  
        - Rangers  
        class features, 11  
        spells, 26  
        - Religion Skill  
        checks, 12  
        identifying holy symbols, 24  
        - Rogues  
        class features, 11  
        sneak attack, 25-26  
        - Sorcerers  
        class features, 11  
        spells, 28-29  
        - Stealth Skill  
        checks, 7, 10  
        - Strength Ability Score  
        determining ability score, 10  
        modifying ability score, 13  
        - Thieves’ Tools  
        using thieves’ tools, 14  
        disarming traps, 31  
        - Warlocks  
        class features, 11  
        spells, 29  
        - Wizards  
        class features, 11-12  
        preparing spells, 27  
        }}`;
};