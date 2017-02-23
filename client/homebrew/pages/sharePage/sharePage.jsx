const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const ReportIssue = require('../../navbar/issue.navitem.jsx');
//const RecentlyViewed = require('../../navbar/recent.navitem.jsx').viewed;
const Account = require('../../navbar/account.navitem.jsx');

const BrewRenderer = require('homebrewery/brewRenderer/brewRenderer.jsx');
const Utils = require('homebrewery/utils.js');

const Actions = require('homebrewery/brew.actions.js');
const Store = require('homebrewery/brew.store.js');

const Headtags = require('vitreum/headtags');

const SharePage = React.createClass({
	componentDidMount: function() {
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : Utils.controlKeys({
		p : Actions.print
	}),

	renderMetatags : function(brew){
		let metatags = [
			<Headtags.meta key='site_name' property='og:site_name' content='Homebrewery'/>,
			<Headtags.meta key='type' property='og:type' content='article' />
		];
		if(brew.title){
			metatags.push(<Headtags.meta key='title' property='og:title' content={brew.title} />);
		}
		if(brew.description){
			metatags.push(<Headtags.meta key='description' name='description' content={brew.description} />);
		}
		if(brew.thumbnail){
			metatags.push(<Headtags.meta key='image' property='og:image' content={brew.thumbnail} />);
		}
		return metatags;
	},

	render : function(){
		const brew = Store.getBrew();
		return <div className='sharePage page'>
			{this.renderMetatags(brew)}

			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<ReportIssue />
					<PrintLink shareId={brew.shareId} />
					<Nav.item href={'/source/' + brew.shareId} color='teal' icon='fa-code'>
						source
					</Nav.item>
					<Account />
				</Nav.section>
			</Navbar>
			<div className='content'>
				<BrewRenderer brew={brew} />
			</div>
		</div>
	}
});

module.exports = SharePage;
