const React = require('react');

const obj2props = (obj)=>Object.entries(obj).map(([k, v])=>`${k}="${v}"`).join(' ');
const toStr = (chld)=>Array.isArray(chld) ? chld.join('') : chld;
const onServer = (typeof window === 'undefined');

let NamedTags = {};
let UnnamedTags = [];


const HeadComponents = {
	Title({ children }){
		if(onServer) NamedTags.title = `<title>${toStr(children)}</title>`;
		React.useEffect(()=>{document.title = toStr(children);}, [children]);
		return null;
	},
	Favicon({ type = 'image/png', href = '', rel='icon', id= 'favicon' }){
		if(onServer) NamedTags.favicon = `<link rel='shortcut icon' type="${type}" id="${id}" href="${href}" />`;
		React.useEffect(()=>{document.getElementById(id).href=href;}, [id, href]);
		return null;
	},

	Description({ children }){
		if(onServer) NamedTags.description = `<meta name='description' content='${toStr(children)}' />`;
		return null;
	},

	Noscript({ children }){
		if(onServer) UnnamedTags.push(`<noscript>${toStr(children)}<\/noscript>`);
		return null;
	},
	Script({ children=[], ...props }){
		if(onServer) {
			UnnamedTags.push(children.length
				? `<script ${obj2props(props)}>${toStr(children)}\<\/script>`
				: `<script ${obj2props(props)} />`
			);
		}
		return null;
	},
	Meta(props) {
		if(onServer) {}
		const tag = `<meta ${obj2props(props)} />`;
		props.property || props.name ? NamedTags[props.property || props.name] = tag : UnnamedTags.push(tag);
		React.useEffect(()=>{
			document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', Object.values(NamedTags).join('\n'));
		}, [NamedTags]);
		return null;
	},
	Style({ children, type='text/css' }){
		if(onServer) UnnamedTags.push(`<style type="${type}">${toStr(children)}</style>`);
		return null;
	}
};

const Inject = ({ tag, children, ...props })=>{
	React.useEffect(()=>{
		injectTag(tag, props, children);
	}, []);
	return null;
};

const injectTag = (tag, props, children)=>{
	const injectNode = document.createElement(tag);
	Object.entries(props).map(([key, val])=>injectNode[key]=val);
	if(children) injectNode.appendChild(document.createTextNode(children));
	document.getElementsByTagName('head')[0].appendChild(injectNode);
};


module.exports = {
	Inject,
	...HeadComponents,
	generate : ()=>Object.values(NamedTags).concat(UnnamedTags).join('\n'),
	flush    : ()=>{
		NamedTags = {};
		UnnamedTags = [];
	}
};
