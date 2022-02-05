const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');

const StringArrayEditor = createClass({
	displayName     : 'StringArrayEditor',
	getDefaultProps : function() {
		return {
			label        : '',
			values       : [],
			valuePattern : null,
			canEdit      : null,
			onChange     : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			valueContext : !!this.props.values ? this.props.values.map((value)=>({
				value,
				editing : false
			})) : [],
			temporaryValue : '',
			updateValue    : ''
		};
	},

	componentDidUpdate : function(prevProps) {
		if(!_.eq(this.props, prevProps)) {
			this.setState({
				valueContext : !!this.props.values ? this.props.values.map((newValue)=>({
					value   : newValue,
					editing : this.state.valueContext.find(({ value })=>value === newValue)?.editing || false
				})) : []
			});
		}
	},

	handleChange : function(value) {
		this.props.onChange({
			target : {
				value
			}
		});
	},

	addValue : function(value){
		this.handleChange(_.uniq([...this.props.values, value]));
	},

	removeValue : function(value){
		this.handleChange(this.props.values.filter((v)=>v !== value));
	},

	updateValue : function(value, index){
		const values = this.props.values;
		values[index] = value;
		this.handleChange(values);
	},

	editValue : function(index){
		if(!!this.props.canEdit && !this.props.canEdit(this.props.values[index])) {
			return;
		}
		const valueContext = this.state.valueContext.map((context, i)=>{
			context.editing = index === i;
			return context;
		});
		this.setState({ valueContext, updateValue: this.props.values[index] });
	},

	handleValueInputKeyDown : function(event, index) {
		if(event.key === 'Enter') {
			if(!this.props.valuePattern || !!event.target.value.match(this.props.valuePattern)) {
				if(!!index) {
					this.updateValue(event.target.value, index);
					const valueContext = this.state.valueContext;
					valueContext[index].editing = false;
					this.setState({ valueContext, updateValue: '' });
				} else {
					this.addValue(event.target.value);
					this.setState({ temporaryValue: '' });
				}
			}
		} else if(event.key === 'Escape') {
			const valueContext = this.state.valueContext;
			valueContext[index].editing = false;
			this.setState({ valueContext, updateValue: '' });
		}
	},

	closeEditor : function(index) {
		const valueContext = this.state.valueContext;
		valueContext[index].editing = false;
		this.setState({ valueContext, updateValue: '' });
	},

	render : function() {
		const valueElements = Object.values(this.state.valueContext).map((context, i)=>context.editing
			? <input type='text' className='value' autoFocus
					 value={this.state.updateValue}
					 key={i}
					 onKeyDown={(e)=>this.handleValueInputKeyDown(e, i)}
					 onChange={(e)=>this.setState({ updateValue: e.target.value })}
					 onBlur={(_)=>this.closeEditor(i)}/>
			: <div className='badge' key={i} onClick={()=>{ this.editValue(i); }}>{context.value}&nbsp;
				<i className='fa fa-times' onClick={()=>this.removeValue(context.value)}/>
			</div>
		);

		return <div className='field values'>
			<label>{this.props.label}</label>
			<div className='list'>
				{valueElements}
				<input type='text' className='value'
					   value={this.state.temporaryValue}
					   onKeyDown={(e)=>this.handleValueInputKeyDown(e)}
					   onChange={(e)=>this.setState({ temporaryValue: e.target.value })}/>
			</div>
		</div>;
	}
});

module.exports = StringArrayEditor;