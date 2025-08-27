import stylelint  from 'stylelint';
import { isNumber } from 'stylelint/lib/utils/validateTypes.mjs';

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = 'naturalcrit/declaration-colon-min-space-before';
const messages = ruleMessages(ruleName, {
	expected : (num)=>`Expected at least ${num} space${num == 1 ? '' : 's'} before ":"`
});

const ruleFunction = (primaryOption, secondaryOptionObject, context)=>{
	return (postcssRoot, postcssResult)=>{

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

		postcssRoot.walkDecls((decl)=>{ //Iterate CSS declarations

			const between = decl.raws.between;
			const colonIndex = between.indexOf(':');

			if(between.slice(0, colonIndex).length >= primaryOption)
				return;

			if(isAutoFixing) { //We are in “fix” mode
				decl.raws.between = between.slice(0, colonIndex).replace(/\s*$/, ' '.repeat(primaryOption)) + between.slice(colonIndex);
			} else {
				report({
					ruleName,
					result  : postcssResult,
					message : messages.expected(primaryOption), // Build the reported message
					node    : decl, // Specify the reported node
					word    : ':', // Which exact word caused the error? This positions the error properly
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);