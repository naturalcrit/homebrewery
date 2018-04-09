const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const ErrorBar = createClass({
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
				Line {err.line} : {err.text}, '{err.type}' tag
			</li>;
		});

		return <ul>{errors}</ul>;
	},

	renderProtip : function(){
		const msg = [];
		if(this.hasOpenError){
			msg.push(<div>
				An unmatched opening tag means there's an opened tag that isn't closed, you need to close a tag, like this {'</div>'}. Make sure to match types!
			</div>);
		}

		if(this.hasCloseError){
			msg.push(<div>
				An unmatched closing tag means you closed a tag without opening it. Either remove it, you check to where you think you opened it.
			</div>);
		}

		if(this.hasMatchError){
			msg.push(<div>
				A type mismatch means you closed a tag, but the last open tag was a different type.
			</div>);
		}
		return <div className='protips'>
			<h4>Protips!</h4>
			{msg}
		</div>;
	},

	render : function(){
		if(!this.props.errors.length) return null;

		return <div className='errorBar'>
			<i className='fa fa-exclamation-triangle' />
			<h3> There are HTML errors in your markup</h3>
			<small>If these aren't fixed your brew will not render properly when you print it to PDF or share it</small>
			{this.renderErrors()}
			<hr />
			{this.renderProtip()}
		</div>;
	}
});

module.exports = ErrorBar;
