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
				title       : '',
				text        : '',
				style       : '',
				shareId     : null,
				createdAt   : null,
				updatedAt   : null,
				views       : 0,
				renderer    : '',
				userAccount : null
			}
		};
	},

	getInitialState : function() {
		return {
			showDropdown : false,
			liked        : false
		};
	},

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);

		if(this.props.brew.userAccount && (this.state.liked != this.props.brew.userAccount.likedBrews.includes(this.processShareId()))){
			this.setState({
				liked : !this.state.liked
			});
		}
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

	isLiked : function(){
		return (this.state.liked);
	},

	addLike : async function(){
		// TO DO: Implement adding to Account.likedBrews
		this.setState({
			liked : true
		});
	},

	removeLike : async function(){
		// TO DO: Implement removing from Account.likedBrews
		this.setState({
			liked : false
		});
	},

	renderLike : function(){
		if(!this.props.brew.userAccount){return;};
		return <>
			{this.isLiked()
				? <Nav.item className='heart' icon='fas fa-heart' color='red' onClick={this.removeLike} ></Nav.item>
				: <Nav.item className='heart' icon='far fa-heart' color='white' onClick={this.addLike} ></Nav.item>}
		</>;
	},

	render : function(){
		return <div className='sharePage sitePage'>
			<Meta name='robots' content='noindex, nofollow' />
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<PrintLink shareId={this.processShareId()} />
					<Nav.item icon='fas fa-code' color='red' className='source'
						onMouseEnter={()=>this.handleDropdown(true)}
						onMouseLeave={()=>this.handleDropdown(false)}>
						source
						{this.renderDropdown()}
					</Nav.item>
					{this.renderLike()}
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
