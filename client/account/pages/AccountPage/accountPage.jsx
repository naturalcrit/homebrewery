const React = require('react');
const createClass = require('create-react-class');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../homebrew/navbar/navbar.jsx');
const ReportIssue = require('../../../homebrew/navbar/issue.navitem.jsx');
const AccountNavItem = require('../../../homebrew/navbar/account.navitem.jsx');

const AccountPage = createClass({
	render : function(){
		return <div className='accountPage page'>
			<Navbar>
				<Nav.section>
					<ReportIssue />
					<AccountNavItem />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<div className='brewRenderer'>
					<div className='pages'>
						<div className='phb' id='p1'>
							<h1>Hello, {global.account.username}</h1>
						</div>
					</div>
				</div>
			</div>
		</div>;
	}
});

module.exports = AccountPage;
