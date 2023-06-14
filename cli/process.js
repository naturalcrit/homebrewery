const fs = require('fs');
const config = require('nconf');

const App = require('../server/app.js');

process.chdir(__dirname);

config
    .argv({ 'x': { lowerCase: true } })
    .file({ file: 'config.json' });


// Check mandatory parameters exist
const requiredParams = ['input', 'output', 'renderer'];
const params = requiredParams.map((param)=>{
	return config.get(param);
});
if(params.some((x)=>{return !x;})){
	console.log('Required parameter missing');
	requiredParams.forEach((param)=>{
		console.log(`${param} : ${config.get(param)}`);
	});
	console.log('Please check your parameters before trying again.');
};

// Check if output file exists, and if we're allowed to overwrite it
if(fs.existsSync(config.get('output')) && !config.get('overwrite')){
	console.log('Specified output file exists: please specify --overwrite to replace.');
	process.exit();
}

// Read input file
const brew = {
	text : fs.readFileSync(config.get('input'), { encoding: 'UTF-8' })
};

// Parse brew text to populate brew object
// This mutates the passed object
App.splitTextStyleAndMetadata(brew);

// Set Renderer Options
const RendererOptions = {
	'legacy' : {
		module     : '../shared/naturalcrit/markdownLegacy.js',
		pageRegex  : /\\page/gm,
		divHeader  : '',
		divFooter  : '',
		pageHeader : '<link href=\'../build/themes/Legacy/Blank/style.css\' rel=\'stylesheet\' />\n<link href=\'../build/themes/Legacy/5ePHB/style.css\' rel=\'stylesheet\' />\n'
	},
	'v3' : {
		module     : '../shared/naturalcrit/markdown.js',
		pageRegex  : /^\\page$/gm,
		divHeader  : '>\n<div className=\'columnWrapper\'',
		divFooter  : '\n</div>',
		pageHeader : '<link href=\'../build/themes/V3/Blank/style.css\' rel=\'stylesheet\' />\n<link href=\'../build/themes/V3/5ePHB/style.css\' rel=\'stylesheet\' />\n'
	}
};

const Marked = require(RendererOptions[config.get('renderer')].module);

// Initialize a list to render the pages in to
brew.html = [];

// Split brew.text into pages and render to HTML
const pages = brew.text.split(RendererOptions[config.get('renderer')].pageRegex);
pages.forEach((page, index)=>{
	brew.html[index] = `<div class='page phb' id='p${index + 1}' key='${index}' ${RendererOptions[config.get('renderer')].divHeader}>${Marked.render(page)}${RendererOptions[config.get('renderer')].divFooter}\n</div>\n`;
});


// Wrap the output in a HTML template
const htmlOutput = `<!DOCTYPE html>
	<html>
		<head>
			<link href="//use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet" />
			<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
			<link href='../build/homebrew/bundle.css' rel='stylesheet' />
			<link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
			<title>The Homebrewery - Local Output</title>
		</head>
		<body>
            ${RendererOptions[config.get('renderer')].pageHeader}
            <div class='brewRenderer'>
                <style>${brew.style}</style>
                <div class='pages'>
			        ${brew.html.join('\n')}
                </div>
            </div>
		</body>
	</html>
	`;

// Write everything to the output file
fs.writeFileSync(config.get('output'), htmlOutput);

console.log(`Output written to file: ${config.get('output')}`);