// Container to add some extra functionality to the markdown.js renderer, required by the standalone renderer.
// Some of this functionality should probably be moved to markdown.js to avoid duplicate code.

const markdown = require('../../../shared/naturalcrit/markdown.js');

// Start page count from page 2
const PAGE_START = 2;

module.exports = {
    markdown: markdown,
    // Split the \page tag into separate divs and run the segments through the homebrewery markdown parser
    render: (rawBrewText)=>{
        let result = '';
        rawBrewText.split('\\page').forEach((instance, index)=>{
            result += `<div class="page" id="p${index + PAGE_START}">${markdown.render(instance)}</div>\n`;
        });
        result = `<div class="pages">\n${result}</div>`;
        return result;
    },
    validate : (rawBrewText)=>{
        return markdown.validate(rawBrewText);
    }
}