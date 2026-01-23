import React, { useEffect } from "react";
import injectTag from "./injectTag.js";

const obj2props = (obj) =>
	Object.entries(obj)
		.map(([k, v]) => `${k}="${v}"`)
		.join(" ");
const toStr = (chld) => (Array.isArray(chld) ? chld.join("") : chld);
const onServer = typeof window === "undefined";

let NamedTags = {};
let UnnamedTags = [];

export const HeadComponents = {
	Title({ children }) {
		if (onServer) NamedTags.title = `<title>${toStr(children)}</title>`;
		useEffect(() => {
			document.title = toStr(children);
		}, [children]);
		return null;
	},
	Favicon({ type = "image/png", href = "", rel = "icon", id = "favicon" }) {
		if (onServer) NamedTags.favicon = `<link rel='shortcut icon' type="${type}" id="${id}" href="${href}" />`;
		useEffect(() => {
			document.getElementById(id).href = href;
		}, [id, href]);
		return null;
	},
	Description({ children }) {
		if (onServer) NamedTags.description = `<meta name='description' content='${toStr(children)}' />`;
		return null;
	},
	Noscript({ children }) {
		if (onServer) UnnamedTags.push(`<noscript>${toStr(children)}</noscript>`);
		return null;
	},
	Script({ children = [], ...props }) {
		if (onServer) {
			UnnamedTags.push(
				children.length
					? `<script ${obj2props(props)}>${toStr(children)}</script>`
					: `<script ${obj2props(props)} />`,
			);
		}
		return null;
	},
	Meta(props) {
		let tag = `<meta ${obj2props(props)} />`;
		props.property || props.name ? (NamedTags[props.property || props.name] = tag) : UnnamedTags.push(tag);
		useEffect(() => {
			document
				.getElementsByTagName("head")[0]
				.insertAdjacentHTML("beforeend", Object.values(NamedTags).join("\n"));
		}, [NamedTags]);
		return null;
	},
	Style({ children, type = "text/css" }) {
		if (onServer) UnnamedTags.push(`<style type="${type}">${toStr(children)}</style>`);
		return null;
	},
};

export const Inject = ({ tag, children, ...props }) => {
	useEffect(() => {
		injectTag(tag, props, children);
	}, []);
	return null;
};

export const generate = () => Object.values(NamedTags).concat(UnnamedTags).join("\n");

export const flush = () => {
	NamedTags = {};
	UnnamedTags = [];
};

export default {
	Inject,
	...HeadComponents,
	generate,
	flush,
};
