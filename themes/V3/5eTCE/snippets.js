/* eslint-disable max-lines */
const dedent             = require('dedent-tabs').default;
const CreditGen = require('./snippets/credit.gen.js');
const DescriptionGen = require('./snippets/description.gen.js');
const CommentGen = require('./snippets/comment.gen.js');

module.exports = [
    {
		groupName : 'PHB',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{
				name : 'comment',
				icon : 'fas fa-comment',
				gen  : CommentGen
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
			{
				name : 'Image Description',
				icon : 'fas fa-message',
				gen  : DescriptionGen
			}
		]
	}
];