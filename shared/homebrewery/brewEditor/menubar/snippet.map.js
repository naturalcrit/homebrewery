const Snippets = require('homebrewery/snippets');

module.exports = {
	brew : [
		{
			name : 'PHB',
			icon : 'fa-book',
			snippets : [
				{
					name : 'Spell',
					icon : 'fa-magic',
					gen : Snippets.brew.spell
				},
				{
					name : 'Table',
					icon : 'fa-table',
					gen : Snippets.brew.table
				},

			]
		},
		{
			name : 'Mods',
			icon : 'fa-gear',
			snippets : []
		}
	],

	style : [
		{
			name : 'Print',
			icon : 'fa-print',
			snippets : [
				{
					name : 'Ink Friendly',
					icon : 'fa-tint',
					gen : Snippets.style.inkFriendly
				},
				{
					name : 'A4 Page Size',
					icon : 'fa-file',
					gen : Snippets.style.a4
				},

			]
		}
	]
}