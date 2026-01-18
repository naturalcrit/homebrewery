const autoCloseCurlyBraces = function(CodeMirror, cm, typingClosingBrace) {
	const ranges = cm.listSelections(), replacements = [];
	for (let i = 0; i < ranges.length; i++) {
		if(!ranges[i].empty()) return CodeMirror.Pass;
		const pos = ranges[i].head, line = cm.getLine(pos.line), tok = cm.getTokenAt(pos);
		if(!typingClosingBrace && (tok.type == 'string' || tok.string.charAt(0) != '{' || tok.start != pos.ch - 1))
			return CodeMirror.Pass;
		else if(typingClosingBrace) {
			let hasUnclosedBraces = false, index = -1;
			do {
				index = line.indexOf('{{', index + 1);
				if(index !== -1 && line.indexOf('}}', index + 1) === -1) {
					hasUnclosedBraces = true;
					break;
				}
			} while (index !== -1);
			if(!hasUnclosedBraces) return CodeMirror.Pass;
		}

		replacements[i] = typingClosingBrace ? {
			text   : '}}',
			newPos : CodeMirror.Pos(pos.line, pos.ch + 2)
		} : {
			text   : '{}}',
			newPos : CodeMirror.Pos(pos.line, pos.ch + 1)
		};
	}

	for (let i = ranges.length - 1; i >= 0; i--) {
		const info = replacements[i];
		cm.replaceRange(info.text, ranges[i].head, ranges[i].anchor, '+insert');
		const sel = cm.listSelections().slice(0);
		sel[i] = {
			head   : info.newPos,
			anchor : info.newPos
		};
		cm.setSelections(sel);
	}
};

module.exports = {
	autoCloseCurlyBraces : function(CodeMirror, codeMirror) {
		const map = { name: 'autoCloseCurlyBraces' };
		map[`'{'`] = function(cm) { return autoCloseCurlyBraces(CodeMirror, cm); };
		map[`'}'`] = function(cm) { return autoCloseCurlyBraces(CodeMirror, cm, true); };
		codeMirror.addKeyMap(map);
	}
};