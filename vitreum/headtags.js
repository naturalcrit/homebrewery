import React, { useEffect } from 'react';

const obj2props = (obj) =>
	Object.entries(obj)
		.map(([k, v]) => `${k}="${v}"`)
		.join(' ');

let NamedTags = {};

const HeadComponents = {
	Meta(props) {
		const tag = `<meta ${obj2props(props)} />`;

		props.property || props.name
			? (NamedTags[props.property || props.name] = tag)
			: null;

		useEffect(() => {
			document
				.getElementsByTagName('head')[0]
				.insertAdjacentHTML('beforeend', Object.values(NamedTags).join('\n'));
		}, [NamedTags]);

		return null;
	},
};

export default HeadComponents;