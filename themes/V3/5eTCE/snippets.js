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
				gen  : '{{comment Lorem ipsum dolor sit amet.\n\nTasha}}\n'
			},
			{
				name : 'Blue header',
				icon : 'fas fa-sort-numeric-down',
				gen  : '{{blueheader Header}}\n'
			}
		]
	}
];