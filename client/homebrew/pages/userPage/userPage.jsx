require('./userPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const BrewItem = require('./brewItem/brewItem.jsx');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const UserPage = createClass({
	getDefaultProps : function() {
		return {
			username    : '',
			brews       : [],
			googleBrews : []
		};
	},

	renderBrews : function(brews){
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		const sortedBrews = _.sortBy(brews, (brew)=>{ return brew.title; });

		return _.map(sortedBrews, (brew, idx)=>{
			return <BrewItem brew={brew} key={idx}/>;
		});
	},

	getSortedBrews : function(){
		return _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private');
		});
	},

	render : function(){
		const brews = this.getSortedBrews();

		return <div className='userPage page'>
			<Navbar>
				<Nav.section>
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<div className='phb'>
					<div>
						<h1>{this.props.username}'s brews</h1>
						{this.renderBrews(brews.published)}
					</div>
					<div>
						<h1>{this.props.username}'s unpublished brews</h1>
						{this.renderBrews(brews.private)}
					</div>
				</div>
			</div>
		</div>;
	}
});

module.exports = UserPage;
