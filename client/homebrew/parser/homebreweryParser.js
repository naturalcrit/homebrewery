// Container to add some extra functionality to the markdown.js renderer, required by the standalone renderer.
// Some of this functionality should probably be moved to markdown.js to avoid duplicate code.

const markdown = require('../../../shared/naturalcrit/markdown.js');

// Goes through the resulting HTML code and splits every instance of \page into separate divs
function splitPages(raw) {
    const pageDiv = '<div class="page" id="pagenumber">';

    // This expression works for the cases where there is only the \page tag on a line
    const onlyPageOnLineRe = /^\\page$/gm;
    const onlyPageOnLineSubs = `\n</div>\n<div class="page" id="pagenumber">`;
    let result = raw.replace(onlyPageOnLineRe, onlyPageOnLineSubs);

    // This expression works for the cases where there is an end of an element, followed by a begining of
    // a new element that contains the \page tag. For example when the line looks like "</div><p>\page",
    // we want to substitute it for something like this "</div></div><div class="page" id="p3"><p>"
    const closedElementInFrontOfPageRe = /^([^\/]*[^>]*>)(<[^>]*>)\\page/gm;
    const closedElementInFrontOfPageSubs = `$1\n</div>\n${pageDiv}\n$2`;
    result = result.replace(closedElementInFrontOfPageRe, closedElementInFrontOfPageSubs);
    
    // This expression works for the cases where there is an element enclosing the \page tag. For example
    // where the line looks like "<p>\page</p>", we want to substitute it for something like 
    // "</div>\n<div class="page" id="pagenumber">"
    const elementEnclosesPageRe = /^(<[^>]*>)\\page(<\/[^>]*>)$/gm;
    const elementEnclosesPageSubs = `</div>\n${pageDiv}`;
    result = result.replace(elementEnclosesPageRe, elementEnclosesPageSubs);

    // This expression works for the cases where there is an element start, followed by 
    // the \page tag. For example when the line looks like "<p>\page", we want to substitute
    // it for something like this "</div>\n<div class="page" id="pagenumber">\n<p>"
    const elementFollowedByPageRe = /^(<[^>]*>)\\page$/gm;
    const elementFollowedByPageSubs = `</div>\n${pageDiv}\n$1`;
    result = result.replace(elementFollowedByPageRe, elementFollowedByPageSubs);

    // This expression works for the cases where the \page tag is at the begining of the line, followed
    // by an end tag. For example when the line looks like "\page</p>", where we want to substitute it to
    // "</p>\n</div>\n<div class="page" id="pagenumber">"
    const pageFollowedByElementRe = /^\\page([^\/]*[^>]*>)$/gm;
    const pageFollowedByElementSubs = `$1\n</div>\n${pageDiv}`;
    result = result.replace(pageFollowedByElementRe, pageFollowedByElementSubs);

    // Encapsulate the result with the pages div and the first page div
    result = `<div class="pages">\n${pageDiv}\n${result}\n</div>\n</div>`

    // Find all instances of the id "pagenumber", and exchange them to its page number
    const findAllPageInstancesRe = /id="pagenumber"/gm;
    let pageNumberCounter = 2;
    result = result.replace(findAllPageInstancesRe, ()=>{return `id="p${pageNumberCounter++}"`});

    return result;
}

module.exports = {
    markdown: markdown,
    render: (rawBrewText)=>{
        let raw = markdown.render(rawBrewText);
        result = splitPages(raw);
        return result;
    },
    validate : (rawBrewText)=>{
        return markdown.validate(rawBrewText);
    }
}