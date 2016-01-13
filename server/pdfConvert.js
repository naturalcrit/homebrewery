var pdf = require('html-pdf');
var Markdown = require('marked');

var PHBStyle = '<style>' + require('fs').readFileSync('../phb.standalone.css', 'utf8') + '</style>'


var content = Markdown('# oh hey \n welcome! isnt this neat \n \\page ##### test');


var html = "<html><head>" + PHBStyle + "</head><body><div class='phb'>"+ content +"</div></body></html>"

//var h = 279.4 - 20*2.8;
var h = 279.4 - 56;



//var w = 215.9 - 56*1.7

var w = 215.9 - 43;


var config = {
	"height": (279.4 - 56) + "mm",
	"width": (215.9 - 43) + "mm",
	"border": "0",
}

pdf.create(html, config).toFile('./temp.pdf', function(err, res){
	console.log(err);
	console.log(res.filename);
});