import React from 'react';
import Block from './Block.jsx';

// One physical page. The canonical PHB stylesheet styles `.page` itself
// (column flow, parchment background, footer ornament). We only emit the
// matching DOM and a page number node.

export default function Page({ page, number }) {
	return (
		<div className='page' id={`p${number}`}>
			{page.blocks.map((block, i)=><Block key={i} block={block} />)}
			<div className='pageNumber'>{number}</div>
		</div>
	);
}
