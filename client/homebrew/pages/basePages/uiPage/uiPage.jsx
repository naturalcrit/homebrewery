require('./uiPage.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');
const NewBrewItem = require('../../../navbar/newBrew.jsx');
const HelpNavItem = require('../../../navbar/help.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;
const Account = require('../../../navbar/account.navitem.jsx');


const UIPage = createClass({
	displayName : 'UIPage',

	render : function(){
		return <div className='uiPage sitePage'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<NewBrewItem />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
});

module.exports = UIPage;
