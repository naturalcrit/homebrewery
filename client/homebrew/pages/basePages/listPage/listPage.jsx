/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
require('./listPage.less');
const React       = require('react');
const createClass = require('create-react-class');
const _           = require('lodash');
const moment      = require('moment');

const BrewItem    = require('./brewItem/brewItem.jsx');

const USERPAGE_SORT_DIR = 'HB_listPage_sortDir';
const USERPAGE_SORT_TYPE = 'HB_listPage_sortType';
const USERPAGE_GROUP_VISIBILITY_PREFIX = 'HB_listPage_visibility_group';

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
			navItems    : <></>,
			reportError : null
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
			filterTags     : [],
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
			const newSortType = (this.state.sortType ?? (localStorage.getItem(USERPAGE_SORT_TYPE) || DEFAULT_SORT_TYPE));
			const newSortDir = (this.state.sortDir ?? (localStorage.getItem(USERPAGE_SORT_DIR) || DEFAULT_SORT_DIR));
			this.updateUrl(this.state.filterString, newSortType, newSortDir);

			const brewCollection = this.props.brewCollection.map((brewGroup)=>{
				brewGroup.visible = (localStorage.getItem(`${USERPAGE_GROUP_VISIBILITY_PREFIX}_${brewGroup.class}`) ?? 'true')=='true';
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
			localStorage.setItem(`${USERPAGE_GROUP_VISIBILITY_PREFIX}_${brewGroup.class}`, `${brewGroup.visible}`);
		});
		localStorage.setItem(USERPAGE_SORT_TYPE, this.state.sortType);
		localStorage.setItem(USERPAGE_SORT_DIR, this.state.sortDir);
	},

	renderBrews : function(brews){
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		return _.map(brews, (brew, idx)=>{
			return <BrewItem brew={brew} key={idx} reportError={this.props.reportError} updateListFilter={ (tag)=>{ this.updateUrl(this.state.filterString, this.state.sortType, this.state.sortDir, tag); }}/>;
		});
	},

	sortBrewOrder : function(brew){
		if(!brew.title){brew.title = 'No Title';}
		const mapping = {
			'alpha'   : _.deburr(brew.title.trim().toLowerCase()),
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
		return <div className={`sort-option ${(this.state.sortType == sortValue ? 'active' : '')}`}>
			<button
				value={`${sortValue}`}
				onClick={this.state.sortType == sortValue ? this.handleSortDirChange : this.handleSortOptionChange}
			>
				{`${sortTitle}`}
			</button>
			{this.state.sortType == sortValue &&
				<i className={`sortDir fas ${this.state.sortDir == 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
			}
		  </div>;
	},

	handleFilterTextChange : function(e){
		this.setState({
			filterString : e.target.value,
		});
		this.updateUrl(e.target.value, this.state.sortType, this.state.sortDir);
		return;
	},

	updateUrl : function(filterTerm, sortType, sortDir, filterTag=''){
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);

		urlParams.set('sort', sortType);
		urlParams.set('dir', sortDir);

		let filterTags = urlParams.getAll('tag');
		if(filterTag != '') {
			if(filterTags.findIndex((tag)=>{return tag.toLowerCase()==filterTag.toLowerCase();}) == -1){
				filterTags.push(filterTag);
			} else {
				filterTags = filterTags.filter((tag)=>{ return tag.toLowerCase() != filterTag.toLowerCase(); });
			}
		}
		urlParams.delete('tag');
		// Add tags to URL in the order they were clicked
		filterTags.forEach((tag)=>{ urlParams.append('tag', tag); });
		// Sort tags before updating state
		filterTags.sort((a, b)=>{
			return a.indexOf(':') - b.indexOf(':') != 0 ? a.indexOf(':') - b.indexOf(':') : a.toLowerCase().localeCompare(b.toLowerCase());
		});

		this.setState({
			filterTags
		});

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

	renderTagsOptions : function(){
		if(this.state.filterTags?.length == 0) return;
		return <div className='tags-container'>
			{_.map(this.state.filterTags, (tag, idx)=>{
				const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
				return <span key={idx} className={matches[1]} onClick={()=>{ this.updateUrl(this.state.filterString, this.state.sortType, this.state.sortDir, tag); }}>{matches[2]}</span>;
			})}
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

			{this.renderFilterOption()}
		</div>;
	},

	getSortedBrews : function(brews){
		const testString = _.deburr(this.state.filterString).toLowerCase();

		brews = _.filter(brews, (brew)=>{
			// Filter by user entered text
			const brewStrings = _.deburr([
				brew.title,
				brew.description,
				brew.tags].join('\n')
				.toLowerCase());

			const filterTextTest = brewStrings.includes(testString);

			// Filter by user selected tags
			let filterTagTest = true;
			if(this.state.filterTags.length > 0){
				filterTagTest = Array.isArray(brew.tags) && this.state.filterTags?.every((tag)=>{
					return brew.tags.findIndex((brewTag)=>{
						return brewTag.toLowerCase() == tag.toLowerCase();
					}) >= 0;
				});
			}

			return filterTextTest && filterTagTest;
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
			{/*<style>@layer V3_5ePHB, bundle;</style>*/}
			<link href='/themes/V3/Blank/style.css' type='text/css' rel='stylesheet'/>
			<link href='/themes/V3/5ePHB/style.css' type='text/css' rel='stylesheet'/>
			{this.props.navItems}
			{this.renderSortOptions()}
			{this.renderTagsOptions()}

			<div className='content V3'>
				<div className='page'>
					{this.renderBrewCollection(this.state.brewCollection)}
				</div>
			</div>
		</div>;
	}
});

module.exports = ListPage;
