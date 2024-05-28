const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const StringArrayEditor = createClass({
	displayName     : 'StringArrayEditor',
	getDefaultProps : function() {
		return {
			id               : '',
			label            : '',
			values           : [],
			options          : [],
			valuePatterns    : null,
			validators       : [],
			modifySubmission : (value)=>{ return value; },
			placeholder      : '',
			notes            : [],
			unique           : false,
			cannotEdit       : [],
			onChange         : ()=>{}
		};
	},

	getInitialState : function() {
		return {
			valueContext : !!this.props.values ? this.props.values.map((value, i)=>({
				value,
				editing  : false,
				inputRef : React.createRef()
			})) : [],
			temporaryValue : '',
			updateValue    : ''
		};
	},

	componentDidUpdate : function(prevProps) {
		if(!_.eq(this.props.values, prevProps.values)) {
			this.setState({
				valueContext : this.props.values ? this.props.values.map((newValue, i)=>({
					value    : newValue,
					editing  : this.state.valueContext.find(({ value })=>value === newValue)?.editing || false,
					inputRef : this.state.valueContext[i]?.inputRef || React.createRef()
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

	addValue : function(value) {
		this.handleChange(_.uniq([...this.props.values, this.props.modifySubmission(value)]));
		this.setState({
			temporaryValue : ''
		});
	},

	removeValue : function(index) {
		this.handleChange(this.props.values.filter((_, i)=>i !== index));
		this.newTagInput.current.focus();
	},

	updateValue : function(value, index) {
		const valueContext = this.state.valueContext;
		valueContext[index].value = this.props.modifySubmission(value);
		valueContext[index].editing = false;
		this.handleChange(valueContext.map((context)=>context.value));
		this.setState({ valueContext, updateValue: '' });
	},

	editValue : function(index) {
		if(!!this.props.cannotEdit && this.props.cannotEdit.includes(this.props.values[index])) {
			return;
		}
		const valueContext = this.state.valueContext.map((context, i)=>{
			context.editing = index === i;
			return context;
		});
		this.setState({ valueContext, updateValue: this.props.values[index] }, ()=>{
			valueContext[index].inputRef.current.focus();
		});
	},

	valueIsValid : function(value, index) {
		const values = _.clone(this.props.values);
		if(index !== undefined) {
			values.splice(index, 1);
		}
		const matchesPatterns = !this.props.valuePatterns || this.props.valuePatterns.some((pattern)=>!!(value || '').match(pattern));
		const uniqueIfSet = !this.props.unique || !values.includes(value.trim());
		const passesValidators = !this.props.validators || this.props.validators.every((validator)=>validator(value));
		return matchesPatterns && uniqueIfSet && passesValidators;
	},

	handleValueInputKeyDown : function(event, index) {
		event.stopPropagation();
		if(_.includes(['Enter', ','], event.key)) {
			event.preventDefault();
			if(this.valueIsValid(event.target.value.trim(), index)) {
				if(index !== undefined) {
					this.updateValue(event.target.value.trim(), index);
				} else {
					this.addValue(event.target.value.trim());
				}
			} else if(event.target.value.length == 0) {
				this.removeValue(index);
			}
			this.newTagInput.current.focus();
		} else if(event.key === 'Escape' && index) {
			this.closeEditInput(index);
			event.target.parentNode.focus();
		} else if(event.key === 'ArrowLeft' && event.target.value.length === 0) {
			event.target.previousElementSibling?.focus();
		}
	},

	closeEditInput : function(index) {
		const valueContext = this.state.valueContext;
		valueContext[index].editing = false;
		this.setState({ valueContext, updateValue: '' });
	},

	handleTagKeyDown : function(event, index) {
		if(_.includes(['Enter', 'Space'], event.code)) {
			event.preventDefault();
			this.editValue(event, index);
		} else if(_.includes(['Delete'], event.key)) {
			this.removeValue(index);
		} else if(_.includes(['ArrowLeft'], event.key)) {
			event.target.previousElementSibling?.focus();
		} else if(_.includes(['ArrowRight'], event.key)) {
			event.target.nextElementSibling?.focus();
		}
	},

	renderDatalist : function() {
		if(this.props.options?.length > 0) {
			return <datalist id={`${this.props.id}__tags-precoordinated`}>
				{this.props.options.map((option)=>{
					return <option key={`${option}`} value={`${option}`}></option>;
				})}
			</datalist>;
		}
	},

	render : function() {
		const valueElements = this.state.valueContext.map((context, i)=>{
			return (
				<React.Fragment key={i}>
					<div aria-label={`tag ${context.value}`} className={`tag ${context.editing ? 'editable' : ''}`} tabIndex={-1} onKeyDown={(e)=>this.handleTagKeyDown(e, i)}>
						<span className={`tag-text ${context.editing ? 'hidden' : 'visible'}`} key={i} onClickCapture={()=>this.editValue(i)}>{context.value}</span>
						<input type='text' ref={context.inputRef} className={`value tag-input ${context.editing ? 'visible' : 'hidden'} ${this.valueIsValid(this.state.updateValue, i) || (this.state.updateValue == '') ? '' : 'invalid'}`}
							placeholder={this.props.placeholder}
							value={this.state.updateValue}
							onKeyDown={(e)=>this.handleValueInputKeyDown(e, i)}
							onChange={(e)=>this.setState({ updateValue: e.target.value })}
							onBlur={()=>this.closeEditInput(i)}
							list={this.props.options?.length > 0 ? `${this.props.id}__tags-precoordinated` : ''} />
						{this.renderDatalist()}
						{!!this.props.cannotEdit && this.props.cannotEdit.includes(context.value) ? null : <button className='tag-icon' onClick={(e)=>{ e.stopPropagation(); this.removeValue(i); }} tabIndex={-1} aria-label={`delete tag ${context.value}`} aria-keyshortcuts='Delete'><i className='fa fa-times fa-fw' /></button>}
					</div>
				</React.Fragment>
			);
		});

		return (
			<div className='field'>
				<label htmlFor={`${this.props.label}-input`}>{this.props.label}</label>
				<div id={`${this.props.label}-container`} role='presentation' className='value'>
					<div className='tag-container'>
						{valueElements}
						<input type='text' id={`${this.props.label}-input`} className={`value ${this.valueIsValid(this.state.temporaryValue) || (this.state.temporaryValue == '') ? '' : 'invalid'}`}
							placeholder={this.props.placeholder}
							value={this.state.temporaryValue}
							onKeyDown={(e)=>this.handleValueInputKeyDown(e)}
							onChange={(e)=>this.setState({ temporaryValue: e.target.value })}
							list={this.props.options?.length > 0 ? `${this.props.id}__tags-precoordinated` : ''}
							ref={this.newTagInput} />
						{this.renderDatalist()}
					</div>

					{this.props.notes ? this.props.notes.map((n, index)=><p key={index}><small>{n}</small></p>) : null}
				</div>
			</div>
		);
	}
});

module.exports = StringArrayEditor;
