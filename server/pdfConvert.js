var pdf = require('html-pdf');
var Markdown = require('marked');

var style = require('fs').readFileSync('../build/phbPage/bundle.css', 'utf8');

style = "<style>html, body {margin: 0;padding: 0;-webkit-print-color-adjust: exact;box-sizing: border-box;}\n"+
	style + "</style>";

	function replaceAll(str, find, replace) {
	  return str.replace(new RegExp(find, 'g'), replace);
	}

style = replaceAll(style, '/assets/homebrew/assets/', 'http://www.naturalcrit.com/assets/homebrew/assets/');

var content = Markdown('# oh hey \n welcome! ##### test');


var html = "<html><head>" + style + "</head><body><div class='phb'>"+ content +"</div></body></html>"

console.log(html);


pdf.create(html).toFile('./pdfs/businesscard.pdf', function(err, res){
	console.log(err);
	console.log(res.filename);
});