module.exports = {
	registerHomebreweryHelper : function(CodeMirror) {
		CodeMirror.registerHelper('fold', 'homebrewerycss', function(cm, start) {

			// BRACE FOLDING
			const startMatcher = /\{[ \t]*$/;
			const endMatcher = /\}[ \t]*$/;
			const activeLine = cm.getLine(start.line);


			if(activeLine.match(startMatcher)) {
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

			// @import and data-url folding
			const importMatcher  = /^@import.*?;/;
			const dataURLMatcher = /url\(.*?data\:.*\)/;

			if(activeLine.match(importMatcher) || activeLine.match(dataURLMatcher)) {
				return {
					from : CodeMirror.Pos(start.line, 0),
					to   : CodeMirror.Pos(start.line, activeLine.length)
				};
			}

			return null;
		});
	}
};
