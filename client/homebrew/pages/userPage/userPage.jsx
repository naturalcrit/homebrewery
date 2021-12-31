const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const ListPage = require('../basePages/listPage/listPage.jsx');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const UserPage = createClass({
	displayName     : 'UserPage',
	getDefaultProps : function() {
		return {
			username : '',
			brews    : [],
		};
	},
	getInitialState : function() {
		return {
			sortType     : 'alpha',
			sortDir      : 'asc',
			filterString : ''
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
		if(!brew.title){brew.title = 'No Title';}
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
					  className={`sortOption ${(this.state.sortType == sortValue ? 'active' : '')}`}
				  >
  					{`${sortTitle}`}
		 		  </button>
		  </td>;
	},

	handleFilterTextChange : function(e){
		this.setState({
			filterString : e.target.value
		});
		return;
	},

	renderFilterOption : function(){
		return <td>
			<label className='filterOption'>
				<i className='fas fa-search'></i>
				<input
					type='search'
					placeholder='search title/description'
					onChange={this.handleFilterTextChange}
				/>
			</label>
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
						{this.renderFilterOption()}
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

		const brewCollections = [
			{
				title : `${this.getUsernameWithS()} published brews`,
				class : 'published',
				brews : brews.published
			}
		];
		if(this.props.username == global.account?.username){
			brewCollections.push(
				{
					title : `${this.getUsernameWithS()} unpublished brews`,
					class : 'unpublished',
					brews : brews.private
				}
			);
		}

		return <ListPage brewCollection={brewCollections} ></ListPage>;
	}
});

module.exports = UserPage;
