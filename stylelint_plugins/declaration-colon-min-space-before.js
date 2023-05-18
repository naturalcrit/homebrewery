const stylelint = require('stylelint');
const { isNumber } = require('stylelint/lib/utils/validateTypes');

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = 'naturalcrit/declaration-colon-min-space-before';
const messages = ruleMessages(ruleName, {
   expected: (num) => `Expected at least ${num} space${num == 1 ? '' : 's'} before ":"`
});


module.exports = stylelint.createPlugin(ruleName, function getPlugin(primaryOption, secondaryOptionObject, context) {
   return function lint(postcssRoot, postcssResult) {

       const validOptions = validateOptions(
            postcssResult,
            ruleName,
            {
                actual: primaryOption,
                possible: [isNumber],
            }
       );

       if (!validOptions) { //If the options are invalid, don't lint
           return;
       }
       const isAutoFixing = Boolean(context.fix);

       postcssRoot.walkDecls(decl => { //Iterate CSS declarations

            let between = decl.raws.between;
            const colonIndex = between.indexOf(":");

            if (between.slice(0, colonIndex).length >= primaryOption) {
              return;
            }
            if (isAutoFixing) { //We are in “fix” mode
              decl.raws.between = between.slice(0, colonIndex).replace(/\s*$/, ' '.repeat(primaryOption)) + between.slice(colonIndex)
            } else {
              report({
                  ruleName,
                  result: postcssResult,
                  message: messages.expected(primaryOption), // Build the reported message
                  node: decl, // Specify the reported node
                  word: ":", // Which exact word caused the error? This positions the error properly
              });
            }
       });
   };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
