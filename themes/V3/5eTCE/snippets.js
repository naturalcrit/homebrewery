/* eslint-disable max-lines */
const _ = require('lodash');

const dedent = require('dedent-tabs').default;
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
				gen  : CommentGen,
				experimental : true
			},
			{
				name : 'topStain',
				icon : 'fas fa-bookmark',
				gen  :  dedent`{{topStain${_.random(1, 5)}}}\n\n`,
				experimental : true
			},
			{
				name : 'Credits',
				icon : 'fas fa-users',
				gen  : CreditGen,
				experimental : true
			},
			{
				name : 'Image Description',
				icon : 'fas fa-align-justify',
				gen  : DescriptionGen,
				experimental : true
			},
		]
	}
];