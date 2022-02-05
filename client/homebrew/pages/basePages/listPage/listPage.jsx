require('./listPage.less');
const React = require('react');
const createClass = require('create-react-class');
const _     = require('lodash');
const cx    = require('classnames');

const BrewItem = require('./brewItem/brewItem.jsx');

const moment = require('moment');

// const brew = {
// 	title   : 'SUPER Long title woah now',
// 	authors : []
// };

//const BREWS = _.times(25, ()=>{ return brew;});


const ListPage = createClass({
	getDefaultProps : function() {
		return {
			brewCollection : [
				{
					title : '',
					class : '',
					brews : []
				}
			],
			navItems : <></>
		};
	},
	getInitialState : function() {
		return {
			sortType     : 'alpha',
			sortDir      : 'asc',
			filterString : ''
		};
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
					  className={`${(this.state.sortType == sortValue ? 'active' : '')}`}
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
			<label>
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

	getSortedBrews : function(brews){
		const testString = _.deburr(this.state.filterString).toLowerCase();
		brews = testString ? _.filter(brews, (brew)=>{
			return (_.deburr(brew.title).toLowerCase().includes(testString)) ||
			(_.deburr(brew.description).toLowerCase().includes(testString));
		}) : brews;
		return brews;
	},

	renderBrewCollection : function(brewCollection){
		brewCollection.brews = this.getSortedBrews(brewCollection);
		return _.map(brewCollection, (brewItem, idx)=>{
			return <div key={idx} className={`brewCollection${brewItem?.class ? ` ${brewItem.class}` : ''}`}>
				<h1>{brewItem.title || 'No Title'}</h1>
				{this.renderBrews(this.getSortedBrews(brewItem.brews))}
			</div>;
		});
	},

	render : function(){
		return <div className='listPage sitePage'>
			<link href='/themes/5ePhbLegacy.style.css' rel='stylesheet'/>
			{this.props.navItems}

			<div className='content V3'>
				<div className='phb'>
					{this.renderSortOptions()}
					{this.renderBrewCollection(this.props.brewCollection)}
				</div>
			</div>
		</div>;
	}
});

module.exports = ListPage;
