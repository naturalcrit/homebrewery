const React = require('react');
const ReactDOM = require('react-dom');
const { PATTERNS, FIELD_TYPE } = require('./widget-elements/constants');

module.exports = function(CodeMirror, widgets, cm) {
	const { cClass, field } = require('./widget-elements')(CodeMirror);
	const widgetOptions = widgets.map((widget)=>({
		name         : widget.name,
		pattern      : PATTERNS.widget[widget.type](widget.name),
		createWidget : (n, node)=>{
			const parent = document.createElement('div');
			const classes = (widget.classes || []).map((c, i)=>cClass(cm, n, `{{${widget.name}`, c));
			const fieldNames = (widget.fields || []).map((f)=>f.name);
			const fields = (widget.fields || []).map((f, i)=>field(cm, n, f)).filter((f)=>!!f);
			const { text } = cm.lineInfo(n);
			const styles = [...text.matchAll(PATTERNS.collectStyles)].map(([_, style])=>{
				if(fieldNames.includes(style)) return false;
				return field(cm, n, {
					name      : style,
					type      : FIELD_TYPE.STYLE,
					increment : 5,
					lineBreak : true
				});
			}).filter((s)=>!!s);

			ReactDOM.render(<React.Fragment>
				{classes}
				{fields}
				{styles}
			</React.Fragment>, node || parent);

			return node || parent;
		}
	}));

	const updateLineWidgets = (n, remove)=>{
		const { text, widgets } =  cm.lineInfo(n);
		const widgetOption = widgetOptions.find((option)=>!!text.match(option.pattern));
		if(!widgetOption) return;
		if(!!widgets) {
			for (const widget of widgets) {
				widgetOption.createWidget(n, widget.node);
			}
		} else {
			cm.addLineWidget(n, widgetOption.createWidget(n), {
				above       : false,
				coverGutter : false,
				noHScroll   : true,
				className   : `snippet-options-widget ${widgetOption.name}-widget`
			});
		}
	};

	return {
		removeLineWidgets : (widget)=>{
			cm.removeLineWidget(widget);
		},
		updateLineWidgets,
		updateAllLineWidgets : ()=>{
			for (let i = 0; i < cm.lineCount(); i++) {
				const { widgets } = cm.lineInfo(i);
				if(!!widgets)
					updateLineWidgets(i);
			}
		},
		updateWidgetGutter : ()=>{
			cm.operation(()=>{
				for (let i = 0; i < cm.lineCount(); i++) {
					const line = cm.getLine(i);

					if(widgetOptions.some((option)=>line.match(option.pattern))) {
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