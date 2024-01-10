const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');
const moment = require('moment');

const UIPage = require('../basePages/uiPage/uiPage.jsx');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem = require('../../navbar/help.navitem.jsx');

const NaturalCritIcon = require('naturalcrit/svg/naturalcrit.svg.jsx');
const translateOpts = ['accountPage'];


let SAVEKEY = '';
const languageKey = 'HOMEBREWERY-LANG';

const AccountPage = createClass({
	displayName     : 'AccountPage',
	getDefaultProps : function() {
		return {
			brew    : {},
			uiItems : {}
		};
	},
	getInitialState : function() {
		return {
			uiItems : this.props.uiItems,
			lang    : 'en-US'
		};
	},
	componentDidMount : function(){
		const lang = window.localStorage.getItem(languageKey);
		if(lang != this.state.lang){ this.setState({ lang }); }

		if(!this.state.saveLocation && this.props.uiItems.username) {
			SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${this.props.uiItems.username}`;
			let saveLocation =  window.localStorage.getItem(SAVEKEY);
			saveLocation = saveLocation ?? (this.state.uiItems.googleId ? 'GOOGLE-DRIVE' : 'HOMEBREWERY');
			this.makeActive(saveLocation);
		}
	},

	updateLang : function(lang){
		if(this.state.lang == lang) return;
		window.localStorage.setItem(languageKey, lang);
		this.setState({
			lang : lang
		});
	},

	makeActive : function(newSelection){
		if(this.state.saveLocation == newSelection) return;
		window.localStorage.setItem(SAVEKEY, newSelection);
		this.setState({
			saveLocation : newSelection
		});
	},

	renderLanguageDropdown : function(){
		const languageOptions = ['en-US', 'fr-FR'];
		return <div>
			<select onChange={(e)=>{ this.updateLang(e.target.value); }} value={this.state.lang}>
				{_.map(languageOptions, (lang, key)=>{ return <option key={key} value={lang}>{lang}</option>; })}
			</select>
			<br />
			<sub style="font-size:smaller">{'langSub'.translate()}</sub>
		</div>;
	},

	renderButton : function(name, key, shouldRender=true){
		if(!shouldRender) return;
		return <button className={this.state.saveLocation==key ? 'active' :	''}	onClick={()=>{this.makeActive(key);}}>{name}</button>;
	},

	renderNavItems : function() {
		return <Navbar>
			<Nav.section>
				<NewBrew />
				<HelpNavItem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>;
	},

	renderUiItems : function() {
		return 	<>
			<div className='dataGroup'>
				<h1>{'Account Information'.translate()}  <i className='fas fa-user'></i></h1>
				<p><strong>{'username'.translate()} </strong> {this.props.uiItems.username || 'noUser'.translate()}</p>
				<p><strong>{'lastLogin'.translate()} </strong> {moment(this.props.uiItems.issued).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ') || '-'}</p>
			</div>
			<div className='dataGroup'>
				<h3>{'Homebrewery Information'.translate()} <NaturalCritIcon /></h3>
				<p><strong>{'brewsOnHomebrewery'.translate()} </strong> {this.props.uiItems.mongoCount}</p>
			</div>
			<div className='dataGroup'>
				<h3>{'Google Information'.translate()} <i className='fab fa-google-drive'></i></h3>
				<p><strong>{'linkedToGoogle'.translate()} </strong> {this.props.uiItems.googleId ? 'yes'.translate() : 'no'.translate()}</p>
				{this.props.uiItems.googleId &&
					<p>
						<strong>{'brewsOnDrive'.translate()} </strong> {this.props.uiItems.googleCount ?? <> {'noFiles'.translate()} - <a href='https://github.com/naturalcrit/homebrewery/discussions/1580'>{'followSteps'.translate()}</a></>}
					</p>
				}
			</div>
			<div className='dataGroup'>
				<h4>{'Default Save Location'.translate()}</h4>
				{this.renderButton('Homebrewery'.translate(), 'HOMEBREWERY')}
				{this.renderButton('Google Drive'.translate(), 'GOOGLE-DRIVE', this.state.uiItems.googleId)}
			</div>
			<div className='dataGroup'>
				<h4>{'Language Selection'.translate()} <i className='fas fa-language'></i></h4>
				{this.renderLanguageDropdown()}
			</div>
		</>;
	},

	render : function(){
		''.setTranslationDefaults(translateOpts);
		return <UIPage brew={this.props.brew}>
			{this.renderUiItems()}
		</UIPage>;
	}
});

module.exports = AccountPage;
