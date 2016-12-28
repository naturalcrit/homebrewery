const React = require('react');
const _ = require('lodash');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const Items = require('../../navbar/navitems.js');

const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');

const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');
const Utils = require('homebrewery/utils.js');

const KEY = 'homebrewery-new';

const NewPage = React.createClass({
	componentDidMount: function() {
		try{
			Actions.setBrew(JSON.parse(localStorage.getItem(KEY)));
		}catch(e){}
		Store.updateEmitter.on('change', this.saveToLocal);
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		Store.updateEmitter.removeListener('change', this.saveToLocal);
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	saveToLocal : function(){
		localStorage.setItem(KEY, JSON.stringify(Store.getBrew()));
	},
	handleControlKeys : Utils.controlKeys({
		s : Actions.saveNew,
		p : Actions.localPrint
	}),

	render : function(){
		return <div className='newPage page'>
			<Navbar>
				<Nav.section>
					<Items.BrewTitle />
				</Nav.section>

				<Nav.section>
					<Items.StaticSave />
					<Nav.item color='purple' icon='fa-file-pdf-o' onClick={Actions.localPrint}>
						get PDF
					</Nav.item>
					<Items.Issue />
					<Items.Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewInterface />
			</div>
		</div>
	}
});

module.exports = NewPage;
