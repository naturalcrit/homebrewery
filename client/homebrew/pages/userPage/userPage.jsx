require('./userPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const moment = require('moment');

const Nav = require('naturalcrit/nav/nav.jsx');
const Navbar = require('../../navbar/navbar.jsx');

const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const NewBrew = require('../../navbar/newbrew.navitem.jsx');
const BrewItem = require('./brewItem/brewItem.jsx');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const UserPage = createClass({
	getDefaultProps : function() {
		return {
			username : '',
			brews    : [],
		};
	},
	getInitialState : function() {
		return {
			sortType : 'alpha',
			sortDir  : 'asc'
		};
	},
	getUsernameWithS : function() {
		if(this.props.username.endsWith('s'))
			return `${this.props.username}'`;
		return `${this.props.username}'s`;
	},

	renderBrews : function(brews){
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		const sortedBrews = this.sortBrews(brews);

		return _.map(sortedBrews, (brew, idx)=>{
			return <BrewItem brew={brew} key={idx}/>;
		});
	},

	sortBrewOrder : function(brew){
		if(!brew.title){brew.title = 'No Title';};
		const mapping = {
			'alpha'   : _.deburr(brew.title.toLowerCase()),
			'created' : moment(brew.createdAt).format(),
			'updated' : moment(brew.updatedAt).format(),
			'views'   : brew.views,
			'latest'  : moment(brew.lastViewed).format()
		};
		return mapping[this.state.sortType];
	},

	sortBrews : function(brews){
		return _.orderBy(brews, (brew)=>{ return this.sortBrewOrder(brew); }, this.state.sortDir);
	},

	handleSortOptionChange : function(event){
		this.setState({
			sortType : event.target.value
		});
	},

	handleSortDirChange : function(event){
		this.setState({
			sortDir : `${(this.state.sortDir == 'asc' ? 'desc' : 'asc')}`
		});
	},

	renderSortOption : function(sortTitle, sortValue){
		return <td>
				  <button
					  value={`${sortValue}`}
					  onClick={this.handleSortOptionChange}
					  className={`${(this.state.sortType == sortValue ? 'active' : '')}`}
				  >
  					{`${sortTitle}`}
		 		  </button>
		  </td>;
	},

	renderSortOptions : function(){
		return <div className='sort-container'>
			<table>
				<tbody>
					<tr>
						<td>
							<h6>Sort by :</h6>
						</td>
						{this.renderSortOption('Title', 'alpha')}
						{this.renderSortOption('Created Date', 'created')}
						{this.renderSortOption('Updated Date', 'updated')}
						{this.renderSortOption('Views', 'views')}
						{/* {this.renderSortOption('Latest', 'latest')} */}
				    	<td>
							<h6>Direction :</h6>
						</td>
						<td>
							<button
								onClick={this.handleSortDirChange}
								className='sortDir'
							>
								{`${(this.state.sortDir == 'asc' ? '\u25B2 ASC' : '\u25BC DESC')}`}
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	},

	getSortedBrews : function(){
		return _.groupBy(this.props.brews, (brew)=>{
			return (brew.published ? 'published' : 'private');
		});
	},

	render : function(){
		const brews = this.getSortedBrews();

		return <div className='userPage sitePage'>
			<link href='/themes/5ePhbLegacy.style.css' rel='stylesheet'/>
			<Navbar>
				<Nav.section>
					<NewBrew />
					<ReportIssue />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content V3'>
				<div className='phb'>
					{this.renderSortOptions()}
					<div className='published'>
						<h1>{this.getUsernameWithS()} published brews</h1>
						{this.renderBrews(brews.published)}
					</div>
					{this.props.username == global.account?.username &&
						<div className='unpublished'>
							<h1>{this.getUsernameWithS()} unpublished brews</h1>
							{this.renderBrews(brews.private)}
						</div>
					}
				</div>
			</div>
		</div>;
	}
});

module.exports = UserPage;
