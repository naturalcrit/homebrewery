

require('jsdom-global')();

import { safeHTML } from '../../client/homebrew/brewRenderer/safeHTML';

test('Exit if no document', function() {
	const doc = document;
	document = undefined;

	const result = safeHTML('');

	document = doc;

	expect(result).toBe(null);
});

test('Javascript via href', function() {
	const source = `<a href="javascript:alert('This is a JavaScript injection via href attribute')">Click me</a>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<a>Click me</a>');
});

test('Javascript via src', function() {
	const source = `<img src="javascript:alert('This is a JavaScript injection via src attribute')">`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<img>');
});

test('Javascript via form submit action', function() {
	const source = `<form action="javascript:alert('This is a JavaScript injection via action attribute')">\n<input type="submit" value="Submit">\n</form>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<form>\n<input value=\"Submit\">\n</form>');
});

test('Javascript via inline event handler - onClick', function() {
	const source = `<div style="background-color: red; color: white; width: 100px; height: 100px;" onclick="alert('This is a JavaScript injection via inline event handler')">\nClick me\n</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div style=\"background-color: red; color: white; width: 100px; height: 100px;\">\nClick me\n</div>');
});

test('Javascript via inline event handler - onMouseOver', function() {
	const source = `<div onmouseover="alert('This is a JavaScript injection via inline event handler')">Hover over me</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Hover over me</div>');
});

test('Javascript via data attribute', function() {
	const source = `<div data-code="javascript:alert('This is a JavaScript injection via data attribute')">Test</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Test</div>');
});

test('Javascript via event delegation', function() {
	const source = `<div id="parent"><button id="child">Click me</button></div><script>document.getElementById('parent').addEventListener('click', function(event) {if (event.target.id === 'child') {console.log('This is JavaScript executed via event delegation');}});</script>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div id="parent"><button id="child">Click me</button></div>');
});



