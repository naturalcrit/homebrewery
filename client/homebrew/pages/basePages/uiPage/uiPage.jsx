require('./uiPage.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('client/homebrew/navbar/nav.jsx');
const Navbar = require('client/homebrew/navbar/navbar.jsx');
const NewBrewItem = require('client/homebrew/navbar/newbrew.navitem.jsx');
const HelpNavItem = require('client/homebrew/navbar/help.navitem.jsx');
const RecentNavItem = require('client/homebrew/navbar/recent.navitem.jsx').both;
const Account = require('client/homebrew/navbar/account.navitem.jsx');


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
