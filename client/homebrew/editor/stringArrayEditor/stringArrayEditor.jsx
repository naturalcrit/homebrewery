const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');

const StringArrayEditor = createClass({
	displayName     : 'StringArrayEditor',
	getDefaultProps : function() {
		return {
			label         : '',
			values        : [],
			valuePatterns : null,
			validators    : [],
			placeholder   : '',
			notes         : [],
			unique        : false,
			cannotEdit    : [],
			onChange      : ()=>{}
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
		if(!_.eq(this.props.values, prevProps.values)) {
			this.setState({
				valueContext : this.props.values ? this.props.values.map((newValue)=>({
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
		this.setState({
			temporaryValue : ''
		});
	},

	removeValue : function(index){
		this.handleChange(this.props.values.filter((_, i)=>i !== index));
	},

	updateValue : function(value, index){
		const valueContext = this.state.valueContext;
		valueContext[index].value = value;
		valueContext[index].editing = false;
		this.handleChange(valueContext.map((context)=>context.value));
		this.setState({ valueContext, updateValue: '' });
	},

	editValue : function(index){
		if(!!this.props.cannotEdit && this.props.cannotEdit.includes(this.props.values[index])) {
			return;
		}
		const valueContext = this.state.valueContext.map((context, i)=>{
			context.editing = index === i;
			return context;
		});
		this.setState({ valueContext, updateValue: this.props.values[index] });
	},

	valueIsValid : function(value, index) {
		const values = _.clone(this.props.values);
		if(index !== undefined) {
			values.splice(index, 1);
		}
		const matchesPatterns = !this.props.valuePatterns || this.props.valuePatterns.some((pattern)=>!!(value || '').match(pattern));
		const uniqueIfSet = !this.props.unique || !values.includes(value);
		const passesValidators = !this.props.validators || this.props.validators.every((validator)=>validator(value));
		return matchesPatterns && uniqueIfSet && passesValidators;
	},

	handleValueInputKeyDown : function(event, index) {
		if(event.key === 'Enter') {
			if(this.valueIsValid(event.target.value, index)) {
				if(index !== undefined) {
					this.updateValue(event.target.value, index);
				} else {
					this.addValue(event.target.value);
				}
			}
		} else if(event.key === 'Escape') {
			this.closeEditInput(index);
		}
	},

	closeEditInput : function(index) {
		const valueContext = this.state.valueContext;
		valueContext[index].editing = false;
		this.setState({ valueContext, updateValue: '' });
	},

	render : function() {
		const valueElements = Object.values(this.state.valueContext).map((context, i)=>context.editing
			? <React.Fragment key={i}>
				<div className='input-group'>
					<input type='text' className={`value ${this.valueIsValid(this.state.updateValue, i) ? '' : 'invalid'}`} autoFocus placeholder={this.props.placeholder}
						value={this.state.updateValue}
						onKeyDown={(e)=>this.handleValueInputKeyDown(e, i)}
						onChange={(e)=>this.setState({ updateValue: e.target.value })}/>
					{<div className='icon steel' onClick={(e)=>{ e.stopPropagation(); this.closeEditInput(i); }}><i className='fa fa-undo fa-fw'/></div>}
					{this.valueIsValid(this.state.updateValue, i) ? <div className='icon steel'  onClick={(e)=>{ e.stopPropagation(); this.updateValue(this.state.updateValue, i); }}><i className='fa fa-check fa-fw'/></div> : null}
				</div>
			</React.Fragment>
			: <div className='badge' key={i} onClick={()=>this.editValue(i)}>{context.value}
				{!!this.props.cannotEdit && this.props.cannotEdit.includes(context.value) ? null : <div className='icon steel' onClick={(e)=>{ e.stopPropagation(); this.removeValue(i); }}><i className='fa fa-times fa-fw'/></div>}
			</div>
		);

		return <div className='field'>
			<label>{this.props.label}</label>
			<div style={{ flex: '1 0' }} className='value'>
				<div className='list'>
					{valueElements}
					<div className='input-group'>
						<input type='text' className={`value ${this.valueIsValid(this.state.temporaryValue) ? '' : 'invalid'}`} placeholder={this.props.placeholder}
							   value={this.state.temporaryValue}
							   onKeyDown={(e)=>this.handleValueInputKeyDown(e)}
							   onChange={(e)=>this.setState({ temporaryValue: e.target.value })}/>
						{this.valueIsValid(this.state.temporaryValue) ? <div className='icon steel' onClick={(e)=>{ e.stopPropagation(); this.addValue(this.state.temporaryValue); }}><i className='fa fa-check fa-fw'/></div> : null}
					</div>
				</div>

				{this.props.notes ? this.props.notes.map((n, index)=><p key={index}><small>{n}</small></p>) : null}
			</div>
		</div>;
	}
});

module.exports = StringArrayEditor;