const stylelint = require('stylelint');
const { isNumber } = require('stylelint/lib/utils/validateTypes.cjs');

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = 'naturalcrit/declaration-block-multi-line-min-declarations';
const messages = ruleMessages(ruleName, {
	expected : (decls)=>`Rule with ${decls} declaration${decls == 1 ? '' : 's'} should be single line`,
});


module.exports = stylelint.createPlugin(ruleName, function getPlugin(primaryOption, secondaryOptionObject, context) {
	return function lint(postcssRoot, postcssResult) {

		const validOptions = validateOptions(
			postcssResult,
			ruleName,
			{
				actual   : primaryOption,
				possible : [isNumber],
			}
		);

		if(!validOptions) { //If the options are invalid, don't lint
			return;
		}
		const isAutoFixing = Boolean(context.fix);

		postcssRoot.walkRules((rule)=>{ //Iterate CSS rules

			//Apply rule only if all children are decls (no further nested rules)
			if(rule.nodes.length > primaryOption || !rule.nodes.every((node)=>node.type === 'decl')) {
				return;
			}

			//Ignore if already one line
			if(!rule.nodes.some((node)=>node.raws.before.includes('\n')) && !rule.raws.after.includes('\n'))
				return;

			if(isAutoFixing) { //We are in “fix” mode
				rule.each((decl)=>{
					decl.raws.before = ' ';
				});
				rule.raws.after = ' ';
			} else {
				report({
					ruleName,
					result  : postcssResult,
					message : messages.expected(rule.nodes.length), // Build the reported message
					node    : rule, // Specify the reported node
					word    : rule.selector, // Which exact word caused the error? This positions the error properly
				});
			}
		});
	};
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
