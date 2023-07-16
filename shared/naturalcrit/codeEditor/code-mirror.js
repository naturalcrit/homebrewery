let CodeMirror;
if(typeof navigator !== 'undefined'){
	CodeMirror = require('codemirror');

	//Language Modes
	require('codemirror/mode/gfm/gfm.js'); //Github flavoured markdown
	require('codemirror/mode/css/css.js');
	require('codemirror/mode/javascript/javascript.js');

	//Addons
	//Code folding
	require('codemirror/addon/fold/foldcode.js');
	require('codemirror/addon/fold/foldgutter.js');
	//Search and replace
	require('codemirror/addon/search/search.js');
	require('codemirror/addon/search/searchcursor.js');
	require('codemirror/addon/search/jump-to-line.js');
	require('codemirror/addon/search/match-highlighter.js');
	require('codemirror/addon/search/matchesonscrollbar.js');
	require('codemirror/addon/dialog/dialog.js');
	//Trailing space highlighting
	// require('codemirror/addon/edit/trailingspace.js');
	//Active line highlighting
	// require('codemirror/addon/selection/active-line.js');
	//Scroll past last line
	require('codemirror/addon/scroll/scrollpastend.js');
	//Auto-closing
	//XML code folding is a requirement of the auto-closing tag feature and is not enabled
	require('codemirror/addon/fold/xml-fold.js');
	require('codemirror/addon/edit/closetag.js');

	const foldCode = require('./helpers/fold-code');
	foldCode.registerHomebreweryHelper(CodeMirror);
}

module.exports = CodeMirror;