require('./sharePage.less');
const React = require('react');
const createClass = require('create-react-class');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');


const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');


const SharePage = createClass({
	getDefaultProps : function() {
		return {
			brew : {
				title     : '',
				text      : '',
				shareId   : null,
				createdAt : null,
				updatedAt : null,
				views     : 0,
				renderer  : ''
			}
		};
	},

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode == P_KEY){
			window.open(`/print/${this.props.brew.shareId}?dialog=true`, '_blank').focus();
			e.stopPropagation();
			e.preventDefault();
		}
	},

	processShareId : function() {
		return this.props.brew.googleId ?
					 this.props.brew.googleId + this.props.brew.shareId :
					 this.props.brew.shareId;
	},

	render : function(){
		return <div className='sharePage page'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<PrintLink shareId={this.processShareId()} />
					<Nav.item href={`/source/${this.processShareId()}`} color='teal' icon='fas fa-code'>
						source
					</Nav.item>
					<RecentNavItem brew={this.props.brew} storageKey='view' />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.props.brew.text} renderer={this.props.brew.renderer} />
			</div>
		</div>;
	}
});

module.exports = SharePage;
