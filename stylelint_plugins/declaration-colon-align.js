const stylelint = require('stylelint');

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = 'naturalcrit/declaration-colon-align';
const messages = ruleMessages(ruleName, {
	expected : (rule)=>`Expected colons aligned within rule "${rule}"`,
});


module.exports = stylelint.createPlugin(ruleName, function getPlugin(primaryOption, secondaryOptionObject, context) {
	return function lint(postcssRoot, postcssResult) {

		const validOptions = validateOptions(
			postcssResult,
			ruleName,
			{
				actual   : primaryOption,
				possible : [
					true,
					false
				]
			}
		);

		if(!validOptions) { //If the options are invalid, don't lint
			return;
		}
		const isAutoFixing = Boolean(context.fix);
		postcssRoot.walkRules((rule)=>{ //Iterate CSS rules

			let maxColonPos = 0;
			let misaligned = false;
			rule.each((declaration)=>{

				if(declaration.type != 'decl')
					return;

				const colonPos = declaration.prop.length + declaration.raws.between.indexOf(':');
				if(maxColonPos > 0 && colonPos != maxColonPos) {
					misaligned = true;
				}
				maxColonPos = Math.max(maxColonPos, colonPos);
			});

			if(misaligned) {
				if(isAutoFixing) { //We are in “fix” mode
					rule.each((declaration)=>{
						if(declaration.type != 'decl')
							return;

						declaration.raws.between = `${' '.repeat(maxColonPos - declaration.prop.length)}:${declaration.raws.between.split(':')[1]}`;
					});
				} else { //We are in “report only” mode
					report({
						ruleName,
						result  : postcssResult,
						message : messages.expected(rule.selector), // Build the reported message
						node    : rule, // Specify the reported node
						word    : rule.selector, // Which exact word caused the error? This positions the error properly
					});
				}
			}
		});
	};
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
