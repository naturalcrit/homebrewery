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
				style     : '',
				shareId   : null,
				createdAt : null,
				updatedAt : null,
				views     : 0,
				renderer  : ''
			},
			showSource : true,
			showPrint  : true
		};
	},

	getInitialState : function() {
		return {
			showDropdown : false
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

	handleDropdown : function(show){
		this.setState({
			showDropdown : show
		});
	},

	renderDropdown : function(){
		if(!this.state.showDropdown) return null;

		return <div className='dropdown'>
			<a href={`/source/${this.processShareId()}`} className='item'>
				view
			</a>
			<a href={`/download/${this.processShareId()}`} className='item'>
				download
			</a>
			<a href={`/new/${this.processShareId()}`} className='item'>
				clone to new
			</a>
		</div>;
	},

	renderPrint : function(){
		if(!this.state.showPrint) return;
		return <PrintLink shareId={this.processShareId()} />;
	}

	renderSourceDropdown : function(){
		if(!this.state.showSource) return;
		return <Nav.item icon='fas fa-code' color='red' className='source'
						onMouseEnter={()=>this.handleDropdown(true)}
						onMouseLeave={()=>this.handleDropdown(false)}>
						source
						{this.renderDropdown()}
					</Nav.item>;
	},

	render : function(){
		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					{this.renderPrint()}
					{this.renderSourceDropdown()}
					<RecentNavItem brew={this.props.brew} storageKey='view' />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewRenderer text={this.props.brew.text} style={this.props.brew.style} renderer={this.props.brew.renderer} />
			</div>
		</div>;
	}
});

module.exports = SharePage;
