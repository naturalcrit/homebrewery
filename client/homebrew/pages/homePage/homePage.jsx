const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const NavItem = require('../../navbar/navitems.js');


//const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');
const BrewCard = require('homebrewery/brewCard/brewCard.jsx');

//const Actions = require('homebrewery/brew.actions.js');

const HomePage = React.createClass({
	getDefaultProps: function() {
		return {
			topBrews : []
		};
	},

	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<NavItem.Patreon collaspe={true} />
				<NavItem.Issue collaspe={true} />
				<Nav.item newTab={true} href='/changelog' color='purple' icon='fa-star' collaspe={true}>
					What's new
				</Nav.item>
				<NavItem.Recent.both />
				<NavItem.Account />
				{/*}
				<Nav.item href='/new' color='green' icon='fa-external-link'>
					New Brew
				</Nav.item>
				*/}
			</Nav.section>
		</Navbar>
	},

	renderNavigation : function(){
		return <div className='navigation'>
			<p>
				Effortlessly create Authnetic looking D&D homebrews with just text
			</p>
			<div>
				<a className='button new' target='_blank' href='/new'>
					<i className='fa fa-magic' />
					<h3>New</h3>
					<p>This is some sample text</p>
				</a>

				<a className='button search' target='_blank' href='/search'>
					<i className='fa fa-search' />
					<h3>Search</h3>
					<p>This is some sample text</p>
				</a>
			</div>
			<div>
				<a className='button docs' target='_blank' href='/docs'>
					<i className='fa fa-book' />
					<h3>Docs</h3>
					<p>This is some sample text</p>
				</a>
				<a className='button account' target='_blank' href='/account'>
					<i className='fa fa-user' />
					<h3>Account</h3>
					<p>This is some sample text</p>
				</a>
			</div>
		</div>

	},

	renderTopBrews : function(){
		return <div className='topBrews'>
			{_.map(this.props.brews, (brew)=><BrewCard brew={brew} key={brew._id}/>)}
		</div>
	},

	render : function(){
		return <div className='homePage page'>
			{this.renderNavbar()}
			<div className='content'>
				<div className='hero'>
					hero
					<h1>The Homebrewery</h1>

				</div>
				{this.renderNavigation()}
				{this.renderTopBrews()}
			</div>
		</div>
	}
});

module.exports = HomePage;
