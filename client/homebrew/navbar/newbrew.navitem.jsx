const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

const NewBrew = createClass({

	getInitialState : function() {
		return {
			url : ''
		};
	},

	componentDidMount : function(){
		if(typeof window !== 'undefined'){
			this.setState({
				url : window.location.href
			});
		}
	},

	render : function(){
		if(global.account){
			return <Nav.item href='/new' color='purple' icon='fa-plus-square'>
				new
			</Nav.item>;
		}

		return;
	}
});

module.exports = NewBrew;
