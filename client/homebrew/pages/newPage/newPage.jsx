const React = require('react');
const _ = require('lodash');


const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');
const Account = require('../../navbar/account.navitem.jsx');
const Issue = require('../../navbar/issue.navitem.jsx');
const Save = require('../../navbar/staticSave.navitem.jsx');

const Store = require('homebrewery/brew.store.js');
const Actions = require('homebrewery/brew.actions.js');

const BrewInterface = require('homebrewery/brewInterface/brewInterface.jsx');
const Utils = require('homebrewery/utils.js');


const KEY = 'homebrewery-new';

const NewPage = React.createClass({
	componentDidMount: function() {
		const storage = localStorage.getItem(KEY);


		//TODO: add a store listener for updates and dump to lcoal storage


		if(storage){
			this.setState({
				text : storage
			})
		}
		document.addEventListener('keydown', this.handleControlKeys);
	},
	componentWillUnmount: function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	handleControlKeys : Utils.controlKeys({
		s : Actions.saveNew,
		p : Actions.localPrint
	}),

	render : function(){
		return <div className='newPage page'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{Store.getMetaData().title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<Save />
					<Nav.item color='purple' icon='fa-file-pdf-o' onClick={Actions.localPrint}>
						get PDF
					</Nav.item>
					<Issue />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				<BrewInterface />
			</div>
		</div>
	}
});

module.exports = NewPage;
