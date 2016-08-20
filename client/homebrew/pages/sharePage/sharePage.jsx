var React = require('react');
var _ = require('lodash');
var cx = require('classnames');

var Nav = require('naturalcrit/nav/nav.jsx');
var Navbar = require('../../navbar/navbar.jsx');
var PrintLink = require('../../navbar/print.navitem.jsx');
var RecentlyViewed = require('../../navbar/recent.navitem.jsx').viewed;

var BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

var HijackPrint = require('../hijackPrint.js');

var SharePage = React.createClass({
	getDefaultProps: function() {
		return {
			ver : '0.0.0',
			brew : {
				title : '',
				text : '',
				shareId : null,
				createdAt : null,
				updatedAt : null,
				views : 0
			}
		};
	},

	componentDidMount: function() {
		document.onkeydown = HijackPrint(this.props.brew.shareId);
	},
	componentWillUnmount: function() {
		document.onkeydown = function(){};
	},

	render : function(){
		return <div className='sharePage page'>
			<Navbar ver={this.props.ver}>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<RecentlyViewed brew={this.props.brew} />
					<PrintLink shareId={this.props.brew.shareId} />
					<Nav.item href={'/source/' + this.props.brew.shareId} color='teal' icon='fa-code'>
						source
					</Nav.item>
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.props.brew.text} />
			</div>
		</div>
	}
});

module.exports = SharePage;
