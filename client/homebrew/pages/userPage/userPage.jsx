const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const ListPage = require('../basePages/listPage/listPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const UserPage = createClass({
	displayName     : 'UserPage',
	getDefaultProps : function() {
		return {
			username : '',
			brews    : [],
			query    : ''
		};
	},
	getInitialState : function() {
		const usernameWithS = this.props.username + (this.props.username.endsWith('s') ? `'` : `'s`);

		const brews = _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private');
		});

		const brewCollection = [
			{
				title : `${usernameWithS} published brews`,
				class : 'published',
				brews : brews.published
			}
		];
		if(this.props.username == global.account?.username){
			brewCollection.push(
				{
					title : `${usernameWithS} unpublished brews`,
					class : 'unpublished',
					brews : brews.private
				}
			);
		}

		return {
			brewCollection : brewCollection
		};
	},

	navItems : function() {
		return <Navbar>
			<Nav.section>
				<NewBrew />
				<HelpNavItem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <ListPage brewCollection={this.state.brewCollection} navItems={this.navItems()} query={this.props.query}></ListPage>;
	}
});

module.exports = UserPage;
