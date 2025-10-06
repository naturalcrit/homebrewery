import Markdown from '../../../../shared/naturalcrit/markdown.js';

module.exports = {
	createFooterFunc : function(headerSize=1){
		return (props)=>{
			const cursorPos = props.cursorPos;

			const markdownText = props.brew.text.split('\n').slice(0, cursorPos.line).join('\n');
			const markdownTokens = Markdown.marked.lexer(markdownText);
			const headerToken = markdownTokens.findLast((lexerToken)=>{ return lexerToken.type === 'heading' && lexerToken.depth === headerSize; });
			const headerText = headerToken?.tokens.map((token)=>{ return token.text; }).join('');
			const outputText = headerText || 'PART 1 | SECTION NAME';

			return `\n{{footnote ${outputText}}}\n`;
		};
	}
};