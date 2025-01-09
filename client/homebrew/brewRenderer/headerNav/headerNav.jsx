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

		elements.forEach((el)=>{
			if(el.className.match(/\bpage\b/)) {
				let text = `Page ${el.id.slice(1)}`;
				if(el.querySelector('.toc')){
					text += ' - Contents';
				};
				navList.push({
					depth     : 0,
					text      : text,
					link      : el.id,
					className : 'pageLink'
				});
				return;
			}
			if(el.localName.match(/^h[1-6]/)){
				navList.push({
					depth : el.localName[1],
					text  : el.textContent,
					link  : el.id
				});
				return;
			}
			navList.push({
				depth : 7,
				text  : el.textContent,
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
		let output = text;

		if(text.indexOf('\n')){
			output = text.split('\n')[0];
		}

		output = output.trim();

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