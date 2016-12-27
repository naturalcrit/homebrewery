const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const PatreonNavItem = require('../../navbar/patreon.navitem.jsx');
const IssueNavItem = require('../../navbar/issue.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx');
const AccountNavItem = require('../../navbar/account.navitem.jsx');


const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');


const Actions = require('homebrewery/brew.actions.js');
//const Store = require('homebrewery/brew.store.js');


const HomePage = React.createClass({
	getDefaultProps: function() {
		return {
			welcomeText : '',
		};
	},
	componentWillMount: function() {
		Actions.init({
			brew : {
				text : this.props.welcomeText
			}
		});
	},

	handleSave : function(){
		Actions.saveNew();
	},

	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<PatreonNavItem />
				<IssueNavItem />
				<Nav.item newTab={true} href='/changelog' color='purple' icon='fa-file-text-o'>
					Changelog
				</Nav.item>
				<RecentNavItem.both />
				<AccountNavItem />
				{/*}
				<Nav.item href='/new' color='green' icon='fa-external-link'>
					New Brew
				</Nav.item>
				*/}
			</Nav.section>
		</Navbar>
	},

	render : function(){
		return <div className='homePage page'>
			{this.renderNavbar()}
			<div className='content'>
				<BrewInterface />
			</div>

			<div className={cx('floatingSaveButton', {
				//show : Store.getBrewText() !== this.props.welcomeText
			})} onClick={this.handleSave}>
				Save current <i className='fa fa-save' />
			</div>

			<a href='/new' className='floatingNewButton'>
				Create your own <i className='fa fa-magic' />
			</a>
		</div>
	}
});

module.exports = HomePage;
