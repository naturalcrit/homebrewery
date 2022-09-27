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
	displayName     : 'SharePage',
	getDefaultProps : function() {
		return {
			brew : {
				title     : '',
				text      : '',
				style     : '',
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
			window.open(`/print/${this.processShareId()}?dialog=true`, '_blank').focus();
			e.stopPropagation();
			e.preventDefault();
		}
	},

	processShareId : function() {
		return this.props.brew.googleId && !this.props.brew.stubbed ?
					 this.props.brew.googleId + this.props.brew.shareId :
					 this.props.brew.shareId;
	},

	render : function(){
		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					{this.props.brew.shareId && <>
						<PrintLink shareId={this.processShareId()} />
						<Nav.dropdown>
							<Nav.item color='red' icon='fas fa-code'>
								source
							</Nav.item>
							<Nav.item color='blue' href={`/source/${this.processShareId()}`}>
								view
							</Nav.item>
							<Nav.item color='blue' href={`/download/${this.processShareId()}`}>
								download
							</Nav.item>
							<Nav.item color='blue' href={`/new/${this.processShareId()}`}>
								clone to new
							</Nav.item>
						</Nav.dropdown>
					</>}
					<RecentNavItem brew={this.props.brew} storageKey='view' />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.props.brew.text} style={this.props.brew.style} renderer={this.props.brew.renderer} theme={this.props.brew.theme} />
			</div>
		</div>;
	}
});

module.exports = SharePage;
