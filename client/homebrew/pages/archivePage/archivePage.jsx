require('./archivePage.less');

const React       = require('react');
const createClass = require('create-react-class');
const _           = require('lodash');
const cx          = require('classnames');

const Nav           = require('naturalcrit/nav/nav.jsx');
const Navbar        = require('../../navbar/navbar.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account       = require('../../navbar/account.navitem.jsx');
const NewBrew       = require('../../navbar/newbrew.navitem.jsx');
const HelpNavItem   = require('../../navbar/help.navitem.jsx');
const BrewItem      = require('../basePages/listPage/brewItem/brewItem.jsx');

const request = require('../../utils/request-middleware.js');

const ArchivePage = createClass({
	displayName     : 'ArchivePage',
	getDefaultProps : function () {
		return {};
	},
	getInitialState : function () {
		return {
			title          : this.props.query.title || '',
			brewCollection : null,
			page           : 1,
			pageSize	   : 10,
			totalPages     : 1,
			totalBrews	   : 0,
			searching      : false,
			error          : null,
		};
	},
	componentDidMount : function() {

	},
	handleChange(inputName, e) {

		this.setState({ [inputName]: e.target.value });
	},

	updateStateWithBrews : function (brews, page, totalPages, totalBrews) {
		this.setState({
			brewCollection : brews || null,
			page           : page || 1,
			totalPages     : totalPages || 1,
			totalBrews	   : totalBrews,
			searching      : false
		});
	},

	loadPage : async function(page) {
    	this.updateUrl();
		try {
			this.setState({ searching: true, error: null });
			const title = encodeURIComponent(this.state.title);
			const size = parseInt(this.state.pageSize);
			await request.get(`/api/archive?title=${title}&page=${page}&size=${size}`)
                  .then((response)=>{
                  	if(response.ok) {
                  		this.updateStateWithBrews(response.body.brews, page, response.body.totalPages, response.body.totalBrews);
                  	}
                  });
		} catch (error) {
			console.log(`LoadPage error: ${error}`);
			this.setState({ error: `${error}` });
			this.updateStateWithBrews([], 1, 1);
		}
	},

	updateUrl : function() {
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);
		
		urlParams.set('title', this.state.title);
		urlParams.set('page', this.state.page);

		url.search = urlParams.toString(); // Convert URLSearchParams to string
		window.history.replaceState(null, null, url);
	},

	renderPaginationControls() {
		const { title, brewCollection, page, totalPages, error } = this.state;
		const pages = new Array(totalPages).fill().map((_, index) => (
			<li key={index} className={`pageNumber ${page === index + 1 ? 'currentPage' : ''}`} onClick={() => this.loadPage(index+1)}>{index + 1}</li>
		));
	
		return (
		  	<div className="paginationControls">
				{page > 1 && (
			  		<button
						className="previousPage"
						onClick={() => this.loadPage(page - 1)}
			  		>
						&lt;&lt;
			  		</button>
				)}
				<ol className='pages'>{pages}</ol>
				{page < totalPages && (
			  		<button className="nextPage" onClick={() => this.loadPage(page + 1)}>
						&gt;&gt;
			  		</button>
				)}
		  </div>
		);
	},

	renderFoundBrews() {
		const { title, brewCollection, page, totalPages, error } = this.state;

		if(title === '') {return (<div className='foundBrews noBrews'><h3>Whenever you want, just start typing...</h3></div>);}

		if(error === 'Error: Service Unavailable') {
			return (
				<div className='foundBrews noBrews'>
					<div><h3>I'm sorry, your request didn't work</h3>
						<br /><p>Your search is not specific enough. Too many brews meet this criteria for us to display them.</p>
					</div></div>
			);
		}

		if(!brewCollection || brewCollection.length === 0 || error === 'Error: Not found') {
			return (
				<div className='foundBrews noBrews'>
					<h3>We haven't found brews meeting your request.</h3>
				</div>
			);
		}

		return (
			<div className='foundBrews'>
				<span className='totalBrews'>Brews found: {this.state.totalBrews}</span>
				{brewCollection.map((brew, index)=>(
					<BrewItem brew={brew} key={index} reportError={this.props.reportError} />
				))}
				{this.renderPaginationControls()}
			</div>
		);
	},


	renderForm : function () {
		return (
			<div className='brewLookup'>
				<h2 className='formTitle'>Brew Lookup</h2>
				<div className="formContents">
					<label>
						Title of the brew 
						<input
							type='text'
							name='title'
							value={this.state.title}
							onChange={(e) => this.handleChange('title', e)}
                    		onKeyDown={(e) => {
                        		if (e.key === 'Enter') {
                            		this.handleChange('title', e);
                            		this.loadPage(1);
                        		}
                    		}}
							placeholder='v3 Reference Document'
						/>
					</label>
				
					<label>
						Results per page
						<input
							type="number"
							min="6"step="2"max="30"
							name="pageSize"
							onChange={(e) => this.handleChange('pageSize', e)}
						/>
					</label>
					{/* In the future, we should be able to filter the results by adding tags.
            		<label>Tags</label><input type='text' value={this.state.query} placeholder='add a tag to filter'/>
            		<input type="checkbox" id="v3" /><label>v3 only</label>
            		*/}

					<button
						className='search'
						onClick={()=>{ 
							this.handleChange('title', { target: { value: this.state.title } });
							this.loadPage(1);
						}}>
						Search
						<i
							className={cx('fas', {
							'fa-search'          : !this.state.searching,
							'fa-spin fa-spinner' : this.state.searching,
							})}
						/>
					</button>
				</div>
			</div>
		);
	},



	renderNavItems : function () {
		return (
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>Archive: Search for brews</Nav.item>
				</Nav.section>
				<Nav.section>
					<NewBrew />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>
		);
	},

	render : function () {
		return (
			<div className='archivePage'>
				<link href='/themes/V3/Blank/style.css' rel='stylesheet'/>
			  <link href='/themes/V3/5ePHB/style.css' rel='stylesheet'/>
				{this.renderNavItems()}

				<div className='content'>
					<div className='welcome'>
						<h1>Welcome to the Archive</h1>
					</div>
					<div className='flexGroup'>
						<div className='form dataGroup'>{this.renderForm()}</div>
						<div className='resultsContainer dataGroup'>
							<div className='title'>
								<h2>Your results, my lordship</h2>
							</div>
							{this.renderFoundBrews()}
						</div>
					</div>
				</div>
			</div>
		);
	},
});

module.exports = ArchivePage;
