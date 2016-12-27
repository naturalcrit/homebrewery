const flux = require('pico-flux')
const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');

const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');

const onStoreChange = () => {
	return {
		status : Store.getStatus(),
		errors : Store.getErrors()
	}
};

const ContinousSave = React.createClass({
	getDefaultProps: function() {
		return {
			status : 'ready',
			errors : undefined
		};
	},
	componentDidMount: function() {
		flux.actionEmitter.on('dispatch', this.brewUpdate);
		window.onbeforeunload = ()=>{
			if(this.props.status !== 'ready') return 'You have unsaved changes!';
		};
	},
	componentWillUnmount: function() {
		flux.actionEmitter.removeListenr('dispatch', this.brewUpdate);
		window.onbeforeunload = function(){};
	},
	brewUpdate : function(actionType){
		if(actionType == 'UPDATE_BREW_TEXT' || actionType == 'UPDATE_META'){
			Actions.pendingSave();
		}
	},
	handleClick : function(){
		Actions.save();
	},
	renderError : function(){
		let errMsg = '';
		try{
			errMsg += this.state.errors.toString() + '\n\n';
			errMsg += '```\n' + JSON.stringify(this.state.errors.response.error, null, '  ') + '\n```';
		}catch(e){}

		return <Nav.item className='continousSave error' icon="fa-warning">
			Oops!
			<div className='errorContainer'>
				Looks like there was a problem saving. <br />
				Report the issue <a target='_blank' href={'https://github.com/stolksdorf/naturalcrit/issues/new?body='+ encodeURIComponent(errMsg)}>
					here
				</a>.
			</div>
		</Nav.item>
	},
	render : function(){
		if(this.props.status == 'error') return this.renderError();

		if(this.props.status == 'saving'){
			return <Nav.item className='continousSave' icon="fa-spinner fa-spin">saving...</Nav.item>
		}
		if(this.props.status == 'pending'){
			return <Nav.item className='continousSave' onClick={this.handleClick} color='blue' icon='fa-save'>Save Now</Nav.item>
		}
		if(this.props.status == 'ready'){
			return <Nav.item className='continousSave saved'>saved.</Nav.item>
		}
	},

});

module.exports = Store.createSmartComponent(ContinousSave, onStoreChange);