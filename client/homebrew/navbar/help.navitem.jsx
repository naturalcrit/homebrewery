const React = require('react');
const createClass = require('create-react-class');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');

const Help = createClass({

	getInitialState : function() {
		return {
			showDropdown : false
		};
	},

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		});
	},

	renderDropdown : function(){
		return !this.state.showDropdown ? null : <div className='dropdown'>
			<a href={`https://www.reddit.com/r/homebrewery/submit?selftext=true&title=${encodeURIComponent('[Issue] Describe Your Issue Here')}`}
				className='item red'
				target='_blank'
				rel='noopener noreferrer'>
				<span className='title'>report issue <i className='fas fa-fw fa-bug'/></span>
			</a>
			<a href='/migrate'
				className='item blue'
				target='_blank'
				rel='noopener noreferrer'>
				<span className='title'>migrate <i className='fas fa-fw fa-route'/></span>
			</a>
		</div>;
	},

	render : function(){
		return <Nav.item icon='fas fa-life-ring' color='grey' className='recent'
			onMouseEnter={()=>this.handleDropdown(true)}
			onMouseLeave={()=>this.handleDropdown(false)}>
			Need Help?
			{this.renderDropdown()}
		</Nav.item>;
	}

});

module.exports = Help;
