// Markdown export orchestrator.
//
// Walks the AST (pages → blocks) and asks each block manifest's
// `exportMarkdown(node)` contributor for its rendered slice. The orchestrator's
// job is purely structural:
//   - emit a YAML-style front-matter header from `document.metadata`
//   - separate blocks within a page with blank lines (so paragraphs and
//     headings don't visually run together)
//   - inject a single `\page` marker between authored pages
//   - sanitize control characters that would corrupt the output (e.g. an
//     embedded LF or CR inside a stat-block field would otherwise terminate
//     the line and mis-align the importer)
//
// Block manifests stay ignorant of pages and document structure. Each
// contributor returns its own multi-line markdown chunk; the orchestrator
// stitches them.

import { exporters } from '../blocks/registry.js';

const FRONT_MATTER_KEYS = ['title', 'author', 'theme', 'pageSize'];

// Strip ASCII control characters except TAB. Done via charCodeAt so the source
// file stays free of raw control bytes.
function sanitizeLine(s){
	if(typeof s !== 'string') return s;
	let out = '';
	for (let i = 0; i < s.length; i++){
		const c = s.charCodeAt(i);
		if(c === 9) out += s[i];               // tab is fine
		else if(c < 32 || c === 127) continue; // drop other control chars
		else out += s[i];
	}
	return out;
}

function sanitizeChunk(chunk){
	if(typeof chunk !== 'string') return '';
	return chunk.split('\n').map(sanitizeLine).join('\n');
}

function frontMatter(metadata){
	if(!metadata) return '';
	const out = ['---'];
	let any = false;
	for (const k of FRONT_MATTER_KEYS){
		const v = metadata[k];
		if(v === undefined || v === null || v === '') continue;
		out.push(`${k}: ${sanitizeLine(String(v))}`);
		any = true;
	}
	out.push('---', '');
	return any ? `${out.join('\n')}\n` : '';
}

export function exportMarkdown(documentAst){
	if(!documentAst) return '';
	const head = frontMatter(documentAst.metadata);
	const pages = documentAst.pages || [];
	const pageChunks = pages.map((page)=>{
		const blocks = page.blocks || [];
		const rendered = [];
		for (const block of blocks){
			const fn = exporters[block.type];
			if(!fn){
				rendered.push(`<!-- unsupported block: ${block.type} -->`);
				continue;
			}
			let chunk = '';
			try { chunk = fn(block); } catch (e) {
				rendered.push(`<!-- export failed for ${block.type}: ${e.message} -->`);
				continue;
			}
			rendered.push(sanitizeChunk(chunk).replace(/\n+$/, ''));
		}
		return rendered.filter((s)=>s.length > 0).join('\n\n');
	});
	const body = pageChunks.join('\n\n\\page\n\n');
	const tail = body.endsWith('\n') ? '' : '\n';
	return `${head}${body}${tail}`;
}

export default exportMarkdown;
