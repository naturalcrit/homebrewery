import { autocompletion } from '@codemirror/autocomplete';

import diceFont      from '@themes/fonts/iconFonts/diceFont.js';
import elderberryInn from '@themes/fonts/iconFonts/elderberryInn.js';
import fontAwesome   from '@themes/fonts/iconFonts/fontAwesome.js';
import gameIcons     from '@themes/fonts/iconFonts/gameIcons.js';

const emojis = {
	...diceFont,
	...elderberryInn,
	...fontAwesome,
	...gameIcons
};

const emojiCompletionList = (context)=>{
	const word = context.matchBefore(/:[^\s:]+/);
	if(!word) return null;

	const line = context.state.doc.lineAt(context.pos);
	const textToCursor = line.text.slice(0, context.pos - line.from);

	if(textToCursor.includes('{')) {
		const curlyToCursor = textToCursor.slice(textToCursor.indexOf('{'));
		const curlySpanRegex = /{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1$/g;
		if(curlySpanRegex.test(curlyToCursor)) return null;
	}

	const currentWord = word.text.slice(1); // remove ':'

	const options = Object.keys(emojis)
    .filter((e)=>e.toLowerCase().includes(currentWord.toLowerCase()))
    .sort((a, b)=>{
    	const normalize = (str)=>str.replace(/\d+/g, (m)=>m.padStart(4, '0')).toLowerCase();
    	return normalize(a) < normalize(b) ? -1 : 1;
    })
    .map((e)=>({
    	label : e,
    	apply	: `${e}:`,
    	type  : 'text',
    	info  : ()=>{
    		const div = document.createElement('div');
    		div.innerHTML = `<i class="emojiPreview ${emojis[e]}"></i> ${e}`;
    		return div;
    	}
    }));
	//Label is the text in the list, comes with an icon that just
		//renders example text "abc", hid that with css because i didn't see other choice
	//Apply is the text that is set when the choice is selected
	//Info is the tooltip

	return {
		from   : word.from + 1,
		options,
		filter : false,
	};
};

export const autocompleteEmoji = autocompletion({
	override         : [emojiCompletionList],
	activateOnTyping : true,
	 addToOptions     : [
		{
			render(completion) {
				const e = completion.label;

				const icon = document.createElement('i');
				icon.className = `emojiPreview ${emojis[e]}`;

				const fragment = document.createDocumentFragment();
				fragment.appendChild(icon);

				return fragment;
			}
		}
	]
});