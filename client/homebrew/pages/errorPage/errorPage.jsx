var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');
var PatreonNavItem = require('../../navbar/patreon.navitem.jsx');
var IssueNavItem = require('../../navbar/issue.navitem.jsx');
var RecentNavItem = require('../../navbar/recent.navitem.jsx');

var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

var ErrorPage = React.createClass({
	getDefaultProps: function() {
		return {
			ver : '0.0.0',
			errorId: ''
		};
	},

	text : '# Oops \n We could not find a brew with that id. **Sorry!**',

	render : function(){
		return <div className='errorPage page'>
			<Navbar ver={this.props.ver}>
				<Nav.section>
					<Nav.item className='errorTitle'>
						Crit Fail!
					</Nav.item>
				</Nav.section>

				<Nav.section>
					<PatreonNavItem />
					<IssueNavItem />
					<RecentNavItem.both errorId={this.props.errorId} />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.text} />
			</div>
		</div>
	}
});

module.exports = ErrorPage;
