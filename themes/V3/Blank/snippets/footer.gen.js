module.exports = {
	createFooterFunc : function(headerSize=1){
		return (props)=>{
			const cursorPos = props.cursorPos;
			const renderer = props.brew.renderer || 'V3';

			const Markdown = renderer == 'V3' ? require('../../../../shared/naturalcrit/markdown.js') : require('../../../../shared/naturalcrit/markdownLegacy.js');

			const markdownText = props.brew.text.split('\n').slice(0, cursorPos.line).join('\n');
			const markdownTokens = Markdown.marked.lexer(markdownText);
			const headerToken = markdownTokens.findLast((lexerToken)=>{ return lexerToken.type === 'heading' && lexerToken.depth === headerSize; });
			const headerText = headerToken?.tokens.map((token)=>{ return token.text; }).join('');
			const outputText = headerText || 'PART 1 | SECTION NAME';

			return `\n{{footnote ${outputText}}}\n`;
		};
	}
};