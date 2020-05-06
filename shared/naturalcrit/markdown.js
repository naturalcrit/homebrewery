const _ = require('lodash');
const Markdown = require('marked');

// Copied directly from Marked helpers.js source with permission
function splitCells(tableRow, count) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
      let escaped = false,
        curr = offset;
      while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    }),
    cells = row.split(/ \|/);
  let i = 0;

  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count) cells.push('');
  }

  for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, '|');
  }
  return cells;
}

const renderer = {
	// Adjust the way html is handled
	html(html) {
    html = _.trim(html)

    // Process the markdown within Divs
    if(_.startsWith(html, '<div') && html.includes('>')) {
      let openTag = html.substring(0, html.indexOf('>')+1);
      html = html.substring(html.indexOf('>')+1);
      return `${openTag} ${Markdown(html)}`;
    }

    // Don't require a blank line after HTML to parse Markdown
    if(html.includes('\n')) {
      if(_.startsWith(html, '<style') || _.startsWith(html, '<pre')) {
        return html; // Style and Pre tags should not parse Markdown
      }
      let openTag = html.substring(0, html.indexOf('\n')+1);
      html = html.substring(html.indexOf('\n')+1);
      return `${openTag} ${Markdown(html)}`;
    }
    
		return html;
	}
};

const tokenizer = {
  //Adjust tables to work even if columns are uneven
	table(src) {
		const cap = this.rules.block.table.exec(src);
		if (cap) {
			const item = {
				type: 'table',
				header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
				align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
				cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
			};

			item.raw = cap[0];

			let l = item.align.length;
			let i;
			for (i = 0; i < l; i++) {
				if (/^ *-+: *$/.test(item.align[i])) {
					item.align[i] = 'right';
				} else if (/^ *:-+: *$/.test(item.align[i])) {
					item.align[i] = 'center';
				} else if (/^ *:-+ *$/.test(item.align[i])) {
					item.align[i] = 'left';
				} else {
					item.align[i] = null;
				}
			}

			l = item.cells.length;
			for (i = 0; i < l; i++) {
				item.cells[i] = splitCells(
					item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
					item.header.length);
			}

			return item;
		}
	}
};

/*renderer.code = function (code, infostring, escaped) {
	if(code == ''){
		return '<pre><code>\n</code></pre>';
	}
	return code;
}*/

Markdown.use({ renderer, tokenizer });

const sanatizeScriptTags = (content)=>{
	return content
		.replace(/<script/ig, '&lt;script')
		.replace(/<\/script>/ig, '&lt;/script&gt;');
};

const tagTypes = ['div', 'span', 'a'];
const tagRegex = new RegExp(`(${
	_.map(tagTypes, (type)=>{
		return `\\<${type}|\\</${type}>`;
	}).join('|')})`, 'g');


module.exports = {
	marked : Markdown,
	render : (rawBrewText)=>{
		return Markdown(
			sanatizeScriptTags(rawBrewText));
	},

	validate : (rawBrewText)=>{
		const errors = [];
		const leftovers = _.reduce(rawBrewText.split('\n'), (acc, line, _lineNumber)=>{
			const lineNumber = _lineNumber + 1;
			const matches = line.match(tagRegex);
			if(!matches || !matches.length) return acc;

			_.each(matches, (match)=>{
				_.each(tagTypes, (type)=>{
					if(match == `<${type}`){
						acc.push({
							type : type,
							line : lineNumber
						});
					}
					if(match === `</${type}>`){
						if(!acc.length){
							errors.push({
								line : lineNumber,
								type : type,
								text : 'Unmatched closing tag',
								id   : 'CLOSE'
							});
						} else if(_.last(acc).type == type){
							acc.pop();
						} else {
							errors.push({
								line : `${_.last(acc).line} to ${lineNumber}`,
								type : type,
								text : 'Type mismatch on closing tag',
								id   : 'MISMATCH'
							});
							acc.pop();
						}
					}
				});
			});
			return acc;
		}, []);

		_.each(leftovers, (unmatched)=>{
			errors.push({
				line : unmatched.line,
				type : unmatched.type,
				text : 'Unmatched opening tag',
				id   : 'OPEN'
			});
		});

		return errors;
	},
};
