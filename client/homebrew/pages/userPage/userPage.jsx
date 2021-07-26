require('./userPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

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
			sortType : 'alpha',
			sortDir  : 'desc'
		};
	},
	getInitialState : function() {
		return {
			sortType : 'alpha',
			sortDir  : 'desc'
		};
	},
	getUsernameWithS : function() {
		if(this.props.username.endsWith('s'))
			return `${this.props.username}'`;
		return `${this.props.username}'s`;
	},

	renderBrews : function(brews){
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		const sortedBrews = this.sortBrews(brews, this.state.sortType);

		return _.map(sortedBrews, (brew, idx)=>{
			return <BrewItem brew={brew} key={idx}/>;
		});
	},

	sortBrews : function(brews, sortType){
		if(sortType == 'alpha') {
			return _.orderBy(brews, (brew)=>{ return brew.title.toLowerCase(); }, this.state.sortDir);
		}
		if(sortType == 'created'){
			return _.orderBy(brews, (brew)=>{ return brew.createdAt; }, this.state.sortDir);
		}
		if(sortType == 'updated'){
			return _.orderBy(brews, (brew)=>{ return brew.updatedAt; }, this.state.sortDir);
		}
		if(sortType == 'views'){
			return _.orderBy(brews, (brew)=>{ return brew.views; }, this.state.sortDir);
		}
		if(sortType == 'latest'){
			return _.orderBy(brews, (brew)=>{ return brew.lastViewed; }, this.state.sortDir);
		}
		return _.orderBy(brews, (brew)=>{ return brew.title.toLowerCase(); }, this.state.sortDir);
	},

	handleSortOptionChange : function(event){
		this.setState({
			sortType : event.target.value
		});
	},

	handleSortDirChange : function(event){
		const newDir = (this.state.sortDir == 'asc' ? 'desc' : 'asc');
		this.setState({
			sortDir : `${newDir}`
		});
	},

	renderSortOptions : function(){
		return <div className='sort-container'>
			<table>
				<tr>
					<td>
						<h6>Sort Type :</h6>
					</td>
					<td>
		  		<label>
							<input
								type='radio'
								name='sortType'
								value='alpha'
								checked={this.state.sortType == 'alpha'}
								className='sort-radio'
								onChange={this.handleSortOptionChange}
							/>
			Title
						</label>
					</td>
					<td>
						<label>
							<input
								type='radio'
								name='sortType'
								value='created'
								checked={this.state.sortType == 'created'}
								className='sort-radio'
								onChange={this.handleSortOptionChange}
							/>
			Created Date
						</label>
					</td>
					<td>
						<label>
							<input
								type='radio'
								name='sortType'
								value='updated'
								checked={this.state.sortType == 'updated'}
								className='sort-radio'
								onChange={this.handleSortOptionChange}
							/>
			Updated Date
		  		</label>
				  </td>
				  <td>
				  <label>
							<input
								type='radio'
								name='sortType'
								value='views'
								checked={this.state.sortType == 'views'}
								className='sort-radio'
								onChange={this.handleSortOptionChange}
							/>
			Views
		  		</label>
				  </td>
				  <td>
				  <label>
							<input
								type='radio'
								name='sortType'
								value='latest'
								checked={this.state.sortType == 'latest'}
								className='sort-radio'
								onChange={this.handleSortOptionChange}
							/>
			Latest
		  		</label>
				  </td>
				  <td>
						<h6>Direction :</h6>
					</td>
					<td>
						<button
							onClick={this.handleSortDirChange}
						>
							{`${(this.state.sortDir == 'asc' ? '⮝ ASC' : '⮟ DESC')}`}
						</button>
					</td>
				</tr>
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
			<Navbar>
				<Nav.section>
					<NewBrew />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content V3'>
				<div className='phb'>
					{this.renderSortOptions()}
					<div>
						<h1>{this.getUsernameWithS()} brews</h1>
						{this.renderBrews(brews.published)}
					</div>
					<div>
						<h1>{this.getUsernameWithS()} unpublished brews</h1>
						{this.renderBrews(brews.private)}
					</div>
				</div>
			</div>
		</div>;
	}
});

module.exports = UserPage;
