import stylelint from 'stylelint';
const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = 'naturalcrit/declaration-colon-align';
const messages = ruleMessages(ruleName, {
	expected : (rule)=>`Expected colons aligned within rule "${rule}"`,
});

const ruleFunction = (primaryOption, secondaryOptionObject, context)=>{
	return (postcssRoot, postcssResult)=>{

		const validOptions = validateOptions(
			postcssResult,
			ruleName,
			{
				actual   : primaryOption,
				possible : [true, false]
			}
		);

		if(!validOptions) // If the options are invalid, don't lint
			return;

		const isAutoFixing = Boolean(context.fix);

		postcssRoot.walkRules((rule)=>{ // Iterate CSS rules

			let maxColonPos = 0;
			let misaligned = false;
			rule.each((declaration)=>{

				if(declaration.type != 'decl')
					return;

				const colonPos = declaration.prop.length + declaration.raws.between.indexOf(':');

				if(maxColonPos > 0 && colonPos != maxColonPos)
					misaligned = true;

				maxColonPos = Math.max(maxColonPos, colonPos);
			});

			if(!misaligned)
				return;

			if(isAutoFixing) { // We are in “fix” mode
				rule.each((declaration)=>{
					if(declaration.type != 'decl')
						return;

					declaration.raws.between = `${' '.repeat(maxColonPos - declaration.prop.length)}:${declaration.raws.between.split(':')[1]}`;
				});
			} else { // We are in “report only” mode
				report({
					ruleName,
					result  : postcssResult,
					message : messages.expected(rule.selector), // Build the reported message
					node    : rule, // Specify the reported node
					word    : rule.selector, // Which exact word caused the error? This positions the error properly
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);