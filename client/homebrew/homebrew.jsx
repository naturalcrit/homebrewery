require('./homebrew.less');
const React = require('react');
const createClass = require('create-react-class');
const { StaticRouter:Router } = require('react-router-dom/server');
const { Route, Routes, useParams, useLocation } = require('react-router-dom');
const queryString = require('query-string');

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage = require('./pages/newPage/newPage.jsx');
//const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const PrintPage = require('./pages/printPage/printPage.jsx');

const WithRoute = (props)=>{ //(Element, additionalPropsFn)=>{
	const params = useParams();
	const location = useLocation();
	let additionalProps = {};
	if(props.additionalPropsFn) {
		additionalProps = props.additionalPropsFn({ props, params, location });
	}
	const Element = props.el;
	return <Element {...{
		...props,
		el                : undefined,
		additionalPropsFn : undefined
	}} {...params} {...additionalProps}/>;
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
			}
		};
	},

	getInitialState : function() {
		global.account = this.props.account;
		global.version = this.props.version;
		global.enable_v3 = this.props.enable_v3;
		global.config = this.props.config;

		return {};
	},

	render : function (){
		return <Router location={this.props.url}>
			<div className='homebrew'>
				<Routes>
					<Route path='/edit/:id' element={<WithRoute el={EditPage} brew={this.props.brew} />} />
					<Route path='/share/:id' element={<WithRoute el={SharePage} brew={this.props.brew} />} />
					<Route path='/new/:id' element={<WithRoute el={NewPage} brew={this.props.brew} />} />
					<Route path='/new' element={<WithRoute el={NewPage}/>} />
					<Route path='/user/:username' element={<WithRoute el={UserPage} brews={this.props.brews} additionalPropsFn={({ location })=>({ query: queryString.parse(location.search) })} />} />
					<Route path='/print/:id' element={<WithRoute el={PrintPage} brew={this.props.brew} additionalPropsFn={({ location })=>({ query: queryString.parse(location.search) })} />} />
					<Route path='/print' element={<WithRoute el={PrintPage} additionalPropsFn={({ location })=>({ query: queryString.parse(location.search) })} />} />
					<Route path='/changelog' element={<WithRoute el={SharePage} brew={this.props.brew} />} />
					<Route path='/faq' element={<WithRoute el={SharePage} brew={this.props.brew} />} />
					<Route path='/v3_preview' element={<WithRoute el={HomePage} brew={this.props.brew} />} />
					<Route path='/' element={<WithRoute el={HomePage} brew={this.props.brew} />} />
				</Routes>
			</div>
		</Router>;
	}
});

module.exports = Homebrew;

//TODO: Nicer Error page instead of just "cant get that"
// 	'/share/:id' : (args)=>{
// 		if(!this.props.brew.shareId){
// 			return <ErrorPage errorId={args.id}/>;
// 		}
//
// 		return <SharePage
// 			id={args.id}
// 			brew={this.props.brew} />;
// 	},
