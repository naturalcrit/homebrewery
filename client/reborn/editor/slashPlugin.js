// Slash-command plugin.
//
// Wave 4: the catalogue of insertable items is sourced from
// `../blocks/registry.js`. This file owns the trigger detection, the popup
// view, and the keyboard handling — none of which know which block types
// exist.

import { Plugin, PluginKey } from 'prosemirror-state';
import { schema } from './schema.js';
import { slashMenuItems } from '../blocks/registry.js';

export const slashKey = new PluginKey('slashCommand');

// Re-export so existing tests / consumers keep working without churn.
export const slashItems = slashMenuItems;

// ---- filter -------------------------------------------------------------

function filterItems(query){
	const q = query.trim().toLowerCase();
	if(!q) return slashMenuItems;
	const tokens = q.split(/\s+/);
	return slashMenuItems.filter((item)=>{
		const hay = `${item.label} ${item.keywords}`.toLowerCase();
		return tokens.every((t)=>hay.includes(t));
	});
}

// ---- popup view ---------------------------------------------------------

class SlashPopup {
	constructor(view){
		this.view = view;
		this.dom = document.createElement('div');
		this.dom.className = 'slash-popup';
		this.dom.style.position = 'absolute';
		this.dom.style.zIndex = '9999';
		this.dom.style.display = 'none';
		document.body.appendChild(this.dom);
		this.activeIndex = 0;
		this.lastItems = slashMenuItems;
	}
	update(view){
		this.view = view;
		const state = slashKey.getState(view.state);
		if(!state || !state.active){ this.hide(); return; }
		this.lastItems = filterItems(state.query || '');
		if(this.activeIndex >= this.lastItems.length) this.activeIndex = 0;
		this.render(state);
	}
	render(state){
		const coords = this.view.coordsAtPos(state.from);
		this.dom.style.left = `${coords.left}px`;
		this.dom.style.top  = `${coords.bottom + 4}px`;
		this.dom.style.display = 'block';
		this.dom.innerHTML = '';
		if(!this.lastItems.length){
			const empty = document.createElement('div');
			empty.className = 'slash-empty';
			empty.textContent = 'No matches';
			this.dom.appendChild(empty);
			return;
		}
		this.lastItems.forEach((item, i)=>{
			const row = document.createElement('div');
			row.className = `slash-item${i === this.activeIndex ? ' active' : ''}`;
			row.textContent = item.label;
			row.dataset.id = item.id;
			row.addEventListener('mousedown', (e)=>{
				e.preventDefault();
				this.commitItem(item);
			});
			this.dom.appendChild(row);
		});
	}
	hide(){ this.dom.style.display = 'none'; }
	commitItem(item){
		const state = slashKey.getState(this.view.state);
		if(!state || !state.active) return;
		item.insert(this.view, { from: state.from, to: state.to });
		this.view.focus();
	}
	commitActive(){
		if(!this.lastItems.length) return false;
		this.commitItem(this.lastItems[this.activeIndex]);
		return true;
	}
	move(delta){
		if(!this.lastItems.length) return;
		this.activeIndex = (this.activeIndex + delta + this.lastItems.length) % this.lastItems.length;
		this.update(this.view);
	}
	destroy(){ this.dom.remove(); }
}

// ---- plugin -------------------------------------------------------------

export function slashCommandPlugin(){
	return new Plugin({
		key   : slashKey,
		state : {
			init(){ return { active: false, from: 0, to: 0, query: '' }; },
			apply(tr, prev, _oldState, newState){
				const meta = tr.getMeta(slashKey);
				if(meta){
					return { ...prev, ...meta };
				}
				if(!prev.active) return prev;
				const sel = newState.selection;
				const $from = sel.$from;
				if(!sel.empty || $from.parent.type !== schema.nodes.paragraph){
					return { ...prev, active: false };
				}
				const paraStart = $from.start();
				const text = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n');
				const slashIdx = text.lastIndexOf('/');
				if(slashIdx === -1) return { ...prev, active: false };
				const from = paraStart + slashIdx;
				const to   = sel.from;
				const query = text.slice(slashIdx + 1);
				if(/[\n]/.test(query) || query.length > 32) return { ...prev, active: false };
				return { active: true, from, to, query };
			},
		},
		props : {
			handleKeyDown(view, event){
				const state = slashKey.getState(view.state);
				const sel = view.state.selection;
				if(!state.active){
					if(event.key === '/' && sel.empty){
						const $from = sel.$from;
						if($from.parent.type === schema.nodes.paragraph){
							queueMicrotask(()=>{
								const tr = view.state.tr.setMeta(slashKey, {
									active : true,
									from   : view.state.selection.from - 1,
									to     : view.state.selection.from,
									query  : '',
								});
								view.dispatch(tr);
							});
						}
					}
					return false;
				}
				const popup = view._slashPopup;
				if(event.key === 'ArrowDown'){ popup.move(1); event.preventDefault(); return true; }
				if(event.key === 'ArrowUp'){ popup.move(-1); event.preventDefault(); return true; }
				if(event.key === 'Enter'){
					if(popup.commitActive()){ event.preventDefault(); return true; }
				}
				if(event.key === 'Escape'){
					view.dispatch(view.state.tr.setMeta(slashKey, { active: false }));
					event.preventDefault(); return true;
				}
				return false;
			},
		},
		view(editorView){
			const popup = new SlashPopup(editorView);
			editorView._slashPopup = popup;
			return {
				update  : (view)=>popup.update(view),
				destroy : ()=>{ popup.destroy(); delete editorView._slashPopup; },
			};
		},
	});
}

// Programmatic insertion as if the popup picked the named item.
export function insertSlashItem(view, id){
	const state = slashKey.getState(view.state);
	if(!state || !state.active) return false;
	const item = slashMenuItems.find((x)=>x.id === id);
	if(!item) return false;
	item.insert(view, { from: state.from, to: state.to });
	return true;
}
