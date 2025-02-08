require('./headerNav.less');

import * as React from 'react';
import * as _ from 'lodash';


const MAX_TEXT_LENGTH = 40;

const HeaderNav = React.forwardRef(({}, pagesRef)=>{

	const renderHeaderLinks = ()=>{
		if(!pagesRef.current) return;

		const selector = [
			'.pages > .page',									// All page elements, which by definition have IDs
			'.page:not(:has(.toc)) > [id]',						// All direct children of non-ToC .page with an ID (Legacy)
			'.page:not(:has(.toc)) > .columnWrapper > [id]',	// All direct children of non-ToC .page > .columnWrapper with an ID (V3)
			'.page:not(:has(.toc)) h2',							// All non-ToC H2 titles, like Monster frame titles
		];
		const elements = pagesRef.current.querySelectorAll(selector.join(','));
		if(!elements) return;
		const navList = [];

		// navList is a list of objects which have the following structure:
		// {
		// 		depth		: how deeply indented the item should be
		// 		text		: the text to display in the nav link
		// 		link		: the hyperlink to navigate to when clicked
		// 		className	: [optional] the class to apply to the nav link for styling
		// }

		elements.forEach((el)=>{
			if(el.className.match(/\bpage\b/)) {
				let text = `Page ${el.id.slice(1)}`;	// The ID of a page *should* always be equal to `p` followed by the page number
				if(el.querySelector('.toc')){			// If the page contains a table of contents, add "- Contents" to the display text
					text += ' - Contents';
				};
				navList.push({
					depth     : 0,						// Pages are always at the least indented level
					text      : text,
					link      : el.id,
					className : 'pageLink'
				});
				return;
			}
			if(el.localName.match(/^h[1-6]/)){			// Header elements H1 through H6
				navList.push({
					depth : el.localName[1],			// Depth is set by the header level
					text  : el.textContent,				// Use `textContent` because `innerText` is affected by rendering, e.g. 'content-visibility: auto'
					link  : el.id
				});
				return;
			}
			navList.push({
				depth : 7,								// All unmatched elements with IDs are set to the maximum depth (7)
				text  : el.textContent,					// Use `textContent` because `innerText` is affected by rendering, e.g. 'content-visibility: auto'
				link  : el.id
			});
		});

		return _.map(navList, (navItem, index)=>{
			return <HeaderNavItem {...navItem} key={index} />;
		});

	};

	return <nav className='headerNav'>
		<ul>
			{renderHeaderLinks()}
		</ul>
	</nav>;
}
);

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