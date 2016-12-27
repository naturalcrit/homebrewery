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
	/*
	getInitialState: function() {
		return {
			metadata : {
				title : '',
				description : '',
				tags : '',
				published : false,
				authors : [],
				systems : []
			},

			text: '',
			isSaving : false,
			errors : []
		};
	},
	*/
	componentDidMount: function() {
		const storage = localStorage.getItem(KEY);

		//TODO: Add aciton to load from local?


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

/*

	handleControlKeys : function(e){
		console.log(e);
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) this.print();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

/*
	save : function(){
		this.setState({
			isSaving : true
		});

		request.post('/api')
			.send(_.merge({}, this.state.metadata, {
				text : this.state.text
			}))
			.end((err, res)=>{
				if(err){
					this.setState({
						isSaving : false
					});
					return;
				}
				window.onbeforeunload = function(){};
				const brew = res.body;
				localStorage.removeItem(KEY);
				window.location = '/edit/' + brew.editId;
			})
	},
*/
	/*
	renderSaveButton : function(){
		if(this.state.isSaving){
			return <Nav.item icon='fa-spinner fa-spin' className='saveButton'>
				save...
			</Nav.item>
		}else{
			return <Nav.item icon='fa-save' className='saveButton' onClick={this.save}>
				save
			</Nav.item>
		}
	},
	*/
/*
	print : function(){
		localStorage.setItem('print', this.state.text);
		window.open('/print?dialog=true&local=print','_blank');
	},
*/

/*
	renderLocalPrintButton : function(){
		return <Nav.item color='purple' icon='fa-file-pdf-o' onClick={Actions.localPrint}>
			get PDF
		</Nav.item>
	},

	renderNavbar : function(){
		return
	},

*/
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
