import React from 'react';

// Renders a flat array of { text, marks } runs as a fragment of <strong>/<em>/
// <u>/<a>/text nodes. Marks compose by nesting in a deterministic order so that,
// e.g., emStrong always produces <em><strong>...</strong></em>.

const MARK_ORDER = ['link', 'em', 'strong', 'underline'];

function wrap(node, mark, run) {
	switch (mark) {
		case 'strong':    return <strong>{node}</strong>;
		case 'em':        return <em>{node}</em>;
		case 'underline': return <u>{node}</u>;
		case 'link':      return <a href={run.href || '#'}>{node}</a>;
		default:          return node;
	}
}

function renderRun(run, key) {
	const marks = run.marks || [];
	let node = run.text;
	for (const mark of MARK_ORDER) {
		if (marks.includes(mark)) node = wrap(node, mark, run);
	}
	return <React.Fragment key={key}>{node}</React.Fragment>;
}

export default function Inline({ runs }) {
	if (!runs) return null;
	if (typeof runs === 'string') return runs;
	return runs.map((run, i)=>renderRun(run, i));
}
