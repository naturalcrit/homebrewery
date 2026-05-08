import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { runsToMarkdown, plainTextToRuns, inlineRunsToPlainText } from './_helpers.js';
import Inline from '../renderer/Inline.jsx';

// 5e spell block. There's no dedicated `.spell` CSS class in the canonical
// 5ePHB stylesheet (spells are conventionally just structured h4 + italic
// level/school line + body), so the DOM we emit mirrors the legacy
// `magic.gen.js` snippet:
//
//   <div class="spell">
//     <h4>Name</h4>
//     <p><em>1st-level evocation</em></p>
//     <p><strong>Casting Time:</strong> 1 action</p>
//     <p><strong>Range:</strong> 60 feet</p>
//     <p><strong>Components:</strong> V, S, M (a small bell)</p>
//     <p><strong>Duration:</strong> Instantaneous</p>
//     <p>Description …</p>
//     <p><em><strong>At Higher Levels.</strong></em> …</p>
//     <p><em>Classes: Wizard, Sorcerer</em></p>
//   </div>
//
// The wrapping `<div class="spell">` is harmless even though no CSS targets it
// (it's the right hook for a future spell theme to engage), and it gives
// document-level operations a single block to lift, drag, or delete.

const ORDINALS = { 0: 'cantrip', 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: '8th', 9: '9th' };

function levelSchoolLine(s){
	if(s.level === 0) return `${(s.school || '').toLowerCase()} cantrip`;
	const lvl = ORDINALS[s.level] || `${s.level}th`;
	return `${lvl}-level ${(s.school || '').toLowerCase()}`;
}

const SPELL_DEFAULTS = {
	name           : 'Magic Missile',
	level          : 1,
	school         : 'evocation',
	castingTime    : '1 action',
	range          : '120 feet',
	components     : 'V, S',
	duration       : 'Instantaneous',
	classes        : 'Sorcerer, Wizard',
	description    : [{ text: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.' }],
	atHigherLevels : [],
};

function SpellRender({ block }){
	return (
		<div className='spell'>
			<h4>{block.name}</h4>
			<p><em>{levelSchoolLine(block)}</em></p>
			<p><strong>Casting Time:</strong> {block.castingTime}</p>
			<p><strong>Range:</strong> {block.range}</p>
			<p><strong>Components:</strong> {block.components}</p>
			<p><strong>Duration:</strong> {block.duration}</p>
			<p><Inline runs={block.description} /></p>
			{block.atHigherLevels && block.atHigherLevels.length > 0 && (
				<p><em><strong>At Higher Levels.</strong></em> <Inline runs={block.atHigherLevels} /></p>
			)}
			{block.classes && (
				<p><em>Classes: {block.classes}</em></p>
			)}
		</div>
	);
}

// ---- editor form --------------------------------------------------------

function TextInput({ value, onChange, type = 'text', size, placeholder, className }){
	return (
		<input
			type={type}
			className={`spell-input ${className || ''}`}
			value={value ?? ''}
			placeholder={placeholder}
			size={size}
			onChange={(e)=>onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
			onKeyDown={(e)=>e.stopPropagation()}
			onMouseDown={(e)=>e.stopPropagation()}
		/>
	);
}

function SpellForm({ getAttrs, setAttrs, isSelected }){
	const [, force] = useState(0);
	const a = getAttrs();
	const setField = (k, v)=>{ setAttrs({ [k]: v }); force((x)=>x + 1); };
	return (
		<div className={`spell${isSelected ? ' spell-selected' : ''}`}>
			<h4>
				<TextInput value={a.name} onChange={(v)=>setField('name', v)} className='spell-name' />
			</h4>
			<p>
				<em>
					<TextInput type='number' value={a.level} onChange={(v)=>setField('level', v)} size='2' />
					{'-level '}
					<TextInput value={a.school} onChange={(v)=>setField('school', v)} size='14' />
				</em>
			</p>
			<p><strong>Casting Time:</strong>{' '}
				<TextInput value={a.castingTime} onChange={(v)=>setField('castingTime', v)} size='20' />
			</p>
			<p><strong>Range:</strong>{' '}
				<TextInput value={a.range} onChange={(v)=>setField('range', v)} size='20' />
			</p>
			<p><strong>Components:</strong>{' '}
				<TextInput value={a.components} onChange={(v)=>setField('components', v)} size='30' />
			</p>
			<p><strong>Duration:</strong>{' '}
				<TextInput value={a.duration} onChange={(v)=>setField('duration', v)} size='20' />
			</p>
			<p>
				<TextInput
					value={inlineRunsToPlainText(a.description)}
					onChange={(v)=>setField('description', plainTextToRuns(v))}
					placeholder='Spell description'
					size='80'
				/>
			</p>
			<p>
				<em>Classes:{' '}
					<TextInput value={a.classes} onChange={(v)=>setField('classes', v)} size='30' />
				</em>
			</p>
		</div>
	);
}

class SpellNodeView {
	constructor(node, view, getPos){
		this.node = node;
		this.view = view;
		this.getPos = getPos;
		this.dom = document.createElement('div');
		this.dom.classList.add('spell-nodeview');
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
			<SpellForm getAttrs={this.getAttrs} setAttrs={this.setAttrs} isSelected={this.selected} />,
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
	type         : 'spell',
	label        : 'Spell',
	category     : 'Rules',
	icon         : 'Sparkles',
	slashAliases : ['spell', 'magic', 'cast'],
	keepTogether : true,

	createAst : (overrides = {})=>({
		type : 'spell',
		...SPELL_DEFAULTS,
		...overrides,
	}),

	validateAst : (n)=>{
		const errs = [];
		if(typeof n.name !== 'string' || !n.name) errs.push('spell.name is required');
		if(typeof n.level !== 'number' || n.level < 0 || n.level > 9) errs.push('spell.level must be 0..9');
		if(typeof n.school !== 'string') errs.push('spell.school must be a string');
		return errs;
	},

	pmNode : {
		kind : 'atom',
		spec : {
			group : 'block',
			atom  : true,
			attrs : Object.fromEntries(
				Object.entries(SPELL_DEFAULTS).map(([k, v])=>[k, { default: v }]),
			),
			parseDOM : [{
				tag      : 'div.spell',
				getAttrs : (dom)=>{
					const raw = dom.getAttribute('data-spell');
					if(!raw) return {};
					try { return JSON.parse(raw); } catch (e) { return {}; }
				},
			}],
			toDOM : (node)=>['div', {
				class        : 'spell',
				'data-spell' : JSON.stringify(node.attrs),
			}],
		},
	},

	NodeView : (node, view, getPos)=>new SpellNodeView(node, view, getPos),

	Render : SpellRender,

	astToPm : (block, schema)=>{
		const attrs = {};
		for (const k of Object.keys(schema.nodes.spell.spec.attrs)){
			if(block[k] !== undefined) attrs[k] = block[k];
		}
		return schema.nodes.spell.create(attrs);
	},
	pmToAst : (node, schema)=>{
		const out = { type: 'spell' };
		for (const k of Object.keys(schema.nodes.spell.spec.attrs)){
			out[k] = node.attrs[k];
		}
		return out;
	},

	exportMarkdown : (n)=>{
		const lines = [];
		lines.push(`#### ${n.name}`);
		lines.push(`*${levelSchoolLine(n)}*`);
		lines.push('');
		lines.push(`**Casting Time:** ${n.castingTime}`);
		lines.push(`**Range:** ${n.range}`);
		lines.push(`**Components:** ${n.components}`);
		lines.push(`**Duration:** ${n.duration}`);
		lines.push('');
		lines.push(runsToMarkdown(n.description));
		if(n.atHigherLevels && n.atHigherLevels.length){
			lines.push('');
			lines.push(`***At Higher Levels.*** ${runsToMarkdown(n.atHigherLevels)}`);
		}
		if(n.classes){
			lines.push('');
			lines.push(`*Classes: ${n.classes}*`);
		}
		return lines.join('\n');
	},

	importPriority : 85,
	importMarkdown : (lines, i)=>{
		// Recognize: #### Name  /  *Nth-level school* OR *school cantrip*
		const m1 = /^####\s+(.+)$/.exec(lines[i] || '');
		if(!m1) return null;
		const next = lines[i + 1] || '';
		const lvlSchool = /^\*\s*(?:(\d+)(?:st|nd|rd|th)-level\s+(\w+)|(\w+)\s+cantrip)\s*\*\s*$/i.exec(next);
		if(!lvlSchool) return null;
		const level  = lvlSchool[1] ? Number(lvlSchool[1]) : 0;
		const school = (lvlSchool[2] || lvlSchool[3] || '').toLowerCase();
		const node = {
			type           : 'spell',
			name           : m1[1].trim(),
			level,
			school,
			castingTime    : '',
			range          : '',
			components     : '',
			duration       : '',
			classes        : '',
			description    : [],
			atHigherLevels : [],
		};
		let j = i + 2;
		// Skip blank line after the level/school line.
		while (j < lines.length && lines[j].trim() === '') j++;
		// Match labelled fields.
		const fieldRe = /^\*\*(Casting Time|Range|Components|Duration):\*\*\s*(?::\s*::\s*)?(.*)$/i;
		while (j < lines.length){
			const fm = fieldRe.exec(lines[j]);
			if(!fm) break;
			const key = fm[1].toLowerCase();
			const val = fm[2].trim();
			if(key === 'casting time') node.castingTime = val;
			else if(key === 'range') node.range = val;
			else if(key === 'components') node.components = val;
			else if(key === 'duration') node.duration = val;
			j++;
		}
		// Skip blanks before description.
		while (j < lines.length && lines[j].trim() === '') j++;
		// Description = remaining lines until blank or another #### / \page / etc.
		const descLines = [];
		while (j < lines.length && lines[j].trim() !== '' && !/^####\s/.test(lines[j]) && !/^#+\s/.test(lines[j]) && !/^\\page/.test(lines[j])){
			descLines.push(lines[j]);
			j++;
		}
		if(descLines.length) node.description = [{ text: descLines.join(' ') }];
		return { node, advance: j - i };
	},
};

export { SpellNodeView };
