module.exports = {
	registerHomebreweryHelper : function(CodeMirror) {
		CodeMirror.registerHelper('fold', 'homebrewery', function(cm, start) {
			const matcher = /^\\page.*/;
			const prevLine = cm.getLine(start.line - 1);

			if(start.line === cm.firstLine() || prevLine.match(matcher)) {
				const lastLineNo = cm.lastLine();
				let end = start.line;

				while (end < lastLineNo) {
					if(cm.getLine(end + 1).match(matcher))
						break;
					++end;
				}

				return {
					from : CodeMirror.Pos(start.line, 0),
					to   : CodeMirror.Pos(end, cm.getLine(end).length)
				};
			}

			return null;
		});
	}
};
