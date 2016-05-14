var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Sorter = React.createClass({
	getDefaultProps: function() {
		return {
			spells : []
		};
	},


	renderSpell : function(spell){
		return <div className='spell' key={spell.id}>
			{spell.name}
		</div>
	},

	renderSpells : function(){
		return _.map(this.props.spells, (spell)=>{
			return this.renderSpell(spell)
		});
	},

	render : function(){
		return <div className='sorter'>
			{this.renderSpells()}
		</div>
	}
});

module.exports = Sorter;
