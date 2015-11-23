var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var JSONFileEditor = require('naturalCrit/jsonFileEditor/jsonFileEditor.jsx');

var Encounters = React.createClass({
	getDefaultProps: function() {
		return {
			encounters : [],
			selectedEncounter : 0,

			onJSONChange : function(encounterIndex, json){},
			onSelectEncounter : function(encounterIndex){},
			onRemoveEncounter : function(encounterIndex){}
		};
	},

	handleJSONChange : function(encounterIndex, json){
		this.props.onJSONChange(encounterIndex, json);
	},
	handleSelectEncounter : function(encounterIndex){
		this.props.onSelectEncounter(encounterIndex);
	},
	handleRemoveEncounter : function(encounterIndex){
		this.props.onRemoveEncounter(encounterIndex);
	},


	renderEncounters : function(){
		var self = this;
		return _.map(this.props.encounters, function(encounter, index){

			var isSelected = self.props.selectedEncounter == index;
			return <div className={cx('encounter' , {'selected' : isSelected})} key={index}>

				<i onClick={self.handleSelectEncounter.bind(self, index)} className={cx('select', 'fa', {
					'fa-square-o' : !isSelected,
					'fa-check-square-o' : isSelected,
				})} />


				<JSONFileEditor
					name={encounter.name}
					json={encounter}
					onJSONChange={self.handleJSONChange.bind(self, index)}
				/>

				<i onClick={self.handleRemoveEncounter.bind(self, index)} className='remove fa fa-times' />
			</div>
		})
	},

	render : function(){
		var self = this;
		return(
			<div className='encounters'>
				<h3>
					<i className='fa fa-flag' /> Encounters
					<button className='addEncounter'>
						<i className='fa fa-plus' />
					</button>
				</h3>
				{this.renderEncounters()}

				<div className='controls'>

				</div>
			</div>
		);
	}
});

module.exports = Encounters;
