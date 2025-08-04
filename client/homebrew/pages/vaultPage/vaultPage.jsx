/*eslint max-lines: ["warn", {"max": 400, "skipBlankLines": true, "skipComments": true}]*/
/*eslint max-params:["warn", { max: 10 }], */
require('./vaultPage.less');

const React = require('react');
const { useState, useEffect, useRef } = React;

const { Menubar, MenuItem, MenuSection, MenuDropdown, MenuRule } = require('client/components/menubar/Menubar.jsx');
const NewBrewItem = require('../../navbar/newbrew.navitem.jsx');
const VaultNavItem = require('../../navbar/vault.navitem.jsx');
const RecentNavItem = require('../../navbar/recent.navitem.jsx').both;
const Account = require('../../navbar/account.navitem.jsx');
const MainMenu = require('../../navbar/mainMenu.navitem.jsx');

const BrewItem      = require('../basePages/listPage/brewItem/brewItem.jsx');
const { SplitPane }     = require('client/components/splitPane/splitPane.jsx'); 
const ErrorIndex    = require('../errorPage/errors/errorIndex.js');

const VaultLogo = require('client/svg/theVault.svg.jsx');

import request from '../../utils/request-middleware.js';

const VaultPage = (props)=>{
	const [paneOrder, setPaneOrder] = useState([0,1]);
	const [pageState, setPageState] = useState(parseInt(props.query.page) || 1);

	const [sortState, setSort] = useState(props.query.sort || 'title');
	const [dirState, setdir] = useState(props.query.dir || 'asc');

	const [rendererSelected, setRendererSelected] = useState(true);

	const [itemLayout, setItemLayout]=useState('card');

	//Response state
	const [brewCollection, setBrewCollection] = useState(null);
	const [totalBrews, setTotalBrews]         = useState(null);
	const [searching, setSearching]           = useState(false);
	const [error, setError]                   = useState(null);

	const titleRef        = useRef(null);
	const authorRef       = useRef(null);
	const countRef        = useRef(null);
	const v3Ref           = useRef(null);
	const legacyRef       = useRef(null);
	const submitButtonRef = useRef(null);

	useEffect(()=>{
		disableSubmitIfFormInvalid();
		loadPage(pageState, true, props.query.sort, props.query.dir);
	}, []);

	const updateStateWithBrews = (brews, page)=>{
		setBrewCollection(brews || null);
		setPageState(parseInt(page) || 1);
		setSearching(false);
	};

	const updateUrl = (titleValue, authorValue, countValue, v3Value, legacyValue, page, sort, dir)=>{
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);

		urlParams.set('title', titleValue);
		urlParams.set('author', authorValue);
		urlParams.set('count', countValue);
		urlParams.set('v3', v3Value);
		urlParams.set('legacy', legacyValue);
		urlParams.set('page', page);
		urlParams.set('sort', sort);
		urlParams.set('dir', dir);

		url.search = urlParams.toString();
		window.history.replaceState(null, '', url.toString());
	};

	const performSearch = async (title, author, count, v3, legacy, page, sort, dir)=>{
		updateUrl(title, author, count, v3, legacy, page, sort, dir);

		const response = await request
			.get(`/api/vault?title=${title}&author=${author}&v3=${v3}&legacy=${legacy}&count=${count}&page=${page}&sort=${sort}&dir=${dir}`)
			.catch((error)=>{
				console.log('error at loadPage: ', error);
				setError(error);
				updateStateWithBrews([], 1);
			});

		if(response.ok)
			updateStateWithBrews(response.body.brews, page);
	};

	const loadTotal = async (title, author, v3, legacy)=>{
		setTotalBrews(null);

		const response = await request.get(`/api/vault/total?title=${title}&author=${author}&v3=${v3}&legacy=${legacy}`)
		.catch((error)=>{
			console.log('error at loadTotal: ', error);
			setError(error);
			updateStateWithBrews([], 1);
		});

		if(response.ok)
			setTotalBrews(response.body.totalBrews);
	};

	const loadPage = async (page, updateTotal, sort, dir)=>{
		if(!validateForm()) return;

		setSearching(true);
		setError(null);

		const title      = titleRef.current.value || '';
		const author     = authorRef.current.value || '';
		const count      = countRef.current.value || 10;
		const v3         = v3Ref.current.checked != false;
		const legacy     = legacyRef.current.checked != false;
		const sortOption = sort || 'title';
		const dirOption  = dir || 'asc';
		const pageProp   = page || 1;

		setSort(sortOption);
		setdir(dirOption);

		performSearch(title, author, count, v3, legacy, pageProp, sortOption, dirOption);

		if(updateTotal)
			loadTotal(title, author, v3, legacy);
	};



	const renderNavbar = ()=>{
		return (
			<Menubar id='navbar'>
				<MenuSection className='navSection'>
					<MainMenu />
					<MenuDropdown id='brewMenu' className='brew-menu' groupName='Brew' icon='fas fa-pen-fancy'>
						<NewBrewItem />
						<MenuRule />
						<MenuItem href={`/user/${encodeURI(global.account?.username)}`} color='purple' icon='fas fa-beer'>
							brews
						</MenuItem>
						<RecentNavItem />
					</MenuDropdown>
					<VaultNavItem />
				</MenuSection>

				<MenuSection className='navSection'>
					<Account />
				</MenuSection>
			</Menubar>
		);
	};

	const validateForm = ()=>{
		//form validity: title or author must be written, and at least one renderer set
		const isTitleValid      = titleRef.current.validity.valid && titleRef.current.value;
		const isAuthorValid     = authorRef.current.validity.valid && authorRef.current.value;
		(legacyRef.current.checked || v3Ref.current.checked) ? setRendererSelected(true) : setRendererSelected(false);

		const isFormValid = (isTitleValid || isAuthorValid) && rendererSelected;

		return isFormValid;
	};

	const disableSubmitIfFormInvalid = ()=>{
		submitButtonRef.current.disabled = !validateForm();
	};

	const renderForm = ()=>(
		<>
			<VaultLogo /><h1 className='sr-only'>The Vault</h1>
			<blockquote>“Reading brings us unknown friends.” <br />– Honoré Balzac</blockquote>
			<form
				id='vault-search-form'
				role='search'
				onSubmit={e=>{
					e.preventDefault();
					if(!submitButtonRef.current.disabled)
						loadPage(1, true);
				}}
			>
				<label>
					Title
					<input
						ref={titleRef}
						type='text'
						name='title'
						defaultValue={props.query.title || ''}
						onKeyUp={disableSubmitIfFormInvalid}
						pattern='.{3,}'
						title='At least 3 characters'
						placeholder='v3 Reference Document'
					/>
				</label>

				<label>
					Author
					<input
						ref={authorRef}
						type='text'
						name='author'
						pattern='.{1,}'
						defaultValue={props.query.author || ''}
						onKeyUp={disableSubmitIfFormInvalid}
						placeholder='Username'
					/>
				</label>

				<fieldset>
					<legend>Renderers</legend>
					<small className={rendererSelected ? null : 'invalid'}>(choose at least one)</small>
					<label>
						<input
							className='renderer'
							ref={v3Ref}
							type='checkbox'
							defaultChecked={props.query.v3 !== 'false'}
							onChange={disableSubmitIfFormInvalid}
						/>
						v3
					</label>

					<label>
						<input
							className='renderer'
							ref={legacyRef}
							type='checkbox'
							defaultChecked={props.query.legacy !== 'false'}
							onChange={disableSubmitIfFormInvalid}
						/>
						Legacy
					</label>

				</fieldset>
				

				<label>
					Results per page
					<select ref={countRef} name='count' defaultValue={props.query.count || 20}>
						<option value='10'>10</option>
						<option value='20'>20</option>
						<option value='40'>40</option>
						<option value='60'>60</option>
					</select>
				</label>

				<button
					id='searchButton'
					ref={submitButtonRef}
					type='submit'
				>
					Search
					<i
						className={searching ? 'fas fa-spin fa-spinner': 'fas fa-search'}
					/>
				</button>
			</form>
			<details>
				<summary>Tips & Tricks</summary>
				<ul>
					<li>
						Only <b>published</b> brews are searchable via this tool
					</li>
					<li>
						Usernames are case-sensitive
					</li>
					<li>
						Use <code>"word"</code> to match an exact string,
						and <code>-</code> to exclude words (at least one word must not be negated)
					</li>
					<li>
						Some common words like "a", "after", "through", "itself", "here", etc.,
						are ignored in searches. The full list can be found&nbsp;
						<a href='https://github.com/mongodb/mongo/blob/0e3b3ca8480ddddf5d0105d11a94bd4698335312/src/mongo/db/fts/stop_words_english.txt'>
							here
						</a>
					</li>
				</ul>
				<p>New features will be coming, such as filters and search by tags.</p>

			</details>
		</>
	);

	const renderSortOption = (optionTitle, optionValue)=>{
		const oppositeDir = dirState === 'asc' ? 'desc' : 'asc';

		return (
			<MenuItem id={`${optionTitle}-sort`} className='sort-option' role='radio'
				onClick={()=>loadPage(1, false, optionValue, oppositeDir)}
				aria-checked={sortState === optionValue ? true : false}
			>
				{optionTitle}
				{sortState === optionValue && (
					<>
						{' '}
						{dirState === 'asc'
							? <><span aria-hidden='true'>(asc)</span><span className='sr-only'>(ascending)</span></>  // showing different text for sighted/blind readers
							: <><span aria-hidden='true'>(desc)</span><span className='sr-only'>(descending)</span></>
						}
					</>
				)}
			</MenuItem>
		);
	};

	const renderDisplayOptions = (layout)=>{
		return <MenuItem role='radio' onClick={()=>setItemLayout(layout)}>{layout}</MenuItem>
	};

	const renderSortBar = ()=>{

		return (
			<Menubar id='list-toolbar'>
				<MenuSection id='sort-options'>
					{renderSortOption('Title', 'title', props.query.dir)}
					{renderSortOption('Created Date', 'createdAt', props.query.dir)}
					{renderSortOption('Updated Date', 'updatedAt', props.query.dir)}
					{renderSortOption('Views', 'views', props.query.dir)}
				</MenuSection>
				<MenuSection id='layout-options'>
					{renderDisplayOptions('card')}
					{renderDisplayOptions('list')}
				</MenuSection>
			</Menubar>
		);
	};

	const renderPaginationControls = ()=>{
		if(!brewCollection) return null;
		if(!totalBrews || totalBrews < 10) return null;

		const totalPages = Math.ceil(totalBrews / 20);

		let startPage, endPage;
		if(pageState <= 6) {
			startPage = 1;
			endPage = Math.min(totalPages, 10);
		} else if(pageState + 4 >= totalPages) {
			startPage = Math.max(1, totalPages - 9);
			endPage = totalPages;
		} else {
			startPage = pageState - 5;
			endPage = pageState + 4;
		}

		const pagesAroundCurrent = new Array(endPage - startPage + 1)
			.fill()
			.map((_, index)=>(
				<a
					key={startPage + index}
					className={`pageNumber ${pageState === startPage + index ? 'currentPage' : ''}`}
					onClick={()=>loadPage(startPage + index, false, sortState, dirState)}
				>
					{startPage + index}
				</a>
			));

		return (
			<div className='paginationControls'>
				<button
					className='previousPage'
					onClick={()=>loadPage(pageState - 1, false, sortState, dirState)}
					disabled={pageState === startPage}
				>
					<i className='fa-solid fa-chevron-left'></i>
				</button>
				<ol className='pages'>
					{startPage > 1 && (
						<a
							className='pageNumber firstPage'
							onClick={()=>loadPage(1, false, sortState, dirState)}
						>
							1 ...
						</a>
					)}
					{pagesAroundCurrent}
					{endPage < totalPages && (
						<a
							className='pageNumber lastPage'
							onClick={()=>loadPage(totalPages, false, sortState, dirState)}
						>
							... {totalPages}
						</a>
					)}
				</ol>
				<button
					className='nextPage'
					onClick={()=>loadPage(pageState + 1, false, sortState, dirState)}
					disabled={pageState === totalPages}
				>
					<i className='fa-solid fa-chevron-right'></i>
				</button>
			</div>
		);
	};

	const renderFoundBrews = ()=>{
		if(searching && !brewCollection) {
			return (
				<div className='foundBrews search-status'>
					<h3 className='searchAnim'>Searching</h3>
				</div>
			);
		}

		if(error) {
			console.log(error.codeName)
			// const errorText = ErrorIndex(error.HBErrorCode.toString()) || '';

			// return (
			// 	<div className='foundBrews noBrews'>
			// 		<h3>Error: {errorText}</h3>
			// 	</div>
			// );
		}

		if(!brewCollection) {
			return (
				<div className='foundBrews noBrews'>
					<h3>No search yet</h3>
				</div>
			);
		}

		if(brewCollection.length === 0) {
			return (
				<div className='foundBrews noBrews'>
					<h3>No brews found</h3>
				</div>
			);
		}

		return (
			<div id='results'>

				<div className='totalBrews'>
					{`Brews found: `}
					<div>{totalBrews}</div>
				</div>
				{renderPaginationControls()}
				<div className={`foundBrews ${itemLayout}-layout`}>
					{brewCollection.map((brew, index)=>{
						return (
							<BrewItem
								id={`brew-item-${index}`}
								brew={{ ...brew }}
								key={index}
								reportError={props.reportError}
								renderStorage={false}
								layout={itemLayout}
							/>
						);
					})}
				</div>
				{renderPaginationControls()}
			</div>
		);
	};

	return (
		<div className='sitePage vaultPage'>
			<link href='/themes/V3/Blank/style.css' rel='stylesheet' />
			<link href='/themes/V3/5ePHB/style.css' rel='stylesheet' />
			{renderNavbar()}
			<div className='content'>
				<SplitPane
					paneOrder={paneOrder}
					setPaneOrder={(order)=>setPaneOrder(order)}
					>
					<div id='search-panel'>{renderForm()}</div>
					<div id='results-panel'>
						{renderSortBar()}

						{renderFoundBrews()}
					</div>
				</SplitPane>
			</div>
		</div>
	);
};

module.exports = VaultPage;

// alternative quotes

// from Tamms @ discord
// "For those who are willing to make an effort, great miracles and wonderful treasures are in store."
// Isaac Bashevis Singer

// "There is more treasure in books than in all the pirates' loot on Treasure Island..."
// Walt Disney

// "The rose and thorn, the treasure and dragon, joy and sorrow, all mingle into one."
// Saadi

// "The dangers gather as the treasures rise."
// Samuel Johnson

// "Sometimes lost treasures can be reclaimed."
// Rebecca Wells
