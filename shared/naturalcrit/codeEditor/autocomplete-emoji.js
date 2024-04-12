const dicefont = require('../../../themes/fonts/icon fonts/dicefont.js');

const emojis = {
	...dicefont,
	"fas-heart": "fa-solid fa-heart",
	"fas-star": "fa-solid fa-star"
};

const showEmojiAutocomplete = function(CodeMirror, editor) {
	CodeMirror.commands.autocomplete = function(editor) {
		editor.showHint({
			completeSingle: false,
			hint: function(editor) {
				const cursor = editor.getCursor();
				const line = cursor.line;
				const lineContent = editor.getLine(line);
				const start = lineContent.lastIndexOf(':', cursor.ch - 1) + 1;
				const end = cursor.ch;
				const currentWord = lineContent.slice(start, end);
				
	
				const list = Object.keys(emojis).filter(function(emoji) {
					return emoji.indexOf(currentWord) >= 0;
				}).map(function(emoji) {
					return {
						text: emoji + ":",
						//displayText: `${emoji} - <i class="${emojis[emoji]}"></i>`,
						render: function(element, self, data) {
							const div = document.createElement('div');
							div.innerHTML = `<i class="${emojis[emoji]}"></i> ${emoji}`;
							element.appendChild(div);
						}
					};
				});
	
				return {
					list: list.length ? list : [],
					from: CodeMirror.Pos(line, start),
					to: CodeMirror.Pos(line, end)
				};
			}
		});
	};
	
	editor.on('inputRead', function(instance, change) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
	
		// Get the text from the start of the line to the cursor
		const textToCursor = line.slice(0, cursor.ch);
	
		// Check if the text ends with ':xyz'
		if (/:\S+$/.test(textToCursor)) {
			CodeMirror.commands.autocomplete(editor);
		}
	});
}

module.exports = {
  showEmojiAutocomplete
};