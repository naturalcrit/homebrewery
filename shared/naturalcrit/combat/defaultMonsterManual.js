module.exports = {
	goblin : {
		size : 'small',
		type : 'beast',
		alignment : 'unaligned',
		stats : {
			hp : 40,
			mov: 30,
			ac : 13,
		},
		scores : {
			str : 8,
			con : 8,
			dex : 8,
			int : 8,
			wis : 8,
			cha : 8
		},
		attr : {
			skills : ['Stealth +5'],
			lang : ['common'],
			cr : 0.25,
		},
		abilities : {
			"pack tactics" : "Does a thing",
			"fancy dance" : "dances fancy"
		},
		actions : {
			bite : {
				type : "Melee weapon attack",
				atk : "+4 to hit",
				rng : "5ft",
				target : "one target",
				dmg : "4 (1d4 + 2) piercing damage",
				desc: ""
			},
			scare : {
				uses : "1/day",
				desc : "scares you"
			}
		},
		items : ['rat on a stick']
	},

	"Goat Slime" : {
		hp : 80,
		mov: 10,
		cr : 0.5,
		ac : 16,
		attr : {
			str : 8,
			con : 8,
			dex : 6,
			int : 4,
			wis : 8,
			cha : 8
		},
		attacks : {
			caress : {
				atk : "1d20+1",
				dmg : "3d4+1",
				type : "sensual"
			},
		},
		abilities : {
			"Agnostic Gel" : "Immune to magical damage"
		},
		items : []
	},
	"badass psycho" : {
		hp : 100,
		mov: 50,
		ac : 14,
		cr : 5,
		attr : {
			str : 17,
			con : 18,
			dex : 16,
			int : 7,
			wis : 7,
			cha : 7
		},
		attacks : {
			"throwing axe" : {
				atk : "1d20+5",
				dmg : "1d12+5",
				type : "piercing",
				rng : "30",
				notes : "returns to baddie after throw"
			},
			shoot : {
				atk : "1d20+2",
				dmg : "4d4",
				rng : "120"
			}
		},
		spells : {
			"meat popsicle" : {
				dmg : "4d6",
				uses : 8
			},
			"sanity check" : {
				dmg : "2d8+4",
				uses : 6
			}
		},
		abilities : {
			"rampage" : "when damaged, can choose to take damage from opportunity attacks for allies"
		},
		items : ['buzz_axe', 'healing_potion', 'tuna_fish']
	},
	toxicologist : {
		hp : 40,
		mov: 30,
		ac : 11,
		cr : 0.5,
		attr : {
			str : 7,
			con : 11,
			dex : 10,
			int : 18,
			wis : 15,
			cha : 7
		},
		spells : {
			"publish paper" : {
				dmg : "4d6",
				uses : 4
			},
			"tox test" : {
				heal : "2d8+4",
				uses : 6
			}
		},
		abilities : {
			"conference" : "when around more than 30 other toxicologists, consume 1 drink every 15 minutes"
		},
		items : ['grad_student', 'imposter_syndrome', 'ring']
	},
}