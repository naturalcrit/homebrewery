const React = require('react');
const _ = require('lodash');
const cx = require('classnames');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const Items = require('../../navbar/navitems.js');

const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');
const Utils = require('homebrewery/utils.js');

const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');


const EditPage = React.createClass({
	componentDidMount: function(){
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : Utils.controlKeys({
		s : Actions.save,
		p : Actions.print
	}),
	render : function(){
		return <div className='editPage page'>
			<SmartNav />
			<div className='content'>
				<BrewInterface />
			</div>
		</div>
	}
});

const SmartNav = Store.createSmartComponent(React.createClass({
	getDefaultProps: function() {
		return {
			brew : {}
		};
	},
	render : function(){
		return <Navbar>
			<Nav.section>
				<Items.BrewTitle />
			</Nav.section>
			<Nav.section>
				<Items.ContinousSave />
				<Items.Issue />
				<Nav.item newTab={true} href={'/share/' + this.props.brew.shareId} color='teal' icon='fa-share-alt'>
					Share
				</Nav.item>
				<Items.Print shareId={this.props.brew.shareId} />
				<Items.Account />
			</Nav.section>
		</Navbar>
	}
}), ()=>{
	return {brew : Store.getBrew()}
});

module.exports = EditPage;
