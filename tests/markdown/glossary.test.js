/* eslint-disable max-lines */

import Markdown from 'naturalcrit/markdown.js';

test('Make sure Gloassary entries are consumed.', function() {
	const source = '#GlossaryList: Glossary Term // Glossary  Definition\n';
	const rendered = Markdown.render(source);
	expect(rendered).toBe('');
});
