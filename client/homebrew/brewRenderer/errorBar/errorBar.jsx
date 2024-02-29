require('./errorBar.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const translateOpts = ['htmlError'];

const ErrorBar = createClass({
	displayName     : 'ErrorBar',
	getDefaultProps : function() {
		return {
			errors : []
		};
	},

	hasOpenError  : false,
	hasCloseError : false,
	hasMatchError : false,

	renderErrors : function(){
		this.hasOpenError = false;
		this.hasCloseError = false;
		this.hasMatchError = false;


		const errors = _.map(this.props.errors, (err, idx)=>{
			if(err.id == 'OPEN') this.hasOpenError = true;
			if(err.id == 'CLOSE') this.hasCloseError = true;
			if(err.id == 'MISMATCH') this.hasMatchError = true;
			return <li key={idx}>
				{'Line'.translate()} {err.line} : {err.text}, '{err.type}' {'tag'.translate()}
			</li>;
		});

		return <ul>{errors}</ul>;
	},

	renderProtip : function(){
		const msg = [];
		if(this.hasOpenError){
			msg.push(<div>
				{'openTag'.translate()}
			</div>);
		}

		if(this.hasCloseError){
			msg.push(<div>
				{'closeTag'.translate()}
			</div>);
		}

		if(this.hasMatchError){
			msg.push(<div>
				{'missmatchTag'.translate()}
			</div>);
		}
		return <div className='protips'>
			<h4>{'Protips!'.translate()}</h4>
			{msg}
		</div>;
	},

	render : function(){
		''.setTranslationDefaults(translateOpts);
		if(!this.props.errors.length) return null;

		return <div className='errorBar'>
			<i className='fas fa-exclamation-triangle' />
			<h3> {'h3Title'.translate()}</h3>
			<small>{'descriptionText'.translate()}</small>
			{this.renderErrors()}
			<hr />
			{this.renderProtip()}
		</div>;
	}
});

module.exports = ErrorBar;
