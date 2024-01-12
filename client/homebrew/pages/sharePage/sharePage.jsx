require('./sharePage.less');
const React = require('react');
const createClass = require('create-react-class');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const MetadataNav = require('../../navbar/metadata.navitem.jsx');
const PrintLink = require('../../navbar/print.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');


const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');

const translateOpts = ['sharePage','sourceDropdown']

const SharePage = createClass({
	displayName     : 'SharePage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
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
		''.setTranslationDefaults(translateOpts);
		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section className='titleSection'>
					<MetadataNav brew={this.props.brew}>
						<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
					</MetadataNav>
				</Nav.section>

				<Nav.section>
					{this.props.brew.shareId && <>
						<PrintLink shareId={this.processShareId()} />
						<Nav.dropdown>
							<Nav.item color='red' icon='fas fa-code'>
								{'source'.translate()}
							</Nav.item>
							<Nav.item color='blue' href={`/source/${this.processShareId()}`}>
								{'view'.translate()}
							</Nav.item>
							<Nav.item color='blue' href={`/download/${this.processShareId()}`}>
								{'download'.translate()}
							</Nav.item>
							<Nav.item color='blue' href={`/new/${this.processShareId()}`}>
								{'clone to new'.translate()}
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
