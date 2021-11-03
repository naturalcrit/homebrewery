/* eslint-disable max-lines */
module.exports = {
	enableCodeFolding : function (CodeMirror) {
		// foldcode.js
		const makeWidget = function(cm, options, range) {
			let widget = getOption(cm, options, 'widget');

			if(typeof widget == 'function') {
				widget = widget(range.from, range.to);
			}

			if(typeof widget == 'string') {
				const text = document.createTextNode(widget);
				widget = document.createElement('span');
				widget.appendChild(text);
				widget.className = 'CodeMirror-foldmarker';
			} else if(widget) {
				widget = widget.cloneNode(true);
			}
			return widget;
		};

		const doFold = function(cm, pos, options, force) {
			let finder;
			if(options && options.call) {
				finder = options;
				options = null;
			} else {
				finder = getOption(cm, options, 'rangeFinder');
			}
			if(typeof pos == 'number') pos = CodeMirror.Pos(pos, 0);
			const minSize = getOption(cm, options, 'minFoldSize');

			const getRange = function(allowFolded) {
				const range = finder(cm, pos);
				if(!range || range.to.line - range.from.line < minSize) return null;
				if(force === 'fold') return range;

				const marks = cm.findMarksAt(range.from);
				for (let i = 0; i < marks.length; ++i) {
					if(marks[i].__isFold) {
						if(!allowFolded) return null;
						range.cleared = true;
						marks[i].clear();
					}
				}
				return range;
			};

			let range = getRange(true);
			if(getOption(cm, options, 'scanUp')) while (!range && pos.line > cm.firstLine()) {
				pos = CodeMirror.Pos(pos.line - 1, 0);
				range = getRange(false);
			}
			if(!range || range.cleared || force === 'unfold') return;

			const myWidget = makeWidget(cm, options, range);
			CodeMirror.on(myWidget, 'mousedown', function (e) {
				myRange.clear();
				CodeMirror.e_preventDefault(e);
			});
			const myRange = cm.markText(range.from, range.to, {
				replacedWith : myWidget,
				clearOnEnter : getOption(cm, options, 'clearOnEnter'),
				__isFold     : true
			});
			myRange.on('clear', function (from, to) {
				CodeMirror.signal(cm, 'unfold', cm, from, to);
			});
			CodeMirror.signal(cm, 'fold', cm, range.from, range.to);
		};

		// Clumsy backwards-compatible interface
		CodeMirror.newFoldFunction = function (rangeFinder, widget) {
			return function (cm, pos) {
				doFold(cm, pos, { rangeFinder: rangeFinder, widget: widget });
			};
		};

		// New-style interface
		CodeMirror.defineExtension('foldCode', function (pos, options, force) {
			doFold(this, pos, options, force);
		});

		CodeMirror.defineExtension('isFolded', function (pos) {
			const marks = this.findMarksAt(pos);
			for (let i = 0; i < marks.length; ++i)
				if(marks[i].__isFold) return true;
		});

		CodeMirror.commands.toggleFold = function (cm) {
			cm.foldCode(cm.getCursor());
		};
		CodeMirror.commands.fold = function (cm) {
			cm.foldCode(cm.getCursor(), null, 'fold');
		};
		CodeMirror.commands.unfold = function (cm) {
			cm.foldCode(cm.getCursor(), { scanUp: false }, 'unfold');
		};
		CodeMirror.commands.foldAll = function (cm) {
			cm.operation(function () {
				for (let i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
					cm.foldCode(CodeMirror.Pos(i, 0), { scanUp: false }, 'fold');
			});
		};
		CodeMirror.commands.unfoldAll = function (cm) {
			cm.operation(function () {
				for (let i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
					cm.foldCode(CodeMirror.Pos(i, 0), { scanUp: false }, 'unfold');
			});
		};

		CodeMirror.registerHelper('fold', 'combine', function () {
			const funcs = Array.prototype.slice.call(arguments, 0);
			return function (cm, start) {
				for (let i = 0; i < funcs.length; ++i) {
					const found = funcs[i](cm, start);
					if(found) return found;
				}
			};
		});

		CodeMirror.registerHelper('fold', 'auto', function (cm, start) {
			const helpers = cm.getHelpers(start, 'fold');
			for (let i = 0; i < helpers.length; i++) {
				const cur = helpers[i](cm, start);
				if(cur) return cur;
			}
		});

		const defaultOptions = {
			rangeFinder  : CodeMirror.fold.auto,
			widget       : '\u2194',
			minFoldSize  : 0,
			scanUp       : false,
			clearOnEnter : true
		};

		CodeMirror.defineOption('foldOptions', null);

		const getOption = function(cm, options, name) {
			if(options && options[name] !== undefined)
				return options[name];
			const editorOptions = cm.options.foldOptions;
			if(editorOptions && editorOptions[name] !== undefined)
				return editorOptions[name];
			return defaultOptions[name];
		};

		CodeMirror.defineExtension('foldOption', function (options, name) {
			return getOption(this, options, name);
		});

		// foldgutter.js
		const State = function(options) {
			this.options = options;
			this.from = this.to = 0;
		};

		const parseOptions = function(opts) {
			if(opts === true) opts = {};
			if(opts.gutter == null) opts.gutter = 'CodeMirror-foldgutter';
			if(opts.indicatorOpen == null) opts.indicatorOpen = 'CodeMirror-foldgutter-open';
			if(opts.indicatorFolded == null) opts.indicatorFolded = 'CodeMirror-foldgutter-folded';
			return opts;
		};

		CodeMirror.defineOption('foldGutter', false, function (cm, val, old) {
			if(old && old != CodeMirror.Init) {
				cm.clearGutter(cm.state.foldGutter.options.gutter);
				cm.state.foldGutter = null;
				cm.off('gutterClick', onGutterClick);
				cm.off('changes', onChange);
				cm.off('viewportChange', onViewportChange);
				cm.off('fold', onFold);
				cm.off('unfold', onFold);
				cm.off('swapDoc', onChange);
			}
			if(val) {
				cm.state.foldGutter = new State(parseOptions(val));
				updateInViewport(cm);
				cm.on('gutterClick', onGutterClick);
				cm.on('changes', onChange);
				cm.on('viewportChange', onViewportChange);
				cm.on('fold', onFold);
				cm.on('unfold', onFold);
				cm.on('swapDoc', onChange);
			}
		});

		const Pos = CodeMirror.Pos;

		const isFolded = function(cm, line) {
			const marks = cm.findMarks(Pos(line, 0), Pos(line + 1, 0));
			for (let i = 0; i < marks.length; ++i) {
				if(marks[i].__isFold) {
					const fromPos = marks[i].find(-1);
					if(fromPos && fromPos.line === line)
						return marks[i];
				}
			}
		};

		const marker = function(spec) {
			if(typeof spec == 'string') {
				const elt = document.createElement('div');
				elt.className = `${spec} CodeMirror-guttermarker-subtle`;
				return elt;
			} else {
				return spec.cloneNode(true);
			}
		};

		const updateFoldInfo = function(cm, from, to) {
			const opts = cm.state.foldGutter.options;
			let cur = from - 1;
			const minSize = cm.foldOption(opts, 'minFoldSize');
			const func = cm.foldOption(opts, 'rangeFinder');
			// we can reuse the built-in indicator element if its className matches the new state
			const clsFolded = typeof opts.indicatorFolded == 'string' && classTest(opts.indicatorFolded);
			const clsOpen = typeof opts.indicatorOpen == 'string' && classTest(opts.indicatorOpen);
			cm.eachLine(from, to, function (line) {
				++cur;
				let mark = null;
				let old = line.gutterMarkers;
				if(old) old = old[opts.gutter];
				if(isFolded(cm, cur)) {
					if(clsFolded && old && clsFolded.test(old.className)) return;
					mark = marker(opts.indicatorFolded);
				} else {
					const pos = Pos(cur, 0);
					const range = func && func(cm, pos);
					if(range && range.to.line - range.from.line >= minSize) {
						if(clsOpen && old && clsOpen.test(old.className)) return;
						mark = marker(opts.indicatorOpen);
					}
				}
				if(!mark && !old) return;
				cm.setGutterMarker(line, opts.gutter, mark);
			});
		};

		// copied from CodeMirror/src/util/dom.js
		const classTest = function(cls) {
			return new RegExp(`(^|\\s)${cls}(?:$|\\s)\\s*`);
		};

		const updateInViewport = function(cm) {
			const vp = cm.getViewport(), state = cm.state.foldGutter;
			if(!state) return;
			cm.operation(function () {
				updateFoldInfo(cm, vp.from, vp.to);
			});
			state.from = vp.from;
			state.to = vp.to;
		};

		const onGutterClick = function(cm, line, gutter) {
			const state = cm.state.foldGutter;
			if(!state) return;
			const opts = state.options;
			if(gutter != opts.gutter) return;
			const folded = isFolded(cm, line);
			if(folded) folded.clear();
			else cm.foldCode(Pos(line, 0), opts);
		};

		const onChange = function(cm) {
			const state = cm.state.foldGutter;
			if(!state) return;
			const opts = state.options;
			state.from = state.to = 0;
			clearTimeout(state.changeUpdate);
			state.changeUpdate = setTimeout(function () {
				updateInViewport(cm);
			}, opts.foldOnChangeTimeSpan || 600);
		};

		const onViewportChange = function(cm) {
			const state = cm.state.foldGutter;
			if(!state) return;
			const opts = state.options;
			clearTimeout(state.changeUpdate);
			state.changeUpdate = setTimeout(function () {
				const vp = cm.getViewport();
				if(state.from == state.to || vp.from - state.to > 20 || state.from - vp.to > 20) {
					updateInViewport(cm);
				} else {
					cm.operation(function () {
						if(vp.from < state.from) {
							updateFoldInfo(cm, vp.from, state.from);
							state.from = vp.from;
						}
						if(vp.to > state.to) {
							updateFoldInfo(cm, state.to, vp.to);
							state.to = vp.to;
						}
					});
				}
			}, opts.updateViewportTimeSpan || 400);
		};

		const onFold = function(cm, from) {
			const state = cm.state.foldGutter;
			if(!state) return;
			const line = from.line;
			if(line >= state.from && line < state.to)
				updateFoldInfo(cm, line, line + 1);
		};
	},
	registerHomebreweryHelper : function(CodeMirror) {
		CodeMirror.registerHelper('fold', 'homebrewery', function(cm, start) {
			const matcher = /^\\page.*/;
			const firstLine = cm.getLine(start.line);
			const prevLine = cm.getLine(start.line - 1);

			if(start.line === cm.firstLine() || prevLine.match(matcher)) {
				const lastLineNo = cm.lastLine();
				let end = start.line, nextLine = cm.getLine(start.line + 1);

				while (end < lastLineNo) {
					if(nextLine.match(matcher)) {
						return {
							from : CodeMirror.Pos(start.line, firstLine.length),
							to   : CodeMirror.Pos(end, cm.getLine(end).length)
						};
					}
					++end;
					nextLine = cm.getLine(end + 1);
				}

				return null;
			}

			return null;
		});
	}
};