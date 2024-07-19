module.exports = {
	registerHomebreweryHelper : function(CodeMirror) {
		CodeMirror.registerHelper('fold', 'homebrewerycss', function(cm, start) {
			const startMatcher = /\{[ \t]*$/;
			const endMatcher = /\}[ \t]*$/;
			const prevLine = cm.getLine(start.line);

			if((start.line === cm.firstLine()) && (!cm.getLine(start.line).match(startMatcher))) return null;

			if(start.line === cm.firstLine() || prevLine.match(startMatcher)) {
				const lastLineNo = cm.lastLine();
				let end = start.line + 1;
				let braceCount = 1;

				while (end < lastLineNo) {
					const curLine = cm.getLine(end);
					if(curLine.match(startMatcher)) braceCount++;
					if(curLine.match(endMatcher)) braceCount--;
					if(braceCount == 0) break;
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
