const test = require('pico-check');

const check = function(name, code, expected) {
	test(name, (t)=>{
		const errors = require('../shared/naturalcrit/markdown.js').validate(code);
		t.is(errors.length, expected, `'${code}' should have ${expected} errors; found '${errors}'`);
	});
};

// Strings that should validate correctly.
check('Empty string', '', 0);
check('No tags', 'Some text', 0);
check('Embedded closed tag', 'See <a href="foo">here</a> for more.', 0);
check('<aside> tag works', 'Odd <aside>as in, suffix of a <a>link tag</a></aside> tag', 0);
check('Multiple tags', 'Multiple <a>shiny</a> <span>tags</span>', 0);
check('Nested tags', 'Nested <div>shiny <span>tags</span></div>', 0);
check('Void tags', 'No <a>need to close tags like <img></a> or <area>.', 0);

// This should arguably pass validation, but does not currently.
check('Immediately closing div', '<div/>', 1);
check('Tags in CSS comments', '<style>/* Style <a> tags later */</style>', 1);

// Strings that should give validation errors.
check('Partial tag', '<a', 1);
check('Partial tag with attribute', '<a href="foo"', 1);
check('Unclosed tag', '<a>', 1);
check('Dangling closing tag', '</div>', 1);
check('Embedded unclosed tag', 'Some <a>text', 1);
check('Mismatched closing tag', '<span></div>', 1);
check('Misordered closing tags', '<div>mis-<span>ordered</div></span>', 2);
check('Tag closed by prefix', '<aside>This is bad.</a>', 1);

module.exports = test;