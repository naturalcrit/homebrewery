require('./homebrew.less');
const React = require('react');
const createClass = require('create-react-class');
const { StaticRouter:Router, Switch, Route } = require('react-router-dom');
const queryString = require('query-string');

const HomePage = require('./pages/homePage/homePage.jsx');
const EditPage = require('./pages/editPage/editPage.jsx');
const UserPage = require('./pages/userPage/userPage.jsx');
const SharePage = require('./pages/sharePage/sharePage.jsx');
const NewPage = require('./pages/newPage/newPage.jsx');
//const ErrorPage = require('./pages/errorPage/errorPage.jsx');
const PrintPage = require('./pages/printPage/printPage.jsx');

const Homebrew = createClass({
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
	componentWillMount : function() {
		global.account = this.props.account;
		global.version = this.props.version;
		global.enable_v3 = this.props.enable_v3;
	},
	render : function (){
		return (
			<Router location={this.props.url}>
				<div className='homebrew'>
					<Switch>
						<Route path='/edit/:id' component={(routeProps)=><EditPage id={routeProps.match.params.id} brew={this.props.brew} />}/>
						<Route path='/share/:id' component={(routeProps)=><SharePage id={routeProps.match.params.id} brew={this.props.brew} />}/>
						<Route path='/new/:id' component={(routeProps)=><NewPage id={routeProps.match.params.id} brew={this.props.brew} />}/>
						<Route path='/new' exact component={(routeProps)=><NewPage/>}/>
						<Route path='/user/:username' component={(routeProps)=><UserPage username={routeProps.match.params.username} brews={this.props.brews} />}/>
						<Route path='/print/:id' component={(routeProps)=><PrintPage brew={this.props.brew} query={queryString.parse(routeProps.location.search)} /> } />
						<Route path='/print' exact component={(routeProps)=><PrintPage query={queryString.parse(routeProps.location.search)} /> } />
						<Route path='/changelog' exact component={()=><SharePage brew={this.props.brew} />}/>
						<Route path='/' component={()=><HomePage welcomeText={this.props.welcomeText}/>}/>
					</Switch>
				</div>
			</Router>
		);
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
