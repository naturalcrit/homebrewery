require('./userPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const BrewItem = require('./brewItem/brewItem.jsx');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const UserPage = createClass({
	getDefaultProps : function() {
		return {
			username : '',
			pageType : 'user',
			brews    : []
		};
	},
	getUsernameWithS : function() {
		if(this.props.username.endsWith('s'))
			return `${this.props.username}'`;
		return `${this.props.username}'s`;
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

	getContent : function(){
		if(this.props.pageType == 'user'){
			const brews = this.getSortedBrews();
			return <>
				<div>
					<h1>{this.getUsernameWithS()} brews</h1>
					{this.renderBrews(brews.published)}
				</div>
				{this.props.username == global.account.username &&
					<div>
						<h1>{this.getUsernameWithS()} unpublished brews</h1>
						{this.renderBrews(brews.private)}
					</div>
				}
			</>;
		};
		if(this.props.pageType == 'liked'){
			return <>
				<div>
					<h1>{this.getUsernameWithS()} liked brews</h1>
					{this.renderBrews(this.props.brews)}
				</div>
			</>;
		}
	},

	render : function(){
		return <div className='userPage sitePage'>
			<Navbar>
				<Nav.section>
					<NewBrew />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content V3'>
				<div className='phb'>
					{this.getContent()}
				</div>
			</div>
		</div>;
	}
});

module.exports = UserPage;
