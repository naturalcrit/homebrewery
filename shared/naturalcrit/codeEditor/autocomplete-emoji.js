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
				}).sort((a, b) => {																// Sort autocomplete options alphabetically, case-insensitive
					let lowerA = a.toLowerCase();
					let lowerB = b.toLowerCase();

					lowerA = lowerA.replace(/\d+/g, function(match) {	// Temporarily convert any numbers in emoji string
						return match.padStart(4, '0');									// to 4-digits, left-padded with 0's. To aid in
					});																								// sorting numbers, i.e., "d6, d10, d20", not "d10, d20, d6"
					lowerB = lowerB.replace(/\d+/g, function(match) {	
						return match.padStart(4, '0');
					});
				
					if (lowerA < lowerB)
						return -1;

					return 1;
				}).map(function(emoji) {
					return {
						text: emoji + ":",														// Text to output to editor when option is selected
						render: function(element, self, data) {				// How to display the option in the dropdown
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
		if (/:[^\s:]+$/.test(textToCursor)) {
			CodeMirror.commands.autocomplete(editor);
		}
	});
}

module.exports = {
  showEmojiAutocomplete
};