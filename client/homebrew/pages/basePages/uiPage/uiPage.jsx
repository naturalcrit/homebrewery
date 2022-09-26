require('./uiPage.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../../navbar/navbar.jsx');
const NewBrewItem = require('../../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../../navbar/help.navitem.jsx');
const RecentNavItem = require('../../../navbar/recent.navitem.jsx').both;
const Account = require('../../../navbar/account.navitem.jsx');


const UIPage = createClass({
	displayName : 'UIPage',

	getDefaultProps : function(){
		return {
			renderUiItems : ()=>{
				return <>
					<h1>H1 Header</h1>
					<h2>H2 Header</h2>
					<h3>H3 Header</h3>
					<h4>H4 Header</h4>
					<p>This is some test text.</p>
				</>;
			}
		};
	},

	render : function(){
		return <div className='uiPage sitePage'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<NewBrewItem />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				{this.props.renderUiItems().map((item, index)=>{
					return <div className='dataGroup' key={index}>
						{item}
					</div>;
				})}
			</div>
		</div>;
	}
});

module.exports = UIPage;
