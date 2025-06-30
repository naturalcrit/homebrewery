require('./headerNav.less');

import * as React from 'react';
import * as _ from 'lodash';

const MAX_TEXT_LENGTH = 40;

const HeaderNav = React.forwardRef(({}, pagesRef)=>{

	const renderHeaderLinks = ()=>{
		if(!pagesRef.current) return;

		// Top Level Pages
		// Pages that contain an element with a specified class (e.g. cover pages, table of contents)
		// will NOT have its content scanned for navigation headers, instead displaying a custom label
		// ---
		// The property name is class that will be used for detecting the page is a top level page
		// The property value is a function that returns the text to be used

		const topLevelPages = {
			'.frontCover'  : (el, pageType)=>{ const text = getHeaderContent(el); return text ? `Cover: ${text}` : 'Cover Page'; },
			'.insideCover' : (el, pageType)=>{ const text = getHeaderContent(el); return text ? `Interior: ${text}` : 'Interior Cover Page'; },
			'.partCover'   : (el, pageType)=>{ const text = getHeaderContent(el); return text ? `Section: ${text}` : 'Section Cover Page'; },
			'.backCover'   : (el, pageType)=>{ const text = getHeaderContent(el); return text ? `Back: ${text}` : 'Rear Cover Page'; },
			'.toc'         : ()=>{ return 'Table of Contents'; },
		};

		const getHeaderContent = (el)=>el.querySelector('h1')?.textContent;

		const topLevelPageSelector = Object.keys(topLevelPages).join(',');

		const selector = [
			'.pages > .page',                                                   // All page elements, which by definition have IDs
			`.page:not(:has(${topLevelPageSelector})) > [id]`,                  // All direct children of non-excluded .pages with an ID (Legacy)
			`.page:not(:has(${topLevelPageSelector})) > .columnWrapper > [id]`, // All direct children of non-excluded .page > .columnWrapper with an ID (V3)
			`.page:not(:has(${topLevelPageSelector})) h2`,                      // All non-excluded H2 titles, like Monster frame titles
		];
		const elements = pagesRef.current.querySelectorAll(selector.join(','));
		if(!elements) return;
		const navList = [];

		// navList is a list of objects which have the following structure:
		// {
		// 	depth     : how deeply indented the item should be
		// 	text      : the text to display in the nav link
		// 	link      : the hyperlink to navigate to when clicked
		// 	className : [optional] the class to apply to the nav link for styling
		// }

		elements.forEach((el)=>{
			const navEntry = {        // Default structure of a navList entry
				depth : 7,              // All unmatched elements with IDs are set to the maximum depth (7)
				text  : el.textContent, // Use `textContent` because `innerText` is affected by rendering, e.g. 'content-visibility: auto'
				link  : el.id
			};
			if(el.classList.contains('page')) {
				let text = `Page ${el.id.slice(1)}`; // Get the page # by trimming off the 'p' from the ID
				const pageType = Object.keys(topLevelPages).find((pageType)=>el.querySelector(pageType));
				if(pageType)
					text += ` - ${topLevelPages[pageType](el, pageType)}`; // If a Top Level Page, add extra label

				navEntry.depth     = 0; // Pages are always at the least indented level
				navEntry.text      = text;
				navEntry.className = 'pageLink';
			} else if(el.localName.match(/^h[1-6]/)){  // Header elements H1 through H6
				navEntry.depth = el.localName[1];      // Depth is set by the header level
			}
			navList.push(navEntry);
		});

		return _.map(navList, (navItem, index)=><HeaderNavItem {...navItem} key={index} />
		);
	};

	return <nav className='headerNav'>
		<ul>
			{renderHeaderLinks()}
		</ul>
	</nav>;
});

const HeaderNavItem = ({ link, text, depth, className })=>{

	const trimString = (text, prefixLength = 0)=>{
		// Sanity check nav link strings
		let output = text;

		// If the string has a line break, only use the first line
		if(text.indexOf('\n')){
			output = text.split('\n')[0];
		}

		// Trim unecessary spaces from string
		output = output.trim();

		// Reduce excessively long strings
		const maxLength = MAX_TEXT_LENGTH - prefixLength;
		if(output.length > maxLength){
			return `${output.slice(0, maxLength).trim()}...`;
		}
		return output;
	};

	if(!link || !text) return;

	return <li>
		<a href={`#${link}`} target='_self' className={`depth-${depth} ${className ?? ''}`}>
			{trimString(text, depth)}
		</a>
	</li>;
};

export default HeaderNav;