const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const RecentlyViewed = require('../../navbar/recent.navitem.jsx').viewed;

const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');


const SharePage = React.createClass({
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
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		e.stopPropagation();
		e.preventDefault();
		const P_KEY = 80;
		if(e.keyCode == P_KEY) window.open(`/print/${this.props.brew.shareId}?dialog=true`, '_blank').focus();
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
