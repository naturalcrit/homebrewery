// Markdown importer (basic).
//
// Pure orchestrator: it tokenizes the source into lines, parses optional YAML
// front-matter into document metadata, then walks the lines asking each block
// manifest's `importMarkdown(lines, index, ctx)` contributor (in priority
// order) to claim a run of lines. The first contributor that returns a
// non-null `{ node, advance }` wins.
//
// Scope (Wave 6):
//   - Round-trip everything our exporter emits.
//   - Recognize the most common legacy markers: `\page`, `\column`,
//     `{{monster,frame}} ... }}` mustache stat blocks, `<style>...</style>`
//     blocks (captured into the report as unsupported).
//   - Anything else falls through to the catch-all paragraph importer or is
//     reported as unsupported.
//
// Out of scope: full custom-CSS migration, every snippet under
// themes/V3/5ePHB/snippets, full `{{class}}` mustache div parsing.

import { importContributors } from '../blocks/registry.js';

function parseFrontMatter(lines){
	const metadata = {};
	if(lines[0] !== '---') return { metadata, consumed: 0 };
	let i = 1;
	while (i < lines.length && lines[i] !== '---'){
		const line = lines[i];
		const colon = line.indexOf(':');
		if(colon > 0){
			const key = line.slice(0, colon).trim();
			const value = line.slice(colon + 1).trim();
			if(key) metadata[key] = value;
		}
		i++;
	}
	if(lines[i] === '---') i++;
	return { metadata, consumed: i };
}

// Skip a `<style>...</style>` block — capture into report as unsupported. The
// block can run for many lines; we consume up to the closing `</style>`.
function tryStyleBlock(lines, i, report){
	if(!/^\s*<style\b/i.test(lines[i] || '')) return null;
	let j = i;
	while (j < lines.length && !/<\/style>/i.test(lines[j])) j++;
	if(j < lines.length) j++;
	const slice = lines.slice(i, j).join('\n');
	report.unsupported.push({
		marker    : '<style>',
		startLine : i,
		endLine   : j - 1,
		preview   : slice.slice(0, 200),
		note      : 'Inline <style> block ignored. Custom CSS migration is out of scope for the Wave 6 importer.',
	});
	return j - i;
}

// Skip a `{{class ... }}` div whose class isn't one we explicitly recognize
// (descriptive is recognized via its manifest). The legacy syntax wraps a body
// of plain markdown — we capture it for the report and let it fall through to
// the paragraph importer for whatever's inside (lossy, but the report tells
// the user).
function tryUnknownMustache(lines, i, report){
	const head = (lines[i] || '').trim();
	const m = /^\{\{([\w-]+(?:\s*,\s*[\w-]+)*)?\s*$/.exec(head);
	if(!m) return null;
	const klass = (m[1] || '').trim();
	// Recognized mustache openers are claimed by their manifests. If we got
	// here it's because no manifest claimed the line.
	report.unsupported.push({
		marker    : `{{${klass}`,
		startLine : i,
		note      : `Mustache div opener "${head}" is not supported by the Wave 6 importer. Body left as paragraphs.`,
	});
	// Consume only the opener; the body falls through to whichever importer
	// matches each line (typically paragraph).
	return 1;
}

export function importMarkdown(source, options = {}){
	const text = typeof source === 'string' ? source : '';
	const allLines = text.replace(/\r\n?/g, '\n').split('\n');
	const { metadata, consumed } = parseFrontMatter(allLines);
	const lines = allLines.slice(consumed);

	const report = {
		converted   : [],
		warnings    : [],
		unsupported : [],
	};
	const ctx = {
		options,
		warn : (msg)=>report.warnings.push(msg),
	};

	const pages = [{ blocks: [] }];
	let i = 0;
	while (i < lines.length){
		// Skip blank lines.
		if(lines[i].trim() === ''){ i++; continue; }

		// Document-level markers: `\page`, `\column`. The pageBreak manifest
		// owns `\page`; we also need to splice the AST page array, so we
		// short-circuit here before delegating.
		if(/^\\page\s*$/.test(lines[i])){
			pages.push({ blocks: [] });
			report.converted.push({ type: 'pageBreak', line: i });
			i++; continue;
		}
		if(/^\\column\s*$/.test(lines[i])){
			pages[pages.length - 1].blocks.push({ type: 'columnBreak' });
			report.converted.push({ type: 'columnBreak', line: i });
			i++; continue;
		}

		// Legacy <style> blocks: skip + report.
		const styleAdvance = tryStyleBlock(lines, i, report);
		if(styleAdvance != null){ i += styleAdvance; continue; }

		// Try every block contributor in priority order.
		let claimed = null;
		for (const c of importContributors){
			const result = c.importMarkdown(lines, i, ctx);
			if(result && result.node){
				claimed = { manifestType: c.manifest.type, ...result };
				break;
			}
		}
		// If a contributor claimed the line as a paragraph but the line is
		// actually a mustache opener `{{...`, prefer the unsupported-report
		// path over the lossy paragraph capture. (Paragraph is the catch-all
		// at priority 1 and would otherwise swallow the marker.)
		const looksMustache = /^\{\{/.test(lines[i]);
		if(claimed && looksMustache && claimed.manifestType === 'paragraph'){
			claimed = null;
		}
		if(claimed){
			pages[pages.length - 1].blocks.push(claimed.node);
			report.converted.push({ type: claimed.manifestType, line: i });
			i += Math.max(1, claimed.advance);
			continue;
		}

		// Unknown mustache opener: capture and continue past the opener.
		const mustacheAdvance = tryUnknownMustache(lines, i, report);
		if(mustacheAdvance != null){ i += mustacheAdvance; continue; }

		// Last-ditch: drop the line into the report as a stray.
		report.warnings.push(`Unrecognized line ${i + 1}: ${lines[i].slice(0, 120)}`);
		i++;
	}

	const document = {
		metadata : { title: '', ...metadata },
		pages,
	};
	return { document, report };
}

export default importMarkdown;
