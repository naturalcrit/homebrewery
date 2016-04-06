var _ = require('lodash');


module.exports = {
	id : function(){
		if(this.props.id) return this.props.id;
		if(this.props.label) return _.snakeCase(this.props.label);
		if(this.props.title) return _.snakeCase(this.props.title);
		return this.props.name;
	},
	data : function(){
		if(!this.id()) return this.props.data || this.props.defaultData;
		if(this.props.data && this.props.data[this.id()]) return this.props.data[this.id()];
		return this.props.defaultData;
	},
	updateData : function(val){
		if(typeof this.props.onChange !== 'function') throw "No onChange handler set";

		var newVal = val;

		//Clone the data if it's an object to avoid mutation bugs
		if(_.isObject(val)) newVal = _.extend({}, this.data(), val);

		if(this.id()){
			this.props.onChange({
				[this.id()] : newVal
			});
		}else{
			//If the box has no id, don't add it to the chain
			this.props.onChange(newVal)
		}
	}
}