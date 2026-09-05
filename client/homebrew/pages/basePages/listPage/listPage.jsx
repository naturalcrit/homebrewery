/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
import './listPage.less';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import moment from 'moment';
import _ from 'lodash';

import BrewItem from './brewItem/brewItem.jsx';

const USERPAGE_SORT_DIR = 'HB_listPage_sortDir';
const USERPAGE_SORT_TYPE = 'HB_listPage_sortType';
const USERPAGE_GROUP_VISIBILITY_PREFIX = 'HB_listPage_visibility_group';

const DEFAULT_SORT_TYPE = 'alpha';
const DEFAULT_SORT_DIR = 'asc';

const ListPage = ({ brewCollection = [{ title: '', class: '', brews: [] }], navItems = <></>, reportError = null, query })=>{
	const [filterString, setFilterString] = useState(query?.filter || '');
	const [filterTags, setFilterTags] = useState([]);
	const [sortType, setSortType] = useState(query?.sort || null);
	const [sortDir, setSortDir] = useState(query?.dir || null);
	const [groupVisibility, setGroupVisibility] = useState({});
	const [layoutMode, setLayoutMode] = useState('grid');

	const groupVisibilityRef = useRef(groupVisibility);
	const sortTypeRef = useRef(sortType);
	const sortDirRef = useRef(sortDir);

	useEffect(()=>{
		groupVisibilityRef.current = groupVisibility;
	}, [groupVisibility]);

	useEffect(()=>{
		sortTypeRef.current = sortType;
	}, [sortType]);

	useEffect(()=>{
		sortDirRef.current = sortDir;
	}, [sortDir]);

	useEffect(()=>{
		window.onbeforeunload = saveToLocalStorage;
		if(typeof window === 'undefined') return;

		const newSortType = sortType ?? (localStorage.getItem(USERPAGE_SORT_TYPE) || DEFAULT_SORT_TYPE);
		const newSortDir = sortDir ?? (localStorage.getItem(USERPAGE_SORT_DIR) || DEFAULT_SORT_DIR);
		updateUrl(filterString, newSortType, newSortDir);

		const namedBrewCollection = brewCollection.reduce((visibility, brewGroup)=>{
			visibility[brewGroup.class] = (localStorage.getItem(`${USERPAGE_GROUP_VISIBILITY_PREFIX}_${brewGroup.class}`) ?? 'true') == 'true';
			return visibility;
		}, {});

		setGroupVisibility(namedBrewCollection);
		setSortType(newSortType);
		setSortDir(newSortDir);

		return ()=>{
			window.onbeforeunload = null;
		};
	}, []);

	const saveToLocalStorage = ()=>{
		brewCollection.forEach((brewGroup)=>{
			localStorage.setItem(`${USERPAGE_GROUP_VISIBILITY_PREFIX}_${brewGroup.class}`, `${groupVisibilityRef.current[brewGroup.class]}`);
		});
		localStorage.setItem(USERPAGE_SORT_TYPE, sortTypeRef.current);
		localStorage.setItem(USERPAGE_SORT_DIR, sortDirRef.current);
	};

	const renderBrews = (brews)=>{
		if(!brews || !brews.length) return <div className='noBrews'>No Brews.</div>;

		return _.map(brews, (brew, idx)=>(
			<BrewItem
				brew={brew}
				key={idx}
				reportError={reportError}
				updateListFilter={(tag)=>{
					updateUrl(filterString, sortType, sortDir, tag);
				}}
			/>
		));
	};

	const sortBrewOrder = (brew)=>{
		const title = brew.title || 'No Title';
		const mapping = {
			'alpha'   : _.deburr(title.trim().toLowerCase()),
			'created' : moment(brew.createdAt).format(),
			'updated' : moment(brew.updatedAt).format(),
			'views'   : brew.views,
			'latest'  : moment(brew.lastViewed).format(),
		};
		return mapping[sortType];
	};

	const handleSortOptionChange = (event)=>{
		updateUrl(filterString, event.target.value, sortDir);
		setSortType(event.target.value);
	};

	const handleSortDirChange = (event)=>{
		const newDir = sortDir == 'asc' ? 'desc' : 'asc';

		updateUrl(filterString, sortType, newDir);
		setSortDir(newDir);
	};

	const renderSortOption = (sortTitle, sortValue)=>{
		return (
			<div className={`sort-option ${sortType == sortValue ? 'active' : ''}`}>
				<button value={`${sortValue}`} onClick={sortType == sortValue ? handleSortDirChange : handleSortOptionChange}>
					{`${sortTitle}`}
				</button>
				{sortType == sortValue && <i className={`sortDir fas ${sortDir == 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>}
			</div>
		);
	};

	const handleFilterTextChange = (e)=>{
		setFilterString(e.target.value);
		updateUrl(e.target.value, sortType, sortDir);
		return;
	};

	const updateUrl = (filterTerm, sortType, sortDir, filterTag = '')=>{
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);

		urlParams.set('sort', sortType);
		urlParams.set('dir', sortDir);

		let filterTags = urlParams.getAll('tag');
		if(filterTag != '') {
			if(
				filterTags.findIndex((tag)=>{
					return tag.toLowerCase() == filterTag.toLowerCase();
				}) == -1
			) {
				filterTags.push(filterTag);
			} else {
				filterTags = filterTags.filter((tag)=>{
					return tag.toLowerCase() != filterTag.toLowerCase();
				});
			}
		}
		urlParams.delete('tag');
		// Add tags to URL in the order they were clicked
		filterTags.forEach((tag)=>urlParams.append('tag', tag));
		// Sort tags before updating state
		filterTags.sort((a, b)=>{
			return a.indexOf(':') - b.indexOf(':') != 0 ? a.indexOf(':') - b.indexOf(':') : a.toLowerCase().localeCompare(b.toLowerCase());
		});

		setFilterTags(filterTags);

		if(!filterTerm) urlParams.delete('filter');
		else urlParams.set('filter', filterTerm);

		url.search = urlParams;
		window.history.replaceState(null, null, url);
	};

	const renderFilterOption = ()=>{
		return (
			<div className='filter-option'>
				<label>
					<i className='fas fa-search'></i>
					<input type='search' placeholder='filter title/description' onChange={handleFilterTextChange} value={filterString} />
				</label>
			</div>
		);
	};

	const renderTagsOptions = ()=>{
		if(filterTags?.length == 0) return;
		return (
			<div className='tags-container'>
				{_.map(filterTags, (tag, idx)=>{
					const matches = tag.match(/^(?:([^:]+):)?([^:]+)$/);
					return (
						<span
							key={idx}
							className={matches[1]}
							onClick={()=>{
								updateUrl(filterString, sortType, sortDir, tag);
							}}>
							{matches[2]}
						</span>
					);
				})}
			</div>
		);
	};

	const renderSortOptions = ()=>{
		return (
			<div className='sort-container'>
				<h6>Sort by :</h6>
				{renderSortOption('Title', 'alpha')}
				{renderSortOption('Created Date', 'created')}
				{renderSortOption('Updated Date', 'updated')}
				{renderSortOption('Views', 'views')}
				{/* {renderSortOption('Latest', 'latest')} */}
				{renderFilterOption()}
			</div>
		);
	};

	const getSortedBrews = (brews)=>{
		const testString = _.deburr(filterString).toLowerCase();

		brews = _.filter(brews, (brew)=>{
			// Filter by user entered text
			const brewStrings = _.deburr([brew.title, brew.description, brew.tags].join('\n').toLowerCase());
			const filterTextTest = brewStrings.includes(testString);

			// Filter by user selected tags
			let filterTagTest = true;
			if(filterTags.length > 0) {
				filterTagTest =
					Array.isArray(brew.tags) &&
					filterTags?.every((tag)=>{
						return (
							brew.tags.findIndex((brewTag)=>{
								return brewTag.toLowerCase() == tag.toLowerCase();
							}) >= 0
						);
					});
			}

			return filterTextTest && filterTagTest;
		});

		return _.orderBy(
			brews,
			(brew)=>{
				return sortBrewOrder(brew);
			},
			sortDir,
		);
	};

	const sortedBrewCollection = useMemo(()=>{
		return brewCollection.map((brewGroup)=>({ ...brewGroup, brews: getSortedBrews(brewGroup.brews) }));
	}, [brewCollection, filterString, filterTags, sortType, sortDir]);

	const toggleBrewCollectionState = (brewGroupClass)=>{
		setGroupVisibility((prevVisibility)=>({ ...prevVisibility, [brewGroupClass]: !prevVisibility[brewGroupClass] }));
	};

	const renderBrewCollection = (brewCollection)=>{
		if(brewCollection.length === 0)
			return (
				<div className='brewCollection'>
					<h1>No Brews</h1>
				</div>
			);
		return _.map(brewCollection, (brewGroup, idx)=>{
			const sortedBrewGroup = sortedBrewCollection[idx];
			const visible = groupVisibility[brewGroup.class];

			return (<>
				<h1
					className={visible ? 'active' : 'inactive'}
					onClick={()=>{
						toggleBrewCollectionState(brewGroup.class);
					}}>
					{brewGroup.title || 'No Title'}
				</h1>
				<div key={idx} className={`brewGroup ${brewGroup.class ?? ''} ${layoutMode}`}>

					{visible ? renderBrews(sortedBrewGroup.brews) : <></>}
				</div>
			</>);
		});
	};

	const handleLayoutChange = (e, mode)=>{
		setLayoutMode(e.target.checked ? mode : 'grid');
		return;
	};

	const renderLayoutModeOptions = ()=>{
		return (
			<div className='layout-container'>
				<div className='layout-option' title='grid'>
					<label>
						<i className='fas fa-grip'></i>
						<input name='layout-mode' type='radio' onChange={(e)=>handleLayoutChange(e, 'grid')} checked={layoutMode === 'grid'} />
					</label>
				</div>
				<div className='layout-option' title='list'>
					<label>
						<i className='fas fa-grip'></i>
						<input name='layout-mode' type='radio' onChange={(e)=>handleLayoutChange(e, 'list')} checked={layoutMode === 'list'} />
					</label>
				</div>
				<div className='layout-option' title='card'>
					<label>
						<i className='fas fa-table'></i>
						<input name='layout-mode' type='radio' onChange={(e)=>handleLayoutChange(e, 'card')} checked={layoutMode === 'card'} />
					</label>
				</div>
			</div>
		);
	};

	return (
		<div className='listPage sitePage'>
			{navItems}
			{renderSortOptions()}
			{renderTagsOptions()}
			{renderLayoutModeOptions()}

			<div className='content V3'>
				<div className='brewCollection'>{renderBrewCollection(brewCollection)}</div>
			</div>
		</div>
	);
};

export default ListPage;
