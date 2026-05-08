import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Inline from '../renderer/Inline.jsx';
import { runsToMarkdown, plainTextToRuns, inlineRunsToPlainText } from './_helpers.js';

// The stat block: showcase manifest. Owns its PM atom spec, its NodeView (the
// React form the editor mounts), its read-only render component, and its
// markdown export. Wave 6 will fill in the markdown importer; for now we ship
// only the export half.

// ---- shared helpers (mod, AC text, HP text, etc.) -----------------------

export function abilityMod(score){
	const mod = Math.floor((score - 10) / 2);
	return mod >= 0 ? `+${mod}` : `${mod}`;
}
export function abilityCell(score){ return `${score} (${abilityMod(score)})`; }

const STATBLOCK_DEFAULT_ATTRS = {
	variant             : '5e',
	name                : 'Unnamed Creature',
	size                : 'Medium',
	creatureType        : 'humanoid',
	alignment           : 'unaligned',
	armorClass          : 10,
	armorClassNote      : '',
	hitPoints           : 1,
	hitDice             : '',
	speed               : '30 ft.',
	abilities           : { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
	saves               : '',
	skills              : '',
	damageResistances   : '',
	damageImmunities    : '',
	conditionImmunities : '',
	senses              : '',
	languages           : '',
	challenge           : '0 (10 XP)',
	traits              : [],
	actions             : [],
	legendaryActions    : [],
	lairActions         : [],
	regionalEffects     : [],
};

// ---- render component ---------------------------------------------------

function TraitParagraphs({ entries }){
	if(!entries || !entries.length) return null;
	return entries.map((entry, i)=>(
		<p key={i}>
			<em><strong>{entry.name}.</strong></em>{' '}
			<Inline runs={entry.text} />
		</p>
	));
}

function StatBlockRender({ block }){
	const ac = block.armorClassNote
		? `${block.armorClass} (${block.armorClassNote})`
		: `${block.armorClass}`;
	const hp = block.hitDice
		? `${block.hitPoints} (${block.hitDice})`
		: `${block.hitPoints}`;

	const topAttrs = [
		['Armor Class', ac],
		['Hit Points', hp],
		['Speed', block.speed],
	];
	const bottomAttrs = [
		['Saving Throws', block.saves],
		['Skills', block.skills],
		['Damage Resistances', block.damageResistances],
		['Damage Immunities', block.damageImmunities],
		['Condition Immunities', block.conditionImmunities],
		['Senses', block.senses],
		['Languages', block.languages],
		['Challenge', block.challenge],
	].filter(([, v])=>v != null && v !== '');

	const a = block.abilities;

	return (
		<div className='monster frame'>
			<h2>{block.name}</h2>
			<p>
				<em>{`${block.size} ${block.creatureType}, ${block.alignment}`}</em>
			</p>
			<hr />
			<dl>
				{topAttrs.map(([label, value], i)=>(
					<React.Fragment key={label}>
						{i > 0 && '\n'}
						<dt><strong>{label}</strong></dt>
						<dd>{value}</dd>
					</React.Fragment>
				))}
			</dl>
			<hr />
			<table>
				<thead>
					<tr>
						<th align='center'>STR</th>
						<th align='center'>DEX</th>
						<th align='center'>CON</th>
						<th align='center'>INT</th>
						<th align='center'>WIS</th>
						<th align='center'>CHA</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td align='center'>{abilityCell(a.str)}</td>
						<td align='center'>{abilityCell(a.dex)}</td>
						<td align='center'>{abilityCell(a.con)}</td>
						<td align='center'>{abilityCell(a.int)}</td>
						<td align='center'>{abilityCell(a.wis)}</td>
						<td align='center'>{abilityCell(a.cha)}</td>
					</tr>
				</tbody>
			</table>
			<hr />
			<dl>
				{bottomAttrs.map(([label, value], i)=>(
					<React.Fragment key={label}>
						{i > 0 && '\n'}
						<dt><strong>{label}</strong></dt>
						<dd>{value}</dd>
					</React.Fragment>
				))}
			</dl>
			<hr />
			<TraitParagraphs entries={block.traits} />
			{block.actions && block.actions.length > 0 && (
				<>
					<h3>Actions</h3>
					<TraitParagraphs entries={block.actions} />
				</>
			)}
			{block.legendaryActions && block.legendaryActions.length > 0 && (
				<>
					<h3>Legendary Actions</h3>
					<TraitParagraphs entries={block.legendaryActions} />
				</>
			)}
			{block.lairActions && block.lairActions.length > 0 && (
				<>
					<h3>Lair Actions</h3>
					<TraitParagraphs entries={block.lairActions} />
				</>
			)}
			{block.regionalEffects && block.regionalEffects.length > 0 && (
				<>
					<h3>Regional Effects</h3>
					<TraitParagraphs entries={block.regionalEffects} />
				</>
			)}
		</div>
	);
}

// ---- editor form --------------------------------------------------------

function TextInput({ value, onChange, className, placeholder, type = 'text', size }){
	return (
		<input
			type={type}
			className={`sb-input ${className || ''}`}
			value={value ?? ''}
			placeholder={placeholder}
			size={size}
			onChange={(e)=>onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
			onKeyDown={(e)=>e.stopPropagation()}
			onMouseDown={(e)=>e.stopPropagation()}
		/>
	);
}

function TraitList({ label, entries, onChange }){
	const list = entries || [];
	const setEntry = (idx, key, value)=>{
		const next = list.map((entry, i)=>(i === idx ? { ...entry, [key]: value } : entry));
		onChange(next);
	};
	const add = ()=>onChange([...list, { name: 'New Entry', text: plainTextToRuns('') }]);
	const remove = (idx)=>onChange(list.filter((_, i)=>i !== idx));
	if(!list.length && label === null) return null;
	return (
		<>
			{label !== null && <h3>{label}</h3>}
			{list.map((entry, i)=>(
				<p key={i}>
					<em><strong>
						<TextInput className='sb-traitName' value={entry.name} onChange={(v)=>setEntry(i, 'name', v)} placeholder='Name' />
					</strong></em>{' '}
					<TextInput className='sb-traitText' value={inlineRunsToPlainText(entry.text)} onChange={(v)=>setEntry(i, 'text', plainTextToRuns(v))} placeholder='Description' />
					<button type='button' className='sb-removeBtn' onClick={()=>remove(i)} title='Remove'>−</button>
				</p>
			))}
			<p>
				<button type='button' className='sb-addBtn' onClick={add}>+ Add {label || 'Entry'}</button>
			</p>
		</>
	);
}

function StatBlockForm({ getAttrs, setAttrs, isSelected }){
	const [, force] = useState(0);
	const a = getAttrs();
	const setField = (key, value)=>{ setAttrs({ [key]: value }); force((x)=>x + 1); };
	const setAbility = (k, value)=>{
		setAttrs({ abilities: { ...a.abilities, [k]: Number(value) || 0 } });
		force((x)=>x + 1);
	};

	return (
		<div className={`monster frame${isSelected ? ' sb-selected' : ''}`}>
			<h2>
				<TextInput value={a.name} onChange={(v)=>setField('name', v)} className='sb-name' />
			</h2>
			<p>
				<em>
					<TextInput value={a.size} onChange={(v)=>setField('size', v)} className='sb-size' size='8' />{' '}
					<TextInput value={a.creatureType} onChange={(v)=>setField('creatureType', v)} className='sb-type' size='18' />{', '}
					<TextInput value={a.alignment} onChange={(v)=>setField('alignment', v)} className='sb-alignment' size='14' />
				</em>
			</p>
			<hr />
			<dl>
				<dt><strong>Armor Class</strong></dt>
				<dd>
					<TextInput type='number' value={a.armorClass} onChange={(v)=>setField('armorClass', v)} size='3' />{' ('}
					<TextInput value={a.armorClassNote} onChange={(v)=>setField('armorClassNote', v)} placeholder='note' size='14' />{')'}
				</dd>{'\n'}
				<dt><strong>Hit Points</strong></dt>
				<dd>
					<TextInput type='number' value={a.hitPoints} onChange={(v)=>setField('hitPoints', v)} size='4' />{' ('}
					<TextInput value={a.hitDice} onChange={(v)=>setField('hitDice', v)} placeholder='hit dice' size='10' />{')'}
				</dd>{'\n'}
				<dt><strong>Speed</strong></dt>
				<dd><TextInput value={a.speed} onChange={(v)=>setField('speed', v)} size='30' /></dd>
			</dl>
			<hr />
			<table>
				<thead>
					<tr>
						<th align='center'>STR</th>
						<th align='center'>DEX</th>
						<th align='center'>CON</th>
						<th align='center'>INT</th>
						<th align='center'>WIS</th>
						<th align='center'>CHA</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						{['str', 'dex', 'con', 'int', 'wis', 'cha'].map((k)=>(
							<td key={k} align='center'>
								<TextInput type='number' value={a.abilities[k]} onChange={(v)=>setAbility(k, v)} size='2' />{' '}
								<span className='sb-mod'>({abilityMod(a.abilities[k])})</span>
							</td>
						))}
					</tr>
				</tbody>
			</table>
			<hr />
			<dl>
				<dt><strong>Saving Throws</strong></dt>
				<dd><TextInput value={a.saves} onChange={(v)=>setField('saves', v)} size='30' /></dd>{'\n'}
				<dt><strong>Skills</strong></dt>
				<dd><TextInput value={a.skills} onChange={(v)=>setField('skills', v)} size='30' /></dd>{'\n'}
				<dt><strong>Damage Resistances</strong></dt>
				<dd><TextInput value={a.damageResistances} onChange={(v)=>setField('damageResistances', v)} size='30' /></dd>{'\n'}
				<dt><strong>Damage Immunities</strong></dt>
				<dd><TextInput value={a.damageImmunities} onChange={(v)=>setField('damageImmunities', v)} size='30' /></dd>{'\n'}
				<dt><strong>Condition Immunities</strong></dt>
				<dd><TextInput value={a.conditionImmunities} onChange={(v)=>setField('conditionImmunities', v)} size='30' /></dd>{'\n'}
				<dt><strong>Senses</strong></dt>
				<dd><TextInput value={a.senses} onChange={(v)=>setField('senses', v)} size='30' /></dd>{'\n'}
				<dt><strong>Languages</strong></dt>
				<dd><TextInput value={a.languages} onChange={(v)=>setField('languages', v)} size='30' /></dd>{'\n'}
				<dt><strong>Challenge</strong></dt>
				<dd><TextInput value={a.challenge} onChange={(v)=>setField('challenge', v)} size='14' /></dd>
			</dl>
			<hr />
			<TraitList label={null} entries={a.traits} onChange={(v)=>setField('traits', v)} />
			<TraitList label='Actions' entries={a.actions} onChange={(v)=>setField('actions', v)} />
			<TraitList label='Legendary Actions' entries={a.legendaryActions} onChange={(v)=>setField('legendaryActions', v)} />
			<TraitList label='Lair Actions' entries={a.lairActions} onChange={(v)=>setField('lairActions', v)} />
			<TraitList label='Regional Effects' entries={a.regionalEffects} onChange={(v)=>setField('regionalEffects', v)} />
		</div>
	);
}

class StatBlockNodeView {
	constructor(node, view, getPos){
		this.node = node;
		this.view = view;
		this.getPos = getPos;
		this.dom = document.createElement('div');
		this.dom.classList.add('sb-nodeview');
		this.dom.contentEditable = 'false';
		this.selected = false;
		this.root = createRoot(this.dom);
		this.render();
	}
	getAttrs = ()=>this.node.attrs;
	setAttrs = (patch)=>{
		const { state, dispatch } = this.view;
		const pos = this.getPos();
		if(pos == null) return;
		const tr = state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, ...patch });
		dispatch(tr);
	};
	render = ()=>{
		this.root.render(
			<StatBlockForm
				getAttrs={this.getAttrs}
				setAttrs={this.setAttrs}
				isSelected={this.selected}
			/>,
		);
	};
	update(node){
		if(node.type !== this.node.type) return false;
		this.node = node;
		this.render();
		return true;
	}
	selectNode(){ this.selected = true; this.render(); }
	deselectNode(){ this.selected = false; this.render(); }
	stopEvent(event){
		const t = event.target;
		if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON')) return true;
		return false;
	}
	ignoreMutation(){ return true; }
	destroy(){ queueMicrotask(()=>this.root.unmount()); }
}

// ---- manifest -----------------------------------------------------------

export default {
	type         : 'statBlock',
	label        : 'Stat Block',
	category     : 'Rules',
	icon         : 'Shield',
	slashAliases : ['monster', 'creature', 'npc', 'enemy'],
	keepTogether : true,

	createAst : (overrides = {})=>({
		type : 'statBlock',
		...STATBLOCK_DEFAULT_ATTRS,
		...overrides,
	}),

	validateAst : (n)=>{
		const errs = [];
		if(typeof n.name !== 'string' || !n.name) errs.push('statBlock.name is required');
		if(typeof n.armorClass !== 'number') errs.push('statBlock.armorClass must be a number');
		if(typeof n.hitPoints !== 'number') errs.push('statBlock.hitPoints must be a number');
		if(!n.abilities || typeof n.abilities !== 'object') errs.push('statBlock.abilities must be an object');
		else {
			for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']){
				if(typeof n.abilities[k] !== 'number') errs.push(`statBlock.abilities.${k} must be a number`);
			}
		}
		return errs;
	},

	pmNode : {
		kind : 'atom',
		spec : {
			group : 'block',
			atom  : true,
			attrs : Object.fromEntries(
				Object.entries(STATBLOCK_DEFAULT_ATTRS).map(([k, v])=>[k, { default: v }]),
			),
			parseDOM : [{
				tag      : 'div.monster.frame',
				getAttrs : (dom)=>{
					const raw = dom.getAttribute('data-statblock');
					if(!raw) return {};
					try { return JSON.parse(raw); } catch (e) { return {}; }
				},
			}],
			toDOM : (node)=>['div', {
				class            : 'monster frame',
				'data-statblock' : JSON.stringify(node.attrs),
			}],
		},
	},

	NodeView : (node, view, getPos)=>new StatBlockNodeView(node, view, getPos),

	Render : StatBlockRender,

	astToPm : (block, schema)=>{
		const attrs = {};
		for (const k of Object.keys(schema.nodes.statBlock.spec.attrs)){
			if(block[k] !== undefined) attrs[k] = block[k];
		}
		return schema.nodes.statBlock.create(attrs);
	},
	pmToAst : (node, schema)=>{
		const out = { type: 'statBlock' };
		for (const k of Object.keys(schema.nodes.statBlock.spec.attrs)){
			out[k] = node.attrs[k];
		}
		return out;
	},

	exportMarkdown : (n)=>{
		const lines = [];
		lines.push(`___`);
		lines.push(`> ## ${n.name}`);
		lines.push(`> *${n.size} ${n.creatureType}, ${n.alignment}*`);
		lines.push(`> ___`);
		lines.push(`> - **Armor Class** ${n.armorClass}${n.armorClassNote ? ` (${n.armorClassNote})` : ''}`);
		lines.push(`> - **Hit Points** ${n.hitPoints}${n.hitDice ? ` (${n.hitDice})` : ''}`);
		lines.push(`> - **Speed** ${n.speed}`);
		lines.push(`> ___`);
		const a = n.abilities;
		lines.push(`> |STR|DEX|CON|INT|WIS|CHA|`);
		lines.push(`> |:---:|:---:|:---:|:---:|:---:|:---:|`);
		lines.push(`> |${abilityCell(a.str)}|${abilityCell(a.dex)}|${abilityCell(a.con)}|${abilityCell(a.int)}|${abilityCell(a.wis)}|${abilityCell(a.cha)}|`);
		lines.push(`> ___`);
		const optional = [
			['Saving Throws', n.saves], ['Skills', n.skills],
			['Damage Resistances', n.damageResistances],
			['Damage Immunities', n.damageImmunities],
			['Condition Immunities', n.conditionImmunities],
			['Senses', n.senses], ['Languages', n.languages],
		];
		for (const [label, value] of optional){
			if(value) lines.push(`> - **${label}** ${value}`);
		}
		lines.push(`> - **Challenge** ${n.challenge}`);
		lines.push(`> ___`);
		const sections = [
			[null, n.traits],
			['Actions', n.actions],
			['Legendary Actions', n.legendaryActions],
			['Lair Actions', n.lairActions],
			['Regional Effects', n.regionalEffects],
		];
		for (const [label, entries] of sections){
			if(!entries || !entries.length) continue;
			if(label) lines.push(`> ### ${label}`);
			for (const e of entries){
				lines.push(`> ***${e.name}.*** ${runsToMarkdown(e.text)}`);
			}
		}
		// Closing fence so the importer's PHB-form recognizer knows where the
		// block ends. Without this, a stat block "swallows" every following
		// heading + paragraph all the way to EOF.
		lines.push(`___`);
		return lines.join('\n');
	},

	// Stat-block recognizer. Two opening forms:
	//   1. The exporter's PHB form: a `___` fence on its own line followed by
	//      `> ## Name`. We consume lines through the closing dedent.
	//   2. Legacy mustache `{{monster,frame}} ... }}`. The body is parsed with
	//      the same field/section reader, so partially-filled blocks are
	//      tolerated. Fields that fail to parse are flagged via the importer
	//      report (see import/markdown.js, where `report.warnings` collects
	//      `ctx.warn` calls from this contributor).
	importPriority : 95,
	importMarkdown : (lines, i, ctx)=>{
		const open = (lines[i] || '').trim();
		const isFence    = open === '___';
		const isMustache = /^\{\{monster\b[\w,\s-]*\}\}?$/.test(open) || /^\{\{statblock\b[\w,\s-]*\}\}?$/.test(open) || open === '{{monster,frame' || open === '{{monster,frame}}';
		// Mustache forms can be split across lines; accept the more relaxed
		// `{{monster` / `{{monster,frame` as opening tokens too.
		const isMustacheOpen = isMustache || /^\{\{monster\b/.test(open) || /^\{\{statblock\b/.test(open);
		if(!isFence && !isMustacheOpen) return null;
		// Peek at the next non-blank line to confirm; fence form must be
		// followed by `> ## Name`. If not, defer.
		if(isFence){
			let k = i + 1;
			while (k < lines.length && lines[k].trim() === '') k++;
			if(!/^>\s+##\s+/.test(lines[k] || '')) return null;
		}
		const node = {
			type                : 'statBlock',
			variant             : '5e',
			name                : 'Unnamed Creature',
			size                : 'Medium',
			creatureType        : 'humanoid',
			alignment           : 'unaligned',
			armorClass          : 10,
			armorClassNote      : '',
			hitPoints           : 1,
			hitDice             : '',
			speed               : '30 ft.',
			abilities           : { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
			saves               : '',
			skills              : '',
			damageResistances   : '',
			damageImmunities    : '',
			conditionImmunities : '',
			senses              : '',
			languages           : '',
			challenge           : '0 (10 XP)',
			traits              : [],
			actions             : [],
			legendaryActions    : [],
			lairActions         : [],
			regionalEffects     : [],
		};
		const warn = ctx && ctx.warn ? ctx.warn : ()=>{};
		// Walk forward, stripping a leading `> ` on every line so we can
		// pattern-match the body uniformly across both forms.
		let j = i + 1;
		const end = ()=>(isFence
			? /^___\s*$/.test(lines[j] || '')
			: /^\}\}\s*$/.test(lines[j] || ''));
		// `> ___` separators inside the fence body delimit sections; we let
		// them pass through and ignore them.
		let currentSection = null; // null|'traits'|'actions'|'legendaryActions'|'lairActions'|'regionalEffects'
		const sectionFor = (label)=>({
			'Actions'           : 'actions',
			'Legendary Actions' : 'legendaryActions',
			'Lair Actions'      : 'lairActions',
			'Regional Effects'  : 'regionalEffects',
		}[label.trim()] || null);
		while (j < lines.length && !end()){
			const raw = lines[j];
			const stripped = raw.replace(/^>\s?/, '');
			if(stripped === '___' || stripped.trim() === ''){ j++; continue; }
			let m;
			if((m = /^##\s+(.+)$/.exec(stripped))){ node.name = m[1].trim(); j++; continue; }
			if((m = /^\*([^*]+)\*\s*$/.exec(stripped))){
				// "*Medium humanoid (human, druid), neutral evil*"
				const mm = /^(.*?)\s+([a-zA-Z][\w\s().,]*?),\s*(.+)$/.exec(m[1]);
				if(mm){
					node.size = mm[1].trim();
					node.creatureType = mm[2].trim();
					node.alignment = mm[3].trim();
				} else {
					warn(`statBlock: could not parse size/type/alignment line: ${m[1]}`);
				}
				j++; continue;
			}
			// Triple-asterisk trait/action: `***Name.*** body`
			if((m = /^\*\*\*([^.]+?)\.\*\*\*\s*(.*)$/.exec(stripped))){
				const entry = { name: m[1].trim(), text: [{ text: m[2].trim() }] };
				if(currentSection === null) node.traits.push(entry);
				else node[currentSection].push(entry);
				j++; continue;
			}
			// Section heading: `### Actions`
			if((m = /^###\s+(.+)$/.exec(stripped))){
				const section = sectionFor(m[1]);
				if(section){ currentSection = section; } else warn(`statBlock: unknown section heading "${m[1]}"`);
				j++; continue;
			}
			// Field bullets: `- **Armor Class** 17 (thorny mail)`
			if((m = /^-\s*\*\*([^*]+)\*\*\s+(.+)$/.exec(stripped))){
				const label = m[1].trim();
				const value = m[2].trim();
				if(label === 'Armor Class'){
					const am = /^(\d+)(?:\s*\(([^)]+)\))?$/.exec(value);
					if(am){ node.armorClass = Number(am[1]); node.armorClassNote = am[2] || ''; } else warn(`statBlock: armor class "${value}" not parsable`);
				} else if(label === 'Hit Points'){
					const hm = /^(\d+)(?:\s*\(([^)]+)\))?$/.exec(value);
					if(hm){ node.hitPoints = Number(hm[1]); node.hitDice = hm[2] || ''; } else warn(`statBlock: hit points "${value}" not parsable`);
				} else if(label === 'Speed'){ node.speed = value; } else if(label === 'Saving Throws'){ node.saves = value; } else if(label === 'Skills'){ node.skills = value; } else if(label === 'Damage Resistances'){ node.damageResistances = value; } else if(label === 'Damage Immunities'){ node.damageImmunities = value; } else if(label === 'Condition Immunities'){ node.conditionImmunities = value; } else if(label === 'Senses'){ node.senses = value; } else if(label === 'Languages'){ node.languages = value; } else if(label === 'Challenge'){ node.challenge = value; } else warn(`statBlock: unknown field "${label}"`);
				j++; continue;
			}
			// Ability score table: `|STR|DEX|CON|INT|WIS|CHA|`
			if(/^\|\s*STR\s*\|/i.test(stripped)){
				// Skip header + separator, pull the numeric row.
				j++;
				if(/^\|[\s:|-]+\|$/.test((lines[j] || '').replace(/^>\s?/, ''))) j++;
				const row = (lines[j] || '').replace(/^>\s?/, '');
				const cells = row.split('|').map((c)=>c.trim()).filter(Boolean);
				const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
				cells.forEach((cell, idx)=>{
					if(idx >= keys.length) return;
					const num = /^(\d+)/.exec(cell);
					if(num) node.abilities[keys[idx]] = Number(num[1]);
					else warn(`statBlock: ability cell "${cell}" not parsable`);
				});
				j++; continue;
			}
			// Anything else gets folded into the most recent entry's text. If
			// no entry has been started yet, flag and skip.
			const sectionList = currentSection === null ? node.traits : node[currentSection];
			if(sectionList.length){
				const last = sectionList[sectionList.length - 1];
				const lastText = last.text[0]?.text || '';
				last.text = [{ text: `${lastText} ${stripped.trim()}`.trim() }];
			}
			j++;
		}
		// Consume the closing fence/}} marker if we landed on it.
		if(j < lines.length && end()) j++;
		return { node, advance: j - i };
	},
};

export { StatBlockNodeView };
