const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const ReportIssue = require('../../navbar/issue.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const Save = require('../../navbar/continousSave.navitem.jsx');

const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');
const Utils = require('homebrewery/utils.js');

const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');


const EditPage = React.createClass({
	componentDidMount: function(){
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : Utils.controlKeys({
		s : Actions.save,
		p : Actions.print
	}),
	render : function(){
		return <div className='editPage page'>
			<SmartNav />
			<div className='content'>
				<BrewInterface />
			</div>
		</div>
	}
});

const SmartNav = Store.createSmartComponent(React.createClass({
	getDefaultProps: function() {
		return {
			brew : {}
		};
	},
	render : function(){
		return <Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
			</Nav.section>
			<Nav.section>
				<Save />
				<ReportIssue />
				<Nav.item newTab={true} href={'/share/' + this.props.brew.shareId} color='teal' icon='fa-share-alt'>
					Share
				</Nav.item>
				<PrintLink shareId={this.props.brew.shareId} />
				<Account />
			</Nav.section>
		</Navbar>
	}
}), ()=>{
	return {brew : Store.getBrew()}
});

module.exports = EditPage;
