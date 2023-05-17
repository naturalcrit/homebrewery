/* eslint-disable max-lines */
const dedent             = require('dedent-tabs').default;

module.exports = [
    {
		groupName : 'TCE',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{
				name : 'comment',
				icon : 'fas fa-bookmark',
				gen  : '{{comment\nLorem ipsum dolor sit amet.\n\nTasha\n}}\n'
			},
			{
				name : 'topStain',
				icon : 'fas fa-bookmark',
				gen  : '{{topStain${_.random(1, 5)}}}\n\n'
			},
		]
	}
];