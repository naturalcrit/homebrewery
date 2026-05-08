// AST <-> ProseMirror conversion.
//
// Wave 4: every per-block conversion lives in its manifest module
// (`client/reborn/blocks/<type>.js`). This file is now plumbing only — it
// flattens AST pages into a single PM doc with `pageBreak` atoms between
// pages, and re-groups them on the way back. All block-level work is
// dispatched via `astBlockToPm` / `pmNodeToAst` from the registry.

import { schema } from './schema.js';
import { astBlockToPm, pmNodeToAst } from '../blocks/registry.js';

/**
 * Turn a reborn AST document into a single PM doc node.
 * Pages are flattened, separated by pageBreak atoms.
 */
export function astToPmDoc(documentAst){
	const blocks = [];
	const pages = documentAst.pages || [];
	pages.forEach((page, i)=>{
		if(i > 0) blocks.push(schema.nodes.pageBreak.create());
		for (const block of page.blocks || []){
			const pmBlock = astBlockToPm(block, schema);
			if(pmBlock) blocks.push(pmBlock);
			else console.warn('astToPmDoc: no manifest for block type', block.type);
		}
	});
	if(!blocks.length) blocks.push(schema.nodes.paragraph.create());
	return schema.nodes.doc.create(null, blocks);
}

/**
 * Turn a PM doc node back into a reborn AST document.
 * Inserted pageBreak atoms turn into page boundaries.
 */
export function pmDocToAst(pmDoc, metadata = {}){
	const pages = [{ blocks: [] }];
	pmDoc.forEach((node)=>{
		if(node.type.name === 'pageBreak'){
			pages.push({ blocks: [] });
			return;
		}
		const block = pmNodeToAst(node, schema);
		if(block) pages[pages.length - 1].blocks.push(block);
		else console.warn('pmDocToAst: no manifest for PM node', node.type.name);
	});
	return { metadata, pages };
}
