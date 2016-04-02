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

		if(_.isObject(val)){
			this.props.onChange({
				[this.id()] : _.extend({}, this.data(), val)
			});
		}else{
			this.props.onChange({
				[this.id()] : val
			});
		}
	}
}