const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const BrewItem = require('./brewItem/brewItem.jsx');

const UserPage = React.createClass({
	getDefaultProps: function() {
		return {
			username : '',
			brews : []
		};
	},

	renderBrews : function(brews){
		return _.map(brews, (brew, idx) => {
			return <BrewItem brew={brew} key={idx}/>
		});
	},

	getSortedBrews : function(){
		return _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private')
		});
	},

	render : function(){
		const brews = this.getSortedBrews();


		return <div className='userPage page'>
			<Navbar>
				<Nav.section>
					<RecentNavItem.both />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<div className='phb'>
					<h1>{this.props.username}'s brews</h1>
					{this.renderBrews(brews.published)}
					{brews.private ? <h1>{this.props.username}'s unpublished brews</h1> : null}
					{this.renderBrews(brews.private)}
				</div>
			</div>
		</div>
	}
});

module.exports = UserPage;
