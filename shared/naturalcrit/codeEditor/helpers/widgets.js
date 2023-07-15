const React = require('react');
const ReactDOM = require('react-dom');
const { PATTERNS, FIELD_TYPE, HINT_TYPE, UNITS } = require('./widget-elements/constants');
require('./widget-elements/hints/hints.jsx');
const { Text, Checkbox } = require('./widget-elements');
const CodeMirror = require('../code-mirror.js');

// See https://codemirror.net/5/addon/hint/css-hint.js for code reference
const pseudoClasses = { 'active'           : 1, 'after'            : 1, 'before'           : 1, 'checked'          : 1, 'default'          : 1,
	'disabled'         : 1, 'empty'            : 1, 'enabled'          : 1, 'first-child'      : 1, 'first-letter'     : 1,
	'first-line'       : 1, 'first-of-type'    : 1, 'focus'            : 1, 'hover'            : 1, 'in-range'         : 1,
	'indeterminate'    : 1, 'invalid'          : 1, 'lang'             : 1, 'last-child'       : 1, 'last-of-type'     : 1,
	'link'             : 1, 'not'              : 1, 'nth-child'        : 1, 'nth-last-child'   : 1, 'nth-last-of-type' : 1,
	'nth-of-type'      : 1, 'only-of-type'     : 1, 'only-child'       : 1, 'optional'         : 1, 'out-of-range'     : 1,
	'placeholder'      : 1, 'read-only'        : 1, 'read-write'       : 1, 'required'         : 1, 'root'             : 1,
	'selection'        : 1, 'target'           : 1, 'valid'            : 1, 'visited'          : 1
};

const genKey = (...args)=>args.join('-');

module.exports = function(widgets, cm, setHints) {
	const spec = CodeMirror.resolveMode('text/css');
	const headless = CodeMirror(()=>{});

	const makeTempCSSDoc = (value)=>CodeMirror.Doc(`.selector {\n${value}\n}`, 'text/css');

	// See https://codemirror.net/5/addon/hint/css-hint.js for code reference
	const getStyleHints = (field, value)=>{
		const tempDoc = makeTempCSSDoc(`${field.name}:${value?.replaceAll(`'"`, '') ?? ''}`);
		headless.swapDoc(tempDoc);
		const pos = CodeMirror.Pos(1, field.name.length + 1 + (value?.length ?? 0), false);
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

		let result = [];
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
		result = result.map((h)=>({ hint: h, type: HINT_TYPE.VALUE }))
			.filter((h)=>CSS.supports(field.name, h.hint));

		const numberSuffix = word.slice(-4).replaceAll(/\d/g, '');
		if(token.type === 'number' && !UNITS.includes(numberSuffix)) {
			result.push(...UNITS
				.filter((u)=>u.includes(numberSuffix) && CSS.supports(field.name, `${value.replaceAll(/\D/g, '') ?? ''}${u}`))
				.map((u)=>({ hint: u, type: HINT_TYPE.NUMBER_SUFFIX }))
			);
		}

		return result;
	};

	const widgetOptions = widgets.map((widget)=>({
		name         : widget.name,
		pattern      : PATTERNS.snippet[widget.type](widget.name),
		renderWidget : (n, node)=>{
			const parent = document.createElement('div');
			const textFieldNames = (widget.fields || []).filter((f)=>f.type === FIELD_TYPE.TEXT).map((f)=>f.name);
			const { text } = cm.lineInfo(n);

			const fields = (widget.fields || []).map((field)=>{
				if(field.type === FIELD_TYPE.CHECKBOX) {
					return <Checkbox key={genKey(widget.name, n, field.name)} cm={cm} CodeMirror={CodeMirror} n={n} prefix={widget.name} value={field.name}/>;
				} else if(field.type === FIELD_TYPE.TEXT) {
					return <Text key={genKey(widget.name, n, field.name)} cm={cm} CodeMirror={CodeMirror} field={field} n={n} text={text} setHints={(f, h)=>setHints(h, f)} getStyleHints={getStyleHints}/>;
				} else {
					return null;
				}
			}).filter(Boolean);

			const styles = [...text.matchAll(PATTERNS.collectStyles)].map(([_, style])=>{
				if(textFieldNames.includes(style)) return false;
				const field = {
					name      : style,
					type      : FIELD_TYPE.TEXT,
					increment : 5,
					hints     : true,
				};
				return <Text key={genKey(widget.name, n, style)} cm={cm} CodeMirror={CodeMirror} field={field} n={n} text={text} setHints={(f, h)=>setHints(h, f)} getStyleHints={getStyleHints}/>;
			}).filter(Boolean);

			ReactDOM.render(<React.Fragment>
				{fields}
				{styles}
			</React.Fragment>, node || parent);

			return node || parent;
		}
	}));

	const updateLineWidgets = (n)=>{
		const { text, widgets } =  cm.lineInfo(n);
		const widgetOption = widgetOptions.find((option)=>!!text.match(option.pattern));
		if(!widgetOption) return;
		if(!!widgets) {
			for (const widget of widgets) {
				widgetOption.renderWidget(n, widget.node);
			}
		} else {
			return cm.addLineWidget(n, widgetOption.renderWidget(n), {
				above       : false,
				coverGutter : false,
				noHScroll   : true,
				className   : `snippet-options-widget ${widgetOption.name}-widget ${widgetOption.name}-widget-${n}`
			});
		}
	};

	return {
		removeLineWidget : (widget)=>{
			cm.removeLineWidget(widget);
		},
		updateLineWidgets,
		updateAllLineWidgets : ()=>{
			for (let i = 0; i < cm.lineCount(); i++) {
				const { widgets } = cm.lineInfo(i);
				if(!!widgets) {
					updateLineWidgets(i);
				}
			}
		},
		updateWidgetGutter : ()=>{
			cm.operation(()=>{
				for (let i = 0; i < cm.lineCount(); i++) {
					const { text, widgets } = cm.lineInfo(i);

					if(widgetOptions.some((option)=>text.match(option.pattern))) {
						if(widgets) {
							continue;
						}
						const optionsMarker = document.createElement('div');
						optionsMarker.style.color = '#822';
						optionsMarker.style.cursor = 'pointer';
						optionsMarker.innerHTML = '●';
						cm.setGutterMarker(i, 'widget-gutter', optionsMarker);
					} else {
						cm.setGutterMarker(i, 'widget-gutter', null);
					}
				}
			});
		}
	};
};