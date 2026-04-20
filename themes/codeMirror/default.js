import { EditorView } from '@codemirror/view';

//This theme is made of the base css for the codemirror 5 editor

export default EditorView.theme({
	'&' : {
		backgroundColor : 'white',
		color           : 'black',
	},
	'.cm-content' : {
		padding    : '4px 0',
		fontFamily : 'monospace',
		fontSize   : '13px',
		lineHeight : '1',
	},
	'.cm-line' : {
		padding : '0 4px',
	},
	'.cm-gutters' : {
		borderRight     : '1px solid #ddd',
		backgroundColor : '#f7f7f7',
		whiteSpace      : 'nowrap',
	},
	'.cm-linenumber' : {
		padding    : '0 3px 0 5px',
		minWidth   : '20px',
		textAlign  : 'right',
		color      : '#999',
		whiteSpace : 'nowrap',
	},
	'.cm-cursor' : {
		borderLeft : '1px solid black',
	},
	'.cm-fat-cursor' : {
		width           : 'auto',
		backgroundColor : '#7e7',
		caretColor      : 'transparent',
	},
	'.cm-activeLine' : {
		backgroundColor : '#becee374',
	},
	'.cm-gutterElement.cm-activeLineGutter' : {
		backgroundColor : '#becee374',
	},
	'.cm-selected' : {
		backgroundColor : '#d7d4f0',
	},
	'.cm-foldmarker' : {
		color      : 'blue',
		fontFamily : 'arial',
		lineHeight : '0.3',
		cursor     : 'pointer',
	},

	'.cm-header'                         : { color: 'blue', fontWeight: 'bold' },
	'.cm-strong'                         : { fontWeight: 'bold' },
	'.cm-em'                             : { fontStyle: 'italic' },
	'.cm-keyword'                        : { color: '#708' },
	'.cm-atom, cm-value, cm-color'       : { color: '#219' },
	'.cm-number'                         : { color: '#164' },
	'.cm-def'                            : { color: '#00f' },
	'.cm-list'                           : { color: '#05a' },
	'.cm-variable, .cm-type'             : { color: '#085' },
	'.cm-comment'                        : { color: '#a50' },
	'.cm-link'                           : { color: '#00c', textDecoration: 'underline' },
	'.cm-string'                         : { color: '#a11', textDecoration: 'none'  },
	'.cm-string-2'                       : { color: '#f50', textDecoration: 'none'  },
	'.cm-meta, .cm-qualifier, .cm-class' : { color: '#555' },
	'.cm-builtin'                        : { color: '#30a' },
	'.cm-bracket'                        : { color: '#997' },
	'.cm-tag'                            : { color: '#170' },
	'.cm-attribute'                      : { color: '#00c' },
	'.cm-hr'                             : { color: '#999' },
	'.cm-negative'                       : { color: '#d44' },
	'.cm-positive'                       : { color: '#292' },
	'.cm-error, .cm-invalidchar'         : { color: '#f00' },
	'.cm-matchingbracket'                : { color: '#0b0' },
	'.cm-nonmatchingbracket'             : { color: '#a22' },
	'.cm-matchingtag'                    : { backgroundColor: '#ff96004d' },
	'.cm-quote'                          : { color: '#090' },
}, { dark: false });