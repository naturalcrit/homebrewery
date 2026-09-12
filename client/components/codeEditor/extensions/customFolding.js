import { foldService, codeFolding } from '@codemirror/language';

const foldOnPages = [
	foldService.of((state, lineStart)=>{ //tells where to fold
		const doc = state.doc;
		const matcher = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;

		const startLine = doc.lineAt(lineStart);
		const prevLineText = startLine.number > 1 ? doc.line(startLine.number - 1).text : '';

		if(!matcher.test(prevLineText)) return null;

		let endLine = startLine.number;
		while (endLine < doc.lines && !matcher.test(doc.line(endLine + 1).text)) {
			endLine++;
		}

		if(endLine === startLine.number) return null;

		return { from: startLine.from, to: doc.line(endLine).to };
	}),
	codeFolding({
		preparePlaceholder : (state, range)=>{
			const doc = state.doc;
			const start = doc.lineAt(range.from).number;
			const end = doc.lineAt(range.to).number;

			if(doc.line(start).text.trim()) return ` ↤ Lines ${start}-${end} ↦`;

			const preview = Array.from({ length: end - start }, (_, i)=>doc.line(start + 1 + i).text.trim()
			).find(Boolean) || `Lines ${start}-${end}`;

			return ` ↤ ${preview.replace('{', '').slice(0, 50).trim()}${preview.length > 50 ? '...' : ''} ↦`;
		},
		placeholderDOM(view, onclick, prepared) {
			const span = document.createElement('span');
			span.className = 'cm-fold-placeholder';
			span.textContent = prepared;
			span.onclick = onclick;
			span.style.color = '#989898';
			return span;
		},
	}),
];

export default foldOnPages;