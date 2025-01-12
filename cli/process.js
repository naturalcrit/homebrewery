import fs from "fs";
import config from "nconf";
import path from "path";

import { splitTextStyleAndMetadata } from "../shared/helpers.js";
import markdown from "../shared/naturalcrit/markdown.js";

process.chdir(path.resolve());

config.argv({ x: { lowerCase: true } }).file({ file: "config.json" });

// Check mandatory parameters exist
const requiredParams = ["input", "output", "renderer"];
const params = requiredParams.map((param) => {
	return config.get(param);
});
if (
	params.some((x) => {
		return !x;
	})
) {
	console.log("Required parameter missing");
	requiredParams.forEach((param) => {
		console.log(`${param} : ${config.get(param)}`);
	});
	console.log("Please check your parameters before trying again.");
}

// Check if output file exists, and if we're allowed to overwrite it
if (fs.existsSync(config.get("output")) && !config.get("overwrite")) {
	console.log(
		"Specified output file exists: please specify --overwrite to replace.",
	);
	process.exit();
}

// Read input file
const brew = {
	text: fs.readFileSync(config.get("input"), { encoding: "UTF-8" }),
};

// Parse brew text to populate brew object
// This mutates the passed object
splitTextStyleAndMetadata(brew);

// Set Renderer Options
const RendererOptions = {
	// NOTE: legacy renderer is unsupported
	// legacy: {
	// module: markdownLegacy,
	// pageRegex: /\\page/gm,
	// divHeader: "",
	// divFooter: "",
	// pageHeader:
	// "<link href='/themes/Legacy/Blank/style.css' rel='stylesheet' />\n<link href='/themes/Legacy/5ePHB/style.css' rel='stylesheet' />\n",
	// },
	v3: {
		module: markdown,
		pageRegex: /^\\page$/gm,
		divHeader: ">\n<div className='columnWrapper'",
		divFooter: "\n</div>",
		pageHeader:
			"<link href='/themes/V3/Blank/style.css' rel='stylesheet' />\n<link href='/themes/V3/5ePHB/style.css' rel='stylesheet' />\n",
	},
};

const Marked = RendererOptions[config.get("renderer")].module;

// Initialize a list to render the pages in to
brew.html = [];

// Split brew.text into pages and render to HTML
const pages = brew.text.split(
	RendererOptions[config.get("renderer")].pageRegex,
);
pages.forEach((page, index) => {
	brew.html[index] =
		`<div class='page phb' id='p${index + 1}' key='${index}' ${RendererOptions[config.get("renderer")].divHeader}>${Marked.render(page)}${RendererOptions[config.get("renderer")].divFooter}\n</div>\n`;
});

// Wrap the output in a HTML template
const htmlOutput = `<!DOCTYPE html>
	<html>
		<head>
			<link href="https://use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet" />
			<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
			<link href='/homebrew/bundle.css' rel='stylesheet' />
			<link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
			<title>The Homebrewery - Local Output</title>
		</head>
		<body>
      ${RendererOptions[config.get("renderer")].pageHeader}
      <div class='brewRenderer'>
        <style>${brew.style}</style>
        <div class='pages'>
			    ${brew.html.join("\n")}
        </div>
      </div>
		</body>
	</html>
	`;

const outputDir = path.dirname(config.get("output"));
fs.mkdirSync(outputDir, { recursive: true });
// Write everything to the output file
fs.writeFileSync(config.get("output"), htmlOutput);
// Write supporting web assets
fs.cpSync("./build/", path.join(outputDir, "./"), { recursive: true });

console.log(`Output written to file: ${config.get("output")}`);
