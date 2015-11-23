module.exports = {
	goblin : {
		hp : 40,
		mov: 30,
		ac : 13,
		attr : {
			str : 8,
			con : 8,
			dex : 8,
			int : 8,
			wis : 8,
			cha : 8
		},
		attacks : {
			dagger : {
				atk : "1d20-5",
				dmg : "1d4+5",
				type : "pierce",
				notes : "Super cool"
			},
			bow : {
				atk : "1d20+2",
				dmg : "6d6",
				rng : "30"
			}
		},
		spells : {
			fireball: {
				dmg : "6d6",
				uses : 4
			},
			"healing bolt" : {
				heal : "2d8+4",
				uses : 6
			}
		},
		abilities : {
			"pack tactics" : "Does a thing"
		},
		items : ['healing_potion', 'healing_potion', 'ring']
	}
}