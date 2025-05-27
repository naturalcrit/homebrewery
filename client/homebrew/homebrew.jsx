//╔===--------------- Polyfills --------------===╗//
import 'core-js/es/string/to-well-formed.js';
//╚===---------------          ---------------===╝//

require('./homebrew.less');
const React = require('react');
const createClass = require('create-react-class');
const { StaticRouter:Router } = require('react-router');
const { Route, Routes, useParams, useSearchParams } = require('react-router');

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage = require('./pages/newPage/newPage.jsx');
const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const VaultPage = require('./pages/vaultPage/vaultPage.jsx');
const AccountPage = require('./pages/accountPage/accountPage.jsx');

const WithRoute = (props)=>{
	const params = useParams();
	const [searchParams] = useSearchParams();
	const queryParams = {};
	for (const [key, value] of searchParams?.entries() || []) {
		queryParams[key] = value;
	}
	const Element = props.el;
	const allProps = {
		...props,
		...params,
		query : queryParams,
		el    : undefined
	};
	return <Element {...allProps} />;
};

const Homebrew = createClass({
	displayName     : 'Homebrewery',
	getDefaultProps : function() {
		return {
			url         : '',
			welcomeText : '',
			changelog   : '',
			version     : '0.0.0',
			account     : null,
			enable_v3   : false,
			brew        : {
				title     : '',
				text      : '',
				shareId   : null,
				editId    : null,
				createdAt : null,
				updatedAt : null,
				lang      : ''
			}
		};
	},

	getInitialState : function() {
		global.account = this.props.account;
		global.version = this.props.version;
		global.enable_v3 = this.props.enable_v3;
		global.enable_themes = this.props.enable_themes;
		global.config = this.props.config;

		return { isClient: false };
	},

	componentDidMount : function() {
		this.setState({ isClient: true });
	},

	backgroundObject : function() {
		if(!this.state.isClient) return null;

		if(this.props.config.deployment) {
			return {
				backgroundImage : `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='200px'><text x='0' y='15' fill='%23fff7' font-size='20'>${this.props.config.deployment}</text></svg>")`
			};
		} else if(this.props.config.local) {
			return {
				backgroundImage : `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='200px'><text x='0' y='15' fill='%23fff7' font-size='20'>Local</text></svg>")`
			};
		}

		return null;
	},


	render : function (){
		return (
			<Router location={this.props.url}>
				<div className={`homebrew${this.state.isClient && (this.props.config.deployment || this.props.config.local) ? ' deployment' : ''}`}
					style={ this.backgroundObject() }
				>
					<Routes>
						<Route path='/edit/:id' element={<WithRoute el={EditPage} brew={this.props.brew} userThemes={this.props.userThemes}/>} />
						<Route path='/share/:id' element={<WithRoute el={SharePage} brew={this.props.brew} />} />
						<Route path='/new/:id' element={<WithRoute el={NewPage} brew={this.props.brew} userThemes={this.props.userThemes}/>} />
						<Route path='/new' element={<WithRoute el={NewPage} userThemes={this.props.userThemes}/> } />
						<Route path='/user/:username' element={<WithRoute el={UserPage} brews={this.props.brews} />} />
						<Route path='/vault' element={<WithRoute el={VaultPage}/>}/>
						<Route path='/changelog' element={<WithRoute el={SharePage} brew={this.props.brew} disableMeta={true} />} />
						<Route path='/faq' element={<WithRoute el={SharePage} brew={this.props.brew} disableMeta={true} />} />
						<Route path='/migrate' element={<WithRoute el={SharePage} brew={this.props.brew} disableMeta={true} />} />
						<Route path='/account' element={<WithRoute el={AccountPage} brew={this.props.brew} accountDetails={this.props.brew.accountDetails} />} />
						<Route path='/legacy' element={<WithRoute el={HomePage} brew={this.props.brew} />} />
						<Route path='/error' element={<WithRoute el={ErrorPage} brew={this.props.brew} />} />
						<Route path='/' element={<WithRoute el={HomePage} brew={this.props.brew} />} />
						<Route path='/*' element={<WithRoute el={HomePage} brew={this.props.brew} />} />
					</Routes>
				</div>
			</Router>
		);
	}
});

module.exports = Homebrew;