const dedent = require('dedent-tabs').default;
const srdMonsters = require('./srd_monsters.json');

const srdFormat = function(monster){
	return dedent`
        {{font-size:smaller *Monsters from the System Reference Document (SRD) are subject to the Open Gaming License. Please check the terms of use are met prior to distribution of material.*}}
        :
        {{monster,srd,frame
        ## ${monster['name']}  
        *${monster['meta']}*  
        ___
        **Armor Class** :: ${monster['Armor Class']}
        **Hit Points** :: ${monster['Hit Points']}
        **Speed** :: ${monster['Speed']}
        ___
        |  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
        |:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
        |${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].flatMap((item)=>{
		return `${monster[item]} ${monster[`${item}_mod`]}`;
	}).join('|')}|\n
        ${['Saving Throws', 'Skills', 'Damage Resistances', 'Damage Immunities', 'Condition Immunities', 'Senses', 'Languages'].flatMap((item)=>{
		return (monster[item] ? [`**${item}** :: ${monster[item]}`] : []);
	}).join('  \n')}					
        **Challenge** :: ${monster['Challenge']}
        ___
        ${monster['Traits'] ? `${monster['Traits']}\n:\n` : ''}
        ### Actions
        ${monster['Actions']}
        :
        }}
        ${monster['img_url'] ? `![](${monster['img_url']}){width:100%;mix-blend-mode:darken}` : ''}
        `;
};

module.exports = {
	randomMonster : function() {
		const monsterIndex = Math.floor(Math.random() * srdMonsters.length);
	    return srdFormat(srdMonsters[monsterIndex]);
	}
};