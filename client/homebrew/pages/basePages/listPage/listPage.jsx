require('./listPage.less');
const React       = require('react');
const createClass = require('create-react-class');
const _           = require('lodash');
const moment      = require('moment');

const BrewItem    = require('./brewItem/brewItem.jsx');

const USERPAGE_KEY_PREFIX = 'HOMEBREWERY-LISTPAGE-VISIBILITY';

const ListPage = createClass({
	displayName     : 'ListPage',
	getDefaultProps : function() {
		return {
			brewCollection : [
				{
					title   : '',
					class   : '',
					brews   : [],
					visible : true
				}
			],
			navItems : <></>
		};
	},
	getInitialState : function() {
		let brewCollection = [];

		if(typeof window !== 'undefined') {
			brewCollection = this.props.brewCollection.map((brewGroup)=>{
				const localVisibility = localStorage.getItem(`${USERPAGE_KEY_PREFIX}-${brewGroup.class}`) ?? 'true';
				if(brewGroup.visible != (localVisibility=='true')) {
					brewGroup.visible = (localVisibility=='true');
				};
				return brewGroup;
			});
		}

		return {
			sortType       : 'alpha',
			sortDir        : 'asc',
			filterString   : this.props.query?.filter || '',
			query          : this.props.query,
			brewCollection : brewCollection
		};
	},
	componentDidMount : function() {
		// SAVE TO LOCAL STORAGE WHEN LEAVING PAGE
		window.onbeforeunload = this.saveToLocalStorage;
	},

	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
	},

	saveToLocalStorage : function() {
		this.state.brewCollection.map((brewGroup)=>{
			localStorage.setItem(`${USERPAGE_KEY_PREFIX}-${brewGroup.class}`, `${brewGroup.visible}`);
		});
	},

	renderBrews : function(brews){
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		return _.map(brews, (brew, idx)=>{
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
			filterString : e.target.value,
		});
		this.updateUrl(e.target.value);
		return;
	},

	updateUrl : function(filterTerm){
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);
		if(urlParams.get('filter') == filterTerm)
			return;
		if(!filterTerm)
			urlParams.delete('filter');
		else
			urlParams.set('filter', filterTerm);
		url.search = urlParams;
		window.history.replaceState(null, null, url);
	},

	renderFilterOption : function(){
		return <td>
			<label>
				<i className='fas fa-search'></i>
				<input
					type='search'
					autoFocus={true}
					placeholder='filter title/description'
					onChange={this.handleFilterTextChange}
					value={this.state.filterString}
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
		brews = _.filter(brews, (brew)=>{
			return (_.deburr(brew.title).toLowerCase().includes(testString)) ||
			(_.deburr(brew.description).toLowerCase().includes(testString));
		});

		return _.orderBy(brews, (brew)=>{ return this.sortBrewOrder(brew); }, this.state.sortDir);
	},

	toggleBrewCollectionState : function(brewGroupClass) {
		this.setState((prevState)=>({
			brewCollection : prevState.brewCollection.map(
				(brewGroup)=>brewGroup.class === brewGroupClass ? { ...brewGroup, visible: !brewGroup.visible } : brewGroup
			)
		}));
	},

	renderBrewCollection : function(brewCollection){
		if(brewCollection == []) return <div className='brewCollection'>
			<h1>No Brews</h1>
		</div>;
		return _.map(brewCollection, (brewGroup, idx)=>{
			return <div key={idx} className={`brewCollection ${brewGroup.class ?? ''}`}>
				<h1 className={brewGroup.visible ? 'active' : 'inactive'} onClick={()=>{this.toggleBrewCollectionState(brewGroup.class);}}>{brewGroup.title || 'No Title'}</h1>
				{brewGroup.visible ? this.renderBrews(this.getSortedBrews(brewGroup.brews)) : <></>}
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
					{this.renderBrewCollection(this.state.brewCollection)}
				</div>
			</div>
		</div>;
	}
});

module.exports = ListPage;
