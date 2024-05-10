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

	componentDidMount : function() {
		this.newTagInput = React.createRef();
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
		if(_.includes(['Enter', ','], event.key)) {
			event.stopPropagation();
			event.preventDefault();
			if(this.valueIsValid(event.target.value, index)) {
				if(index !== undefined) {
					this.updateValue(event.target.value, index);
				} else {
					this.addValue(event.target.value);
				}
			}
			this.newTagInput.current.focus();
		} else if(event.key === 'Escape' && index) {
			this.closeEditInput(index);
			event.target.parentNode.focus();
		} else if(event.key === 'ArrowLeft' && event.target.value.length === 0){
			event.target.previousElementSibling?.focus();
		}
	},

	closeEditInput : function(index) {
		const valueContext = this.state.valueContext;
		valueContext[index].editing = false;
		this.setState({ valueContext, updateValue: '' });
	},

	handleTagKeyDown : function(event, index) {
		if(_.includes(['Enter', 'Space'], event.code)){
			event.preventDefault();
			this.editValue(index);
			setTimeout(()=>{
				event.target.querySelector('input').focus();
			}, 0);
		} else if(_.includes(['Delete'], event.key)){
			this.removeValue(index);
		} else if(_.includes(['ArrowLeft'], event.key)){
			event.target.previousElementSibling?.focus();
		} else if(_.includes(['ArrowRight'], event.key)){
			event.target.nextElementSibling?.focus();
		}


	},

	render : function() {
		const valueElements = Object.values(this.state.valueContext).map((context, i)=>{
			return <React.Fragment key={i}>
				<div className={`tag ${context.editing ? 'editable' : ''}`} tabIndex={0} onKeyDown={(e)=>this.handleTagKeyDown(e, i)}>
					<span className={`tag-text ${context.editing ? 'hidden' : 'visible'}`} key={i} onClick={()=>this.editValue(i)}>{context.value}</span>
					<input type='text' className={`value tag-input ${context.editing ? 'visible' : 'hidden'} ${this.valueIsValid(this.state.updateValue, i) ? '' : 'invalid'}`} placeholder={this.props.placeholder}
						value={this.state.updateValue}
						onKeyDown={(e)=>this.handleValueInputKeyDown(e, i)}
						onChange={(e)=>this.setState({ updateValue: e.target.value })}
						onBlur={()=>this.closeEditInput(i)}
						list='tags_precoordinated'/>
					<datalist id='tags_precoordinated'>
						<option value='type:Map'></option>
						<option value='type:NPC'></option>
						<option value='meta:Guide'></option>
						<option value='meta:Template'></option>
						<option value='meta:Theme'></option>
						<option value='system:D&amp;D 3.5e'></option>
						<option value='system:D&amp;D 4e'></option>
						<option value='system:D&amp;D 5e'></option>
						<option value='system:PathFinder'></option>
					</datalist>
					{!!this.props.cannotEdit && this.props.cannotEdit.includes(context.value) ? null : <button className='tag-icon' onClick={(e)=>{ e.stopPropagation(); this.removeValue(i); }} tabIndex={-1}><i className='fa fa-times fa-fw'/></button>}
				</div>
			</React.Fragment>;
		});

		return <div className='field'>
			<label>{this.props.label}</label>
			<div style={{ flex: '1 0' }}>
				<div className='tag-container'>
					{valueElements}
					<input type='text' className={`value ${this.valueIsValid(this.state.temporaryValue) ? '' : 'invalid'}`} placeholder={this.props.placeholder}
						value={this.state.temporaryValue}
						onKeyDown={(e)=>this.handleValueInputKeyDown(e)}
						onChange={(e)=>this.setState({ temporaryValue: e.target.value })}
						list='tags_precoordinated'
						ref={this.newTagInput}/>
					<datalist id='tags_precoordinated'>
						<option value='type:Map'></option>
						<option value='type:NPC'></option>
						<option value='meta:Guide'></option>
						<option value='meta:Template'></option>
						<option value='meta:Theme'></option>
						<option value='system:D&amp;D 3.5e'></option>
						<option value='system:D&amp;D 4e'></option>
						<option value='system:D&amp;D 5e'></option>
						<option value='system:PathFinder'></option>
					</datalist>
				</div>

				{this.props.notes ? this.props.notes.map((n, index)=><p key={index}><small>{n}</small></p>) : null}
			</div>
		</div>;
	}
});

module.exports = StringArrayEditor;