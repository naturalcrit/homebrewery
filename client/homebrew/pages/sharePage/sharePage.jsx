require('./sharePage.less');
const React = require('react');
const createClass = require('create-react-class');
const { Meta } = require('vitreum/headtags');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const MetadataNav = require('../../navbar/metadata.navitem.jsx');
const PrintNavItem = require('../../navbar/print.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const BrewRenderer = require('../../brewRenderer/brewRenderer.jsx');

const { DEFAULT_BREW_LOAD } = require('../../../../server/brewDefaults.js');
const { printCurrentBrew, fetchThemeBundle } = require('../../../../shared/helpers.js');

const SharePage = createClass({
	displayName     : 'SharePage',
	getDefaultProps : function() {
		return {
			brew        : DEFAULT_BREW_LOAD,
			disableMeta : false
		};
	},

	getInitialState : function() {
		return {
			themeBundle : {}
		};
	},

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);

		if(this.props.brew.renderer || this.props.brew.theme){
			fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);
		}
	},

	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode == P_KEY){
			if(e.keyCode == P_KEY) printCurrentBrew();
			e.stopPropagation();
			e.preventDefault();
		}
	},

	processShareId : function() {
		return this.props.brew.googleId && !this.props.brew.stubbed ?
					 this.props.brew.googleId + this.props.brew.shareId :
					 this.props.brew.shareId;
	},

	renderEditLink : function(){
		if(!this.props.brew.editId) return;

		let editLink = this.props.brew.editId;
		if(this.props.brew.googleId && !this.props.brew.stubbed) {
			editLink = this.props.brew.googleId + editLink;
		}

		return 	<Nav.item color='orange' icon='fas fa-pencil-alt' href={`/edit/${editLink}`}>
					edit
		</Nav.item>;
	},

	render : function(){
		const titleStyle = this.props.disableMeta ? { cursor: 'default' } : {};
		const titleEl = <Nav.item className='brewTitle' style={titleStyle}>{this.props.brew.title}</Nav.item>;

		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section className='titleSection'>
					{
						this.props.disableMeta ?
							titleEl
							:
							<MetadataNav brew={this.props.brew}>
								{titleEl}
							</MetadataNav>
					}
				</Nav.section>

				<Nav.section>
					{this.props.brew.shareId && <>
						<PrintNavItem/>
						<Nav.dropdown>
							<Nav.item color='red' icon='fas fa-code'>
								source
							</Nav.item>
							<Nav.item color='blue' icon='fas fa-eye' href={`/source/${this.processShareId()}`}>
								view
							</Nav.item>
							{this.renderEditLink()}
							<Nav.item color='blue' icon='fas fa-download' href={`/download/${this.processShareId()}`}>
								download
							</Nav.item>
							<Nav.item color='blue' icon='fas fa-clone' href={`/new/${this.processShareId()}`}>
								clone to new
							</Nav.item>
						</Nav.dropdown>
					</>}
					<RecentNavItem brew={this.props.brew} storageKey='view' />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer
					text={this.props.brew.text}
					style={this.props.brew.style}
					renderer={this.props.brew.renderer}
					theme={this.props.brew.theme}
					themeBundle={this.state.themeBundle}
					allowPrint={true}
				/>
			</div>
		</div>;
	}
});

module.exports = SharePage;
