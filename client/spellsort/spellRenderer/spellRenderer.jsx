var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Markdown = require('marked');

var SpellRenderer = React.createClass({
	getDefaultProps: function() {
		return {
			spells : []
		};
	},

	//TODO: Add in ritual tag
	getSubtitle : function(spell){
		if(spell.level == 0) return <p><em>{spell.school} cantrip</em></p>;
		if(spell.level == 1) return <p><em>{spell.level}st-level {spell.school}</em></p>;
		if(spell.level == 2) return <p><em>{spell.level}nd-level {spell.school}</em></p>;
		if(spell.level == 3) return <p><em>{spell.level}rd-level {spell.school}</em></p>;
		return <p><em>{spell.level}th-level {spell.school}</em></p>;
	},

	getComponents : function(spell){
		var result = [];
		if(spell.components.v) result.push('V');
		if(spell.components.s) result.push('S');
		if(spell.components.m) result.push('M ' + spell.components.m);
		return result.join(', ');
	},

	getHigherLevels : function(spell){
		if(!spell.scales) return null;
		return <p>
			<strong><em>At Higher Levels. </em></strong>
			<span dangerouslySetInnerHTML={{__html: Markdown(spell.scales)}} />
		</p>;
	},

	getClasses : function(spell){
		if(!spell.classes || !spell.classes.length) return null;

		var classes = _.map(spell.classes, (cls)=>{
			return _.capitalize(cls);
		}).join(', ');

		return <li>
			<strong>Classes:</strong> {classes}
		</li>
	},


	renderSpell : function(spell){
		console.log('rendering', spell);
		return <div className='spell' key={spell.id}>

			<h4>{spell.name}</h4>
			{this.getSubtitle(spell)}
			<hr />
			<ul>
				<li>
					<strong>Casting Time:</strong> {spell.casting_time}
				</li>
				<li>
					<strong>Range:</strong> {spell.range}
				</li>
				<li>
					<strong>Components:</strong> {this.getComponents(spell)}
				</li>
				<li>
					<strong>Duration:</strong> {spell.duration}
				</li>
				{this.getClasses(spell)}
			</ul>

			<span dangerouslySetInnerHTML={{__html: Markdown(spell.description)}} />
			{this.getHigherLevels(spell)}
		</div>
	},

	renderSpells : function(){
		return _.map(this.props.spells, (spell)=>{
			return this.renderSpell(spell);
		})
	},

	render : function(){
		return <div className='spellRenderer'>

			<div className='phb'>
				{this.renderSpells()}
			</div>

		</div>
	}
});

module.exports = SpellRenderer;
