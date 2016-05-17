var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Skill = require('../skill/skill.jsx');
var Box = require('../box/box.jsx');


var skill_list = [
	{name : 'Acrobatics', stat : 'Dex'},
	{name : 'Animal Handling', stat : 'Wis'},
	{name : 'Arcana', stat : 'Int'},
	{name : 'Athletics', stat : 'Str'},
	{name : 'Deception', stat : 'Cha'},
	{name : 'History', stat : 'Int'},
	{name : 'Insight', stat : 'Wis'},
	{name : 'Intimidation', stat : 'Cha'},
	{name : 'Investigation', stat : 'Int'},
	{name : 'Medicine', stat : 'Wis'},
	{name : 'Nature', stat : 'Int'},
	{name : 'Perception', stat : 'Wis'},
	{name : 'Performance', stat : 'Cha'},
	{name : 'Persuasion', stat : 'Cha'},
	{name : 'Religion', stat : 'Int'},
	{name : 'Sleight of Hand', stat : 'Dex'},
	{name : 'Stealth', stat : 'Dex'},
	{name : 'Survival', stat : 'Wis'}
]


var SkillList = React.createClass({
	getDefaultProps: function() {
		return {
			name : 'skills',

			//title : 'Skills',
			shadow : true,
			border : false,
			showExpert : false
		};
	},


	renderSkills : function(){
		return _.map(skill_list, (skill)=>{
			return <Skill
				label={skill.name}
				sublabel={'(' + skill.stat + ')'}
				showExpert={this.props.showExpert} />
		})
	},

	render : function(){
		return <Box className='skillList' {...this.props}>
			{this.renderSkills()}
			{this.props.children}
		</Box>
	}
});

module.exports = SkillList;
