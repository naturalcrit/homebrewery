require('./homebrew.less');
const React = require('react');
const createClass = require('create-react-class');
const { StaticRouter:Router } = require('react-router-dom/server');
const { Route, Routes, useParams, useSearchParams } = require('react-router-dom');

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

		return {};
	},

	render : function (){
		return (
			<Router location={this.props.url}>
				<div className='homebrew'>
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