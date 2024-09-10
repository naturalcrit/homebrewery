import react from "eslint-plugin-react";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [{
		ignores: ["build/"]
	},
	{
		files           : ['**/*.js', '**/*.jsx'],
		plugins         : { react, jest },
		languageOptions : {
				ecmaVersion   : "latest",
				sourceType    : "module",
				parserOptions : { ecmaFeatures: { jsx: true } },
				globals       : { ...globals.browser, ...globals.node }
		},
		rules: {
				/** Errors **/
				"camelcase"              : ["error", { properties: "never" }],
				"no-array-constructor"   : "error",
				"no-iterator"            : "error",
				"no-nested-ternary"      : "error",
				"no-new-object"          : "error",
				"no-proto"               : "error",
				"react/jsx-no-bind"      : ["error", { allowArrowFunctions: true }],
				"react/jsx-uses-react"   : "error",
				"react/prefer-es6-class" : ["error", "never"],
				"jest/valid-expect"      : ["error", { maxArgs: 3 }],

				/** Warnings **/
				"max-lines"            : ["warn", { max: 200, skipComments: true, skipBlankLines: true }],
				"max-depth"            : ["warn", { max: 4 }],
				"max-params"           : ["warn", { max: 5 }],
				"no-restricted-syntax" : ["warn", "ClassDeclaration", "SwitchStatement"],
				"no-unused-vars"       : ["warn", { vars: "all", args: "none", varsIgnorePattern: "config|_|cx|createClass" }],
				"react/jsx-uses-vars"  : "warn",

				/** Fixable **/
				"arrow-parens"    : ["warn", "always"],
				"brace-style"     : ["warn", "1tbs", { allowSingleLine: true }],
				"jsx-quotes"      : ["warn", "prefer-single"],
				"no-var"          : "warn",
				"prefer-const"    : "warn",
				"prefer-template" : "warn",
				"quotes"          : ["warn", "single", { allowTemplateLiterals: true }],
				"semi"            : ["warn", "always"],

				/** Whitespace **/
				"array-bracket-spacing"         : ["warn", "never"],
				"arrow-spacing"                 : ["warn", { before: false, after: false	}],
				"comma-spacing"                 : ["warn", { before: false, after: true }],
				"indent"                        : ["warn", "tab", { MemberExpression: "off" }],
				"linebreak-style"               : "off",
				"no-trailing-spaces"            : "warn",
				"no-whitespace-before-property" : "warn",
				"object-curly-spacing"          : ["warn", "always"],
				"react/jsx-indent-props"        : ["warn", "tab"],
				"space-in-parens"               : ["warn", "never"],
				"template-curly-spacing"        : ["warn", "never"],
				"keyword-spacing"               : ["warn", {
						before    : true,
						after     : true,
						overrides : { if: { before: false, after: false } }
				}],
				"key-spacing"                   : ["warn", {
						multiLine  : { beforeColon: true, afterColon: true, align: "colon" },
						singleLine : { beforeColon: false, afterColon: true }
				}]
		}
	}
];