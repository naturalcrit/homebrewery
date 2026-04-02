import { EditorView } from '@codemirror/view';


export default EditorView.theme({
	'&' : {
		backgroundColor : '#293134',
		color           : '#91a6aa',
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
		borderRight     : '1px solid #555',
		backgroundColor : '#293134',
		whiteSpace      : 'nowrap',
	},
	'.cm-foldGutter' : {
		borderLeft      : '1px solid #555',
		backgroundColor : '#293134',
	},
	'.cm-foldGutter:hover' : {
		backgroundColor : '#555',
	},
	'.cm-gutterElement' : {
		color : '#81969a',
	},
	'.cm-linenumber' : {
		padding    : '0 3px 0 5px',
		minWidth   : '20px',
		textAlign  : 'right',
		color      : '#999',
		whiteSpace : 'nowrap',
	},
	'.cm-cursor' : {
		borderLeft : '1px solid #E0E2E4',
	},
	'.cm-fat-cursor' : {
		width           : 'auto',
		backgroundColor : '#7e7',
		caretColor      : 'transparent',
	},
	'.cm-activeLine' : {
		backgroundColor : '#868c9323',
	},
	'.cm-gutterElement.cm-activeLineGutter' : {
		backgroundColor : '#868c9323',
	},
	'.cm-activeLine' : {
		backgroundColor : '#868c9323',
	},
	'.cm-selected' : {
		backgroundColor : '#d7d4f0',
	},
	'.cm-pageLine' : {
		backgroundColor : '#7ca97c',
		color           : '#000',
		fontWeight      : 'bold',
		letterSpacing   : '.5px',
		borderTop       : '1px solid #ff0',
	},
	'.cm-columnSplit' : {
		backgroundColor : '#7ca97c',
		color           : 'black',
		fontWeight      : 'bold',
		letterSpacing   : '1px',
		borderBottom    : '1px solid #ff0',
	},
	'.cm-line.cm-block, .cm-line .cm-inline-block' : {
		color : '#E3E3E3',
	},
	'.cm-definitionList .cm-definitionTerm' : {
		color : '#E3E3E3',
	},
	'.cm-definitionList .cm-definitionColon' : {
		backgroundColor : '#0000',
		color           : '#e3FF00',
	},
	'.cm-definitionList .cm-definitionDesc' : {
		color : '#b5858d',
	},

	// Semantic classes
	'.cm-header'                         : { color: '#C51B1B', fontWeight: 'bold' },
	'.cm-strong'                         : { color: '#309dd2', fontWeight: 'bold' },
	'.cm-em'                             : { fontStyle: 'italic' },
	'.cm-keyword'                        : { color: '#fff' },
	'.cm-atom, cm-value, cm-color'       : { color: '#c1939a' },
	'.cm-number'                         : { color: '#2986cc' },
	'.cm-def'                            : { color: '#2986cc' },
	'.cm-list'                           : { color: '#3cbf30' },
	'.cm-variable, .cm-type'             : { color: '#085' },
	'.cm-comment'                        : { color: '#bbc700' },
	'.cm-link'                           : { color: '#DD6300', textDecoration: 'underline' },
	'.cm-string'                         : { color: '#AA8261', textDecoration: 'none'  },
	'.cm-string-2'                       : { color: '#f50', textDecoration: 'none'  },
	'.cm-meta, .cm-qualifier, .cm-class' : { color: '#19ee2b' },
	'.cm-builtin'                        : { color: '#fff' },
	'.cm-bracket'                        : { color: '#997' },
	'.cm-tag, .cm-attribute'             : { color: '#e3ff00' },
	'.cm-hr'                             : { color: '#999' },
	'.cm-negative'                       : { color: '#d44' },
	'.cm-positive'                       : { color: '#292' },
	'.cm-error, .cm-invalidchar'         : { color: '#c50202' },
	'.cm-matchingbracket'                : { color: '#0b0' },
	'.cm-nonmatchingbracket'             : { color: '#a22' },
	'.cm-matchingtag'                    : { backgroundColor: 'rgba(255, 150, 0, 0.3)' },
	'.cm-quote'                          : { color: '#090' },
}, { dark: true });