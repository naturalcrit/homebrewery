const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');

const StaticSave = React.createClass({
	getDefaultProps: function() {
		return {
			status : 'ready'
		};
	},
	handleClick : function(){
		Actions.create();
	},
	render : function(){
		if(this.props.status === 'saving'){
			return <Nav.item icon='fa-spinner fa-spin' className='staticSave'>
				save...
			</Nav.item>
		}
		if(this.props.status === 'ready'){
			return <Nav.item icon='fa-save' className='staticSave' onClick={this.handleClick}>
				save
			</Nav.item>
		}
	}
});


module.exports = Store.createSmartComponent(StaticSave, ()=>{
	return {
		status : Store.getStatus()
	}
});