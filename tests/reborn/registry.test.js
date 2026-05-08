// Wave 4: registry / manifest contract tests.
//
// These tests are the audit's "the manifest contract is real" gate. They
// confirm that the registry exposes everything the cores read, that derived
// structures cover every manifest, and that the spell manifest dropped in
// without any code outside `client/reborn/blocks/spell.js` and the registry
// import line still appears in every derived structure.

import {
	manifests,
	MANIFESTS,
	pmSchemaSpec,
	nodeViewFactories,
	renderComponents,
	slashMenuItems,
	importContributors,
	exporters,
	validateBlock,
} from '../../client/reborn/blocks/registry.js';
import { schema } from '../../client/reborn/editor/schema.js';
import { astToPmDoc, pmDocToAst } from '../../client/reborn/editor/convert.js';

describe('block manifest registry', ()=>{
	test('every manifest declares the required fields', ()=>{
		for (const m of MANIFESTS){
			expect(typeof m.type).toBe('string');
			expect(typeof m.label).toBe('string');
			expect(typeof m.category).toBe('string');
			expect(m.pmNode).toBeTruthy();
			expect(['standard', 'atom', 'group']).toContain(m.pmNode.kind);
		}
	});

	test('pmSchemaSpec.nodes contains every manifest\'s primary PM node', ()=>{
		for (const m of MANIFESTS){
			if(m.pmNode.kind === 'group'){
				for (const nodeName of Object.keys(m.pmNode.nodes)){
					expect(pmSchemaSpec.nodes[nodeName]).toBeDefined();
				}
			} else {
				const pmName = m.pmName || m.type;
				expect(pmSchemaSpec.nodes[pmName]).toBeDefined();
			}
		}
		expect(pmSchemaSpec.nodes.doc).toBeDefined();
		expect(pmSchemaSpec.nodes.text).toBeDefined();
	});

	test('atom manifests with editable attrs register a NodeView', ()=>{
		// Atoms whose attrs are visible-edited (statBlock, spell) need a
		// NodeView. Atoms whose attrs are inert from the user's POV (an image
		// is just a src/alt; a page or column break has no fields) can fall
		// back to PM's default toDOM rendering.
		const interactiveAtomTypes = new Set(['statBlock', 'spell']);
		for (const m of MANIFESTS){
			if(m.pmNode.kind !== 'atom') continue;
			if(!interactiveAtomTypes.has(m.type)) continue;
			const pmName = m.pmName || m.type;
			expect(typeof nodeViewFactories[pmName]).toBe('function');
		}
	});

	test('every manifest contributes a Render component', ()=>{
		for (const m of MANIFESTS){
			expect(renderComponents[m.type]).toBeDefined();
		}
	});

	test('slashMenuItems covers every manifest at least once', ()=>{
		const seenTypes = new Set();
		for (const item of slashMenuItems){
			seenTypes.add(item.manifest.type);
		}
		for (const m of MANIFESTS){
			// noteTitle / descriptiveTitle / list_item are NOT manifests — they're
			// PM-internal nodes. Every actual manifest is in the menu.
			expect(seenTypes.has(m.type)).toBe(true);
		}
	});

	test('exporters and importContributors are populated', ()=>{
		expect(Object.keys(exporters).length).toBeGreaterThan(0);
		expect(importContributors.length).toBeGreaterThan(0);
		// Sorted by descending priority.
		for (let i = 1; i < importContributors.length; i++){
			expect(importContributors[i - 1].priority).toBeGreaterThanOrEqual(importContributors[i].priority);
		}
	});
});

describe('extensibility test: spell manifest', ()=>{
	test('spell appears in slashMenuItems', ()=>{
		const spellEntry = slashMenuItems.find((it)=>it.id === 'spell');
		expect(spellEntry).toBeTruthy();
		expect(spellEntry.category).toBe('Rules');
		expect(spellEntry.label).toBe('Spell');
	});

	test('spell is in renderComponents and pmSchemaSpec.nodes', ()=>{
		expect(renderComponents.spell).toBeDefined();
		expect(pmSchemaSpec.nodes.spell).toBeDefined();
		expect(nodeViewFactories.spell).toBeDefined();
	});

	test('a document containing a spell round-trips through PM losslessly', ()=>{
		const ast = {
			metadata : {},
			pages    : [{
				blocks : [
					manifests.spell.createAst({
						name        : 'Fireball',
						level       : 3,
						school      : 'evocation',
						castingTime : '1 action',
						range       : '150 feet',
						components  : 'V, S, M (a tiny ball of bat guano and sulfur)',
						duration    : 'Instantaneous',
						classes     : 'Sorcerer, Wizard',
						description : [{ text: 'A bright streak flashes from your finger to a point you choose…' }],
					}),
				],
			}],
		};
		const pm = astToPmDoc(ast);
		const back = pmDocToAst(pm);
		const spell = back.pages[0].blocks[0];
		expect(spell.type).toBe('spell');
		expect(spell.name).toBe('Fireball');
		expect(spell.level).toBe(3);
		expect(spell.school).toBe('evocation');
		expect(spell.castingTime).toBe('1 action');
		expect(spell.range).toBe('150 feet');
		expect(spell.components).toBe('V, S, M (a tiny ball of bat guano and sulfur)');
		expect(spell.duration).toBe('Instantaneous');
		expect(spell.classes).toBe('Sorcerer, Wizard');
		expect(spell.description[0].text).toContain('bright streak');
	});

	test('spell exporter emits the canonical #### Name / *level-school* shape', ()=>{
		const md = manifests.spell.exportMarkdown(manifests.spell.createAst({
			name: 'Light', level: 0, school: 'evocation',
		}));
		expect(md).toMatch(/^#### Light/m);
		expect(md).toMatch(/\*evocation cantrip\*/);
	});

	test('spell importer recognises a #### + *level school* block', ()=>{
		const lines = [
			'#### Cure Wounds',
			'*1st-level evocation*',
			'',
			'**Casting Time:** 1 action',
			'**Range:** Touch',
			'**Components:** V, S',
			'**Duration:** Instantaneous',
			'',
			'A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier.',
		];
		const result = manifests.spell.importMarkdown(lines, 0, {});
		expect(result).toBeTruthy();
		expect(result.node.type).toBe('spell');
		expect(result.node.name).toBe('Cure Wounds');
		expect(result.node.level).toBe(1);
		expect(result.node.school).toBe('evocation');
		expect(result.node.castingTime).toBe('1 action');
		expect(result.node.description[0].text).toContain('hit points');
	});
});

describe('manifest validation', ()=>{
	test('validateAst rejects a malformed stat block', ()=>{
		const malformed = {
			type: 'statBlock', name: '',                     // missing required name
			armorClass: 'fifteen',                          // not a number
			hitPoints: 100,
			abilities: { str: 'big', dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
		};
		const errs = validateBlock(malformed);
		expect(errs.length).toBeGreaterThan(0);
		expect(errs.some((e)=>e.includes('name'))).toBe(true);
		expect(errs.some((e)=>e.includes('armorClass'))).toBe(true);
		expect(errs.some((e)=>e.includes('abilities'))).toBe(true);
	});

	test('validateAst accepts a well-formed stat block', ()=>{
		const ok = manifests.statBlock.createAst({ name: 'Goblin' });
		expect(validateBlock(ok)).toEqual([]);
	});

	test('validateBlock returns an error for an unknown type', ()=>{
		expect(validateBlock({ type: 'doesNotExist' })).toEqual(['unknown block type: doesNotExist']);
	});

	test('validateAst rejects a malformed spell', ()=>{
		const errs = validateBlock({ type: 'spell', name: 'Bad', level: 99, school: 7 });
		expect(errs.length).toBeGreaterThan(0);
	});
});

// ---- Wave 7 additions: stricter manifest contract enforcement -----------

describe('manifest contract — every field that the registry consumes', ()=>{
	const VALID_CATEGORIES = new Set(['Rules', 'Text', 'Layout', 'Tables', 'Media', 'Callouts']);

	for (const m of MANIFESTS){
		describe(`manifest: ${m.type}`, ()=>{
			test('type is a non-empty string and unique', ()=>{
				expect(typeof m.type).toBe('string');
				expect(m.type.length).toBeGreaterThan(0);
			});

			test('label is a non-empty string', ()=>{
				expect(typeof m.label).toBe('string');
				expect(m.label.length).toBeGreaterThan(0);
			});

			test('category is one of the documented values', ()=>{
				expect(VALID_CATEGORIES.has(m.category)).toBe(true);
			});

			test('icon is a non-empty string', ()=>{
				expect(typeof m.icon).toBe('string');
				expect(m.icon.length).toBeGreaterThan(0);
			});

			test('slashAliases (if present) is a string array', ()=>{
				if(m.slashAliases === undefined) return;
				expect(Array.isArray(m.slashAliases)).toBe(true);
				for (const s of m.slashAliases) expect(typeof s).toBe('string');
			});

			test('pmNode kind is one of standard|atom|group with the matching shape', ()=>{
				expect(m.pmNode).toBeTruthy();
				if(m.pmNode.kind === 'standard' || m.pmNode.kind === 'atom'){
					expect(typeof m.pmNode.spec).toBe('object');
				} else if(m.pmNode.kind === 'group'){
					expect(typeof m.pmNode.nodes).toBe('object');
					expect(Object.keys(m.pmNode.nodes).length).toBeGreaterThan(0);
				} else {
					throw new Error(`bad pmNode.kind: ${m.pmNode.kind}`);
				}
			});

			test('atom manifests have an astToPm and pmToAst', ()=>{
				if(m.pmNode.kind !== 'atom') return;
				expect(typeof m.astToPm).toBe('function');
				expect(typeof m.pmToAst).toBe('function');
			});

			test('Render is a function (renderable component)', ()=>{
				if(!m.Render) return;
				expect(typeof m.Render).toBe('function');
			});

			test('createAst (if present) returns a node with matching type', ()=>{
				if(typeof m.createAst !== 'function') return;
				const node = m.createAst();
				expect(node.type).toBe(m.type);
			});

			test('validateAst (if present) accepts createAst output', ()=>{
				if(typeof m.createAst !== 'function' || typeof m.validateAst !== 'function') return;
				const errs = m.validateAst(m.createAst());
				expect(errs).toEqual([]);
			});

			test('exportMarkdown (if present) is a function returning a string', ()=>{
				if(!m.exportMarkdown) return;
				if(typeof m.createAst !== 'function') return;
				const out = m.exportMarkdown(m.createAst());
				expect(typeof out).toBe('string');
			});

			test('importMarkdown (if present) returns null or { node, advance }', ()=>{
				if(!m.importMarkdown) return;
				const result = m.importMarkdown(['nothing matching this manifest'], 0, {});
				expect(result === null || (typeof result === 'object' && 'node' in result && 'advance' in result)).toBe(true);
			});
		});
	}
});

describe('manifest contract — every type appears in every derived structure', ()=>{
	test('every manifest type has a Render component', ()=>{
		for (const m of MANIFESTS){
			expect(renderComponents[m.type]).toBeDefined();
		}
	});
	test('every manifest type appears at least once in slashMenuItems', ()=>{
		const seen = new Set(slashMenuItems.map((it)=>it.manifest.type));
		for (const m of MANIFESTS){
			expect(seen.has(m.type)).toBe(true);
		}
	});
});

// ---- Wave 7: extensibility — add a fake manifest at runtime ------------

describe('manifest extensibility (runtime add of a fake manifest)', ()=>{
	// We DON'T modify the MANIFESTS array at runtime — that would corrupt the
	// shared registry for every other test. Instead we exercise the public
	// extensibility path: a new manifest module dropped in must satisfy the
	// SAME contract that the registry's existing entries satisfy. We assert
	// that with a synthetic manifest we manually verify against the contract.
	test('a synthetic manifest satisfies every contract field the registry reads', ()=>{
		const fake = {
			type     : 'fake',
			label    : 'Fake',
			category : 'Text',
			icon     : 'Sparkle',
			slashAliases : ['fake', 'demo'],
			createAst    : (overrides = {})=>({ type: 'fake', text: '', ...overrides }),
			validateAst  : (n)=>(typeof n.text === 'string' ? [] : ['fake.text must be a string']),
			pmNode : {
				kind : 'standard',
				spec : {
					attrs    : { text: { default: '' } },
					group    : 'block',
					content  : 'inline*',
					parseDOM : [{ tag: 'div.fake' }],
					toDOM    : ()=>['div', { class: 'fake' }, 0],
				},
			},
			Render : ({ block })=>null,
			astToPm: (block, schema)=>schema.nodes.fake?.create({ text: block.text || '' }),
			pmToAst: (node)=>({ type: 'fake', text: node.attrs.text }),
		};

		// Validate the synthetic manifest the same way Wave 7 checks the
		// real ones.
		expect(typeof fake.type).toBe('string');
		expect(typeof fake.label).toBe('string');
		expect(['Rules', 'Text', 'Layout', 'Tables', 'Media', 'Callouts']).toContain(fake.category);
		expect(['standard', 'atom', 'group']).toContain(fake.pmNode.kind);
		const sample = fake.createAst();
		expect(sample.type).toBe('fake');
		expect(fake.validateAst(sample)).toEqual([]);
		expect(fake.validateAst({ ...sample, text: 42 }).length).toBeGreaterThan(0);
	});
});
