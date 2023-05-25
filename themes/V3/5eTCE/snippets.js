/* eslint-disable max-lines */
const dedent             = require('dedent-tabs').default;
const CreditGen = require('./snippets/credit.gen.js');

module.exports = [
    {
		groupName : 'PHB',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{
				name : 'comment',
				icon : 'fas fa-comment',
				gen  : '{{comment\nLorem ipsum dolor sit amet.\n\nTasha\n}}\n'
			},
			{
				name : 'topStain',
				icon : 'fas fa-bookmark',
				gen  : '{{topStain${_.random(1, 5)}}}\n\n'
			},
			{
				name : 'Credits',
				icon : 'fas fa-users',
				gen  : CreditGen
			},
		]
	}
];