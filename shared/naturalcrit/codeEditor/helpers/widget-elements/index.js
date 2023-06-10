const React = require('react');
const _ = require('lodash');
const Field = require('./field/field.jsx');
const { PATTERNS } = require('./constants');

const makeTempCSSDoc = (CodeMirror, value)=>CodeMirror.Doc(`.selector {
${value}
}`, 'text/css');

const pseudoClasses = { 'active'           : 1, 'after'            : 1, 'before'           : 1, 'checked'          : 1, 'default'          : 1,
	'disabled'         : 1, 'empty'            : 1, 'enabled'          : 1, 'first-child'      : 1, 'first-letter'     : 1,
	'first-line'       : 1, 'first-of-type'    : 1, 'focus'            : 1, 'hover'            : 1, 'in-range'         : 1,
	'indeterminate'    : 1, 'invalid'          : 1, 'lang'             : 1, 'last-child'       : 1, 'last-of-type'     : 1,
	'link'             : 1, 'not'              : 1, 'nth-child'        : 1, 'nth-last-child'   : 1, 'nth-last-of-type' : 1,
	'nth-of-type'      : 1, 'only-of-type'     : 1, 'only-child'       : 1, 'optional'         : 1, 'out-of-range'     : 1,
	'placeholder'      : 1, 'read-only'        : 1, 'read-write'       : 1, 'required'         : 1, 'root'             : 1,
	'selection'        : 1, 'target'           : 1, 'valid'            : 1, 'visited'          : 1
};

module.exports = function(CodeMirror) {
	const spec = CodeMirror.resolveMode('text/css');
	const headless = CodeMirror(()=>{});

	// See https://codemirror.net/5/addon/hint/css-hint.js for code reference
	const getStyleHints = (field, value)=>{
		const tempDoc = makeTempCSSDoc(CodeMirror, `${field.name}:${value?.replaceAll(`'"`, '') ?? ''}`);
		headless.swapDoc(tempDoc);
		const pos = CodeMirror.Pos(1, field.name.length + 1 + value?.length, false);
		const token = headless.getTokenAt(pos);
		const inner = CodeMirror.innerMode(tempDoc.getMode(), token?.state);

		if(inner.mode.name !== 'css') return;

		if(token.type === 'keyword' && '!important'.indexOf(token.string) === 0)
			return { list : ['!important'], from : CodeMirror.Pos(pos.line, token.start),
				to   : CodeMirror.Pos(pos.line, token.end) };

		let start = token.start, end = pos.ch, word = token.string.slice(0, end - start);
		if(/[^\w$_-]/.test(word)) {
			word = ''; start = end = pos.ch;
		}

		const result = [];
		const add = (keywords)=>{
			for (const name in keywords)
				if(!word || name.lastIndexOf(word, 0) === 0)
					result.push(name);
		};

		const st = inner.state.state;
		if(st === 'pseudo' || token.type === 'variable-3') {
			add(pseudoClasses);
		} else if(st === 'block' || st === 'maybeprop') {
			add(spec.propertyKeywords);
		} else if(st === 'prop' || st === 'parens' || st === 'at' || st === 'params') {
			add(spec.valueKeywords);
			add(spec.colorKeywords);
		} else if(st === 'media' || st === 'media_parens') {
			add(spec.mediaTypes);
			add(spec.mediaFeatures);
		}
		return result;
	};

	return {
		cClass : (cm, n, prefix, cClass)=>{
			const { text } = cm.lineInfo(n);
			const id = `${_.kebabCase(prefix.replace('{{', ''))}-${_.kebabCase(cClass)}-${n}`;
			const frameChange = (e)=>{
				if(!!e.target && e.target.checked)
					cm.replaceRange(`,${cClass}`, CodeMirror.Pos(n, prefix.length), CodeMirror.Pos(n, prefix.length), '+insert');
				else {
					const start = text.indexOf(`,${cClass}`);
					if(start > -1)
						cm.replaceRange('', CodeMirror.Pos(n, start), CodeMirror.Pos(n, start + cClass.length + 1), '-delete');
					else
						e.target.checked = true;
				}
			};
			return <React.Fragment key={`${_.kebabCase(prefix)}-${cClass}-${n}`}>
				<input type='checkbox' id={id} onChange={frameChange} checked={_.includes(text, `,${cClass}`)}/>
				<label htmlFor={id}>{_.startCase(cClass)}</label>
			</React.Fragment>;
		},
		field : (cm, n, field)=>{
			const { text } = cm.lineInfo(n);
			const pattern = PATTERNS.field[field.type](field.name);
			const [_, __, value] = text.match(pattern) ?? [];
			const hints = getStyleHints(field, value);

			const inputChange = (e)=>{
				const [_, label, current] = text.match(pattern) ?? [null, field.name, ''];
				let index = text.indexOf(`${label}:${current}`);
				let value = e.target.value;
				if(index === -1) {
					index = text.length;
					value = `,${field.name}:${value}`;
				} else {
					index = index + 1 + field.name.length;
				}
				cm.replaceRange(value, CodeMirror.Pos(n, index), CodeMirror.Pos(n, index + current.length), '+insert');
			};
			return <React.Fragment key={`${field.name}-${n}`}>
				<Field field={field} value={value} hints={hints} n={n} onChange={inputChange}/>
				{!!field.lineBreak ? <br/> : null}
			</React.Fragment>;
		}
	};
};
