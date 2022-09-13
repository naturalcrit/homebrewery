/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./listPage.less');
const React       = require('react');
const createClass = require('create-react-class');
const _           = require('lodash');
const moment      = require('moment');

const BrewItem    = require('./brewItem/brewItem.jsx');

const USERPAGE_KEY_PREFIX = 'HOMEBREWERY-LISTPAGE';

const DEFAULT_SORT_TYPE = 'alpha';
const DEFAULT_SORT_DIR = 'asc';

const ListPage = createClass({
	displayName     : 'ListPage',
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
		// HIDE ALL GROUPS UNTIL LOADED
		const brewCollection = this.props.brewCollection.map((brewGroup)=>{
			brewGroup.visible = false;
			return brewGroup;
		});

		return {
			filterString   : this.props.query?.filter || '',
			sortType       : this.props.query?.sort || null,
			sortDir        : this.props.query?.dir || null,
			query          : this.props.query,
			brewCollection : brewCollection
		};
	},

	componentDidMount : function() {
		// SAVE TO LOCAL STORAGE WHEN LEAVING PAGE
		window.onbeforeunload = this.saveToLocalStorage;

		// LOAD FROM LOCAL STORAGE
		if(typeof window !== 'undefined') {
			const newSortType = (this.state.sortType ?? (localStorage.getItem(`${USERPAGE_KEY_PREFIX}-SORTTYPE`) || DEFAULT_SORT_TYPE));
			const newSortDir = (this.state.sortDir ?? (localStorage.getItem(`${USERPAGE_KEY_PREFIX}-SORTDIR`) || DEFAULT_SORT_DIR));
			this.updateUrl(this.state.filterString, newSortType, newSortDir);

			const brewCollection = this.props.brewCollection.map((brewGroup)=>{
				brewGroup.visible = (localStorage.getItem(`${USERPAGE_KEY_PREFIX}-VISIBILITY-${brewGroup.class}`) ?? 'true')=='true';
				return brewGroup;
			});

			this.setState({
				brewCollection : brewCollection,
				sortType       : newSortType,
				sortDir        : newSortDir
			});
		};
	},

	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
	},

	saveToLocalStorage : function() {
		this.state.brewCollection.map((brewGroup)=>{
			localStorage.setItem(`${USERPAGE_KEY_PREFIX}-VISIBILITY-${brewGroup.class}`, `${brewGroup.visible}`);
		});
		localStorage.setItem(`${USERPAGE_KEY_PREFIX}-SORTTYPE`, this.state.sortType);
		localStorage.setItem(`${USERPAGE_KEY_PREFIX}-SORTDIR`, this.state.sortDir);
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
		this.updateUrl(this.state.filterString, event.target.value, this.state.sortDir);
		this.setState({
			sortType : event.target.value
		});
	},

	handleSortDirChange : function(event){
		const newDir = this.state.sortDir == 'asc' ? 'desc' : 'asc';

		this.updateUrl(this.state.filterString, this.state.sortType, newDir);
		this.setState({
			sortDir : newDir
		});
	},

	renderSortOption : function(sortTitle, sortValue){
		return <div>
				  <button
					  value={`${sortValue}`}
					  onClick={this.handleSortOptionChange}
					  className={`${(this.state.sortType == sortValue ? 'active' : '')}`}
				  >
  					{`${sortTitle}`}
		 		  </button>
		  </div>;
	},

	handleFilterTextChange : function(e){
		this.setState({
			filterString : e.target.value,
		});
		this.updateUrl(e.target.value, this.state.sortType, this.state.sortDir);
		return;
	},

	updateUrl : function(filterTerm, sortType, sortDir){
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);

		urlParams.set('sort', sortType);
		urlParams.set('dir', sortDir);

		if(!filterTerm)
			urlParams.delete('filter');
		else
			urlParams.set('filter', filterTerm);

		url.search = urlParams;
		window.history.replaceState(null, null, url);
	},

	renderFilterOption : function(){
		return <div className='filter-option'>
			<label>
				<i className='fas fa-search'></i>
				<input
					type='search'
					placeholder='filter title/description'
					onChange={this.handleFilterTextChange}
					value={this.state.filterString}
				/>
			</label>
		</div>;
	},

	renderSortOptions : function(){
		return <div className='sort-container'>
							<h6>Sort by :</h6>
						{this.renderSortOption('Title', 'alpha')}
						{this.renderSortOption('Created Date', 'created')}
						{this.renderSortOption('Updated Date', 'updated')}
						{this.renderSortOption('Views', 'views')}
						{/* {this.renderSortOption('Latest', 'latest')} */}

							<h6>Direction :</h6>

							<button
								onClick={this.handleSortDirChange}
								className='sortDir'
							>
								{`${(this.state.sortDir == 'asc' ? '\u25B2 ASC' : '\u25BC DESC')}`}
							</button>

						{this.renderFilterOption()}

				
			
		</div>;
	},

	getSortedBrews : function(brews){
		const testString = _.deburr(this.state.filterString).toLowerCase();

		brews = _.filter(brews, (brew)=>{
			const brewStrings = _.deburr([
				brew.title,
				brew.description,
				brew.tags].join('\n')
				.toLowerCase());

			return brewStrings.includes(testString);
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
			<link href='/themes/V3/5ePHB/style.css' rel='stylesheet'/>
			{this.props.navItems}
			{this.renderSortOptions()}

			<div className='content V3'>
				<div className='phb page'>
					{this.renderBrewCollection(this.state.brewCollection)}
				</div>
			</div>
		</div>;
	}
});

module.exports = ListPage;
