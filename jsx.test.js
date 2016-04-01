require('app-module-path').addPath('./shared');


var jsx = require('xml2js').parseString;

var parser = require('xml2json');
var XMLMapping = require('xml-mapping');





var xml = `
<NewBlock woh="6" cant_be="neato">
	<Weird href="cooool things" />
	<span> hey! </span>
	<span> me too! </span>
</NewBlock>
`

var json = XMLMapping.load(xml);

return console.log(JSON.stringify(json, null, '  '));


/*
return console.log(parser.toJson(xml, {

	arrayNotation: true,reversible: true,

}));
*/




jsx(xml, {trim: true}, function (err, result) {
	console.log(JSON.stringify(result, null, '  '));
});
