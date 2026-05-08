// The block-system registry.
//
// Single point of integration between the editor / renderer cores and the
// per-block manifests. Every manifest is imported by name (no filesystem
// auto-discovery — Vite needs explicit imports for tree-shaking, and the
// audit needs to be able to grep for the import to confirm the contract).
// Adding a new block type means: (1) write the manifest module, (2) add ONE
// import line below, (3) push it to MANIFESTS. That's it.

import { TextSelection } from 'prosemirror-state';

import { marks } from './marks.js';

import paragraph      from './paragraph.jsx';
import heading        from './heading.jsx';
import list           from './list.jsx';
import blockquote     from './blockquote.jsx';
import note           from './note.jsx';
import descriptive    from './descriptive.jsx';
import table          from './table.jsx';
import horizontalRule from './horizontalRule.jsx';
import statBlock      from './statBlock.jsx';
import image          from './image.jsx';
import pageBreak      from './pageBreak.jsx';
import columnBreak    from './columnBreak.jsx';
import spell          from './spell.jsx';

// Order here only matters for slash-menu ordering and (very weakly) for which
// PM `parseDOM` rule wins ambiguous matches. Keep authoring order.
export const MANIFESTS = [
	paragraph,
	heading,
	list,
	blockquote,
	note,
	descriptive,
	table,
	horizontalRule,
	statBlock,
	spell,
	image,
	pageBreak,
	columnBreak,
];

// ---- manifests by AST type / by PM node name -----------------------------

export const manifests = {};
const manifestsByPmName = {};

for (const m of MANIFESTS){
	if(manifests[m.type]){
		throw new Error(`Duplicate block manifest type: ${m.type}`);
	}
	manifests[m.type] = m;
	const pmName = m.pmName || m.type;
	manifestsByPmName[pmName] = m;
	// `group` shape: every contributed PM node points back to this manifest
	// for round-trip lookup (so e.g. `bullet_list` and `ordered_list` both
	// resolve to the list manifest).
	if(m.pmNode.kind === 'group'){
		for (const nodeName of Object.keys(m.pmNode.nodes)){
			manifestsByPmName[nodeName] = m;
		}
	}
}

export { manifestsByPmName };

// ---- pmSchemaSpec --------------------------------------------------------

// `doc` and `text` are not block manifests — they're structural skeletons PM
// requires. Every other node comes from the manifest list.
const baseNodes = {
	doc  : { content: 'block+' },
	text : { group: 'inline' },
};

function buildPmNodes(){
	const nodes = { ...baseNodes };
	for (const m of MANIFESTS){
		const contrib = m.pmNode;
		if(!contrib) continue;
		if(contrib.kind === 'standard' || contrib.kind === 'atom'){
			const pmName = m.pmName || m.type;
			if(nodes[pmName]){
				throw new Error(`Duplicate PM node name from manifest ${m.type}: ${pmName}`);
			}
			nodes[pmName] = contrib.spec;
		} else if(contrib.kind === 'group'){
			for (const [nodeName, spec] of Object.entries(contrib.nodes)){
				if(nodes[nodeName]){
					throw new Error(`Duplicate PM node name from manifest ${m.type}: ${nodeName}`);
				}
				nodes[nodeName] = spec;
			}
		} else {
			throw new Error(`Unknown pmNode.kind on manifest ${m.type}: ${contrib.kind}`);
		}
	}
	return nodes;
}

export const pmSchemaSpec = {
	nodes : buildPmNodes(),
	marks,
};

// ---- nodeViewFactories ---------------------------------------------------

export const nodeViewFactories = {};
for (const m of MANIFESTS){
	if(m.NodeView){
		const pmName = m.pmName || m.type;
		nodeViewFactories[pmName] = m.NodeView;
	}
}

// ---- render components ---------------------------------------------------

export const renderComponents = {};
for (const m of MANIFESTS){
	if(m.Render){
		renderComponents[m.type] = m.Render;
	}
}

// ---- AST <-> PM dispatch tables -----------------------------------------

export const astToPmByType = {};
export const pmToAstByName = {};

for (const m of MANIFESTS){
	if(m.astToPm) astToPmByType[m.type] = m.astToPm;

	// pmToAst: keyed by PM node name. The list manifest contributes two
	// (bullet_list, ordered_list) via `pmToAstByNode`; everything else is one.
	if(m.pmToAstByNode){
		for (const [nodeName, fn] of Object.entries(m.pmToAstByNode)){
			pmToAstByName[nodeName] = fn;
		}
	}
	if(m.pmToAst){
		const pmName = m.pmName || m.type;
		pmToAstByName[pmName] = m.pmToAst;
	}
}

// ---- slash menu ---------------------------------------------------------

// Default insert behaviour: delete the slash range, replace the empty
// containing paragraph with the new block (or insert at cursor if not in an
// empty paragraph), and step into block-with-content nodes.
//
// Two call signatures are supported. The Wave 4 path takes `(view, range)`,
// which is what the slash popup uses. The legacy path takes
// `(state, dispatch, range)` and is what the Wave 3 tests pass — keeping it
// preserves the slashItems contract those tests rely on.
function defaultInsert(arg1, arg2, arg3, makeNode){
	let state, dispatch, range;
	if(arg3 && typeof arg3 === 'object' && 'from' in arg3){
		state = arg1; dispatch = arg2; range = arg3;
	} else {
		state = arg1.state; dispatch = arg1.dispatch.bind(arg1); range = arg2;
	}
	const { tr } = state;
	tr.delete(range.from, range.to);
	const $from = tr.selection.$from;
	const para = $from.parent;
	const node = makeNode(state.schema);
	const paragraphType = state.schema.nodes.paragraph;
	if(para.type === paragraphType && para.content.size === 0){
		const blockStart = $from.before();
		const blockEnd   = $from.after();
		tr.replaceWith(blockStart, blockEnd, node);
	} else {
		tr.replaceSelectionWith(node);
	}
	try {
		const insertedPos = tr.selection.from - 1;
		const $pos = tr.doc.resolve(insertedPos);
		if($pos.nodeAfter && !$pos.nodeAfter.isAtom){
			tr.setSelection(TextSelection.near(tr.doc.resolve(insertedPos + 1)));
		}
	} catch (e){ /* leave selection alone */ }
	dispatch(tr.scrollIntoView());
	return true;
}

// Shape of a slash-menu item:
//   { id, label, keywords, icon, category, manifest, insert(view, range) }
//
// `manifest` is included so the menu UI can group / categorise / show the
// manifest's icon without re-deriving anything.

function makeInsertFn(makeNode){
	// Returned function accepts both `(state, dispatch, range)` (legacy /
	// test) and `(view, range)` (slash popup) signatures.
	return (a, b, c)=>defaultInsert(a, b, c, makeNode);
}

function deriveSlashItem(manifest){
	if(manifest.slashItems){
		return manifest.slashItems.map((it)=>({
			id       : it.id,
			label    : it.label,
			category : it.category || manifest.category,
			icon     : it.icon || manifest.icon,
			keywords : `${it.keywords || ''} ${manifest.label} ${manifest.type} ${(manifest.slashAliases || []).join(' ')}`.trim(),
			manifest,
			insert   : makeInsertFn(it.make),
		}));
	}
	// Default single-entry: synthesize one slash item from the manifest itself.
	return [{
		id       : manifest.type,
		label    : manifest.label,
		category : manifest.category,
		icon     : manifest.icon,
		keywords : `${manifest.label} ${manifest.type} ${(manifest.slashAliases || []).join(' ')}`.trim(),
		manifest,
		insert   : makeInsertFn((schema)=>{
			const ast = manifest.createAst ? manifest.createAst() : { type: manifest.type };
			const fn  = astToPmByType[manifest.type];
			if(fn) return fn(ast, schema);
			// Final fallback: try to construct an empty PM node.
			const pmName = manifest.pmName || manifest.type;
			return schema.nodes[pmName].create();
		}),
	}];
}

export const slashMenuItems = MANIFESTS.flatMap(deriveSlashItem);

// ---- import / export contributors ---------------------------------------

export const importContributors = MANIFESTS
	.filter((m)=>typeof m.importMarkdown === 'function')
	.map((m)=>({ manifest: m, priority: m.importPriority ?? 100, importMarkdown: m.importMarkdown }))
	.sort((a, b)=>b.priority - a.priority);

export const exporters = {};
for (const m of MANIFESTS){
	if(m.exportMarkdown) exporters[m.type] = m.exportMarkdown;
}

// ---- public dispatch helpers (used by editor/convert.js) ----------------

export function astBlockToPm(block, schema){
	const fn = astToPmByType[block.type];
	if(!fn) return null;
	return fn(block, schema);
}

export function pmNodeToAst(node, schema){
	const fn = pmToAstByName[node.type.name];
	if(!fn) return null;
	return fn(node, schema);
}

// ---- AST validation -----------------------------------------------------

export function validateBlock(block){
	const m = manifests[block.type];
	if(!m) return [`unknown block type: ${block.type}`];
	if(!m.validateAst) return [];
	return m.validateAst(block);
}
