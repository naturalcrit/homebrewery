// Shared helpers for block manifests.
//
// Importing this module is the only thing manifests are allowed to do that
// reaches outside their own file (other than reading the renderer's Inline
// component). Anything heavier indicates the abstraction is leaking.

// ---- inline runs <-> PM text fragments -----------------------------------

const KNOWN_INLINE_MARKS = new Set(['strong', 'em', 'underline', 'link', 'code', 'color']);

/**
 * Convert an array of inline runs (plain strings or { text, marks, ... } objs)
 * into a list of PM text nodes ready to be passed as children of a block.
 */
export function runsToPmInline(runs, schema){
	if(!runs) return [];
	if(typeof runs === 'string') return runs ? [schema.text(runs)] : [];
	const out = [];
	for (const r of runs){
		const text = typeof r === 'string' ? r : (r.text || '');
		if(!text) continue;
		const marks = [];
		const runMarks = (typeof r === 'string') ? [] : (r.marks || []);
		for (const m of runMarks){
			if(!KNOWN_INLINE_MARKS.has(m)) continue;
			const type = schema.marks[m];
			if(!type) continue;
			if(m === 'link') marks.push(type.create({ href: r.href || '', title: r.title || null }));
			else if(m === 'color') marks.push(type.create({ color: r.color || '' }));
			else marks.push(type.create());
		}
		out.push(schema.text(text, marks));
	}
	return out;
}

/**
 * Convert a PM block node's children back into an array of AST inline runs.
 */
export function pmInlineToRuns(node){
	const out = [];
	node.forEach((child)=>{
		if(!child.isText) return;
		const marks = [];
		let href, title, color;
		for (const m of child.marks){
			marks.push(m.type.name);
			if(m.type.name === 'link'){
				href = m.attrs.href;
				title = m.attrs.title;
			} else if(m.type.name === 'color'){
				color = m.attrs.color;
			}
		}
		const run = { text: child.text };
		if(marks.length) run.marks = marks;
		if(href !== undefined) run.href = href;
		if(title) run.title = title;
		if(color !== undefined) run.color = color;
		out.push(run);
	});
	return out;
}

// ---- plain-text helpers used by atom NodeViews ---------------------------

export function inlineRunsToPlainText(runs){
	if(!runs) return '';
	if(typeof runs === 'string') return runs;
	return runs.map((r)=>(typeof r === 'string' ? r : (r.text || ''))).join('');
}

export function plainTextToRuns(text){
	return text ? [{ text }] : [];
}

// ---- markdown emit helpers -----------------------------------------------

/**
 * Flatten an inline run array to its visible markdown source. Strong/em are
 * emitted; complex marks (link, color, code) round-trip but only the basic
 * couple are needed for Wave 4's import/export contributors.
 */
export function runsToMarkdown(runs){
	if(!runs) return '';
	if(typeof runs === 'string') return runs;
	return runs.map((r)=>{
		if(typeof r === 'string') return r;
		const marks = r.marks || [];
		let s = r.text || '';
		if(marks.includes('strong') && marks.includes('em')) s = `***${s}***`;
		else if(marks.includes('strong')) s = `**${s}**`;
		else if(marks.includes('em')) s = `*${s}*`;
		if(marks.includes('underline')) s = `__${s}__`;
		if(marks.includes('link')) s = `[${s}](${r.href || ''})`;
		if(marks.includes('code')) s = `\`${s}\``;
		return s;
	}).join('');
}
