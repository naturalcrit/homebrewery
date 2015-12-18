var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var JSONFileEditor = require('naturalCrit/jsonFileEditor/jsonFileEditor.jsx');

//var GetRandomEncounter = require('naturalCrit/randomEncounter.js');

var Store = require('naturalCrit/combat.store.js');
var Actions = require('naturalCrit/combat.actions.js');


var Encounters = React.createClass({
	mixins : [Store.mixin()],
	onStoreChange : function(){
		this.setState({
			encounters : Store.getEncounters(),
			selectedEncounter : Store.getSelectedEncounterIndex()
		});
	},
	getInitialState: function() {
		return {
			encounters : Store.getEncounters(),
			selectedEncounter : Store.getSelectedEncounterIndex()
		};
	},
	/*
	getDefaultProps: function() {
		return {
			encounters : [],
			selectedEncounter : 0,

			onJSONChange : function(encounterIndex, json){},
			onSelectEncounter : function(encounterIndex){},
			onRemoveEncounter : function(encounterIndex){}
		};
	},
	*/
	handleJSONChange : function(encounterIndex, json){
		//this.props.onJSONChange(encounterIndex, json);
		Actions.updateEncounter(encounterIndex, json);
	},
	handleSelectEncounter : function(encounterIndex){
		//this.props.onSelectEncounter(encounterIndex);
		Actions.selectEncounter(encounterIndex);
	},
	handleRemoveEncounter : function(encounterIndex){
		//this.props.onRemoveEncounter(encounterIndex);
		Actions.removeEncounter(encounterIndex);
	},
	addRandomEncounter : function(){
		Actions.addEncounter();
	},


	renderEncounters : function(){
		var self = this;
		return _.map(this.state.encounters, function(encounter, index){

			var isSelected = self.state.selectedEncounter == index;
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
						<i className='fa fa-plus' onClick={this.addRandomEncounter}/>
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
