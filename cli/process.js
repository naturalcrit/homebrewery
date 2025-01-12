import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { splitTextStyleAndMetadata } from "../shared/helpers.js";
import markdown from "../shared/naturalcrit/markdown.js";

const RENDER_OPTIONS = {
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

const parseBrewText = (text) => {
	const brew = { text };
	splitTextStyleAndMetadata(brew);
	return brew;
};

const renderBrewPages = (text, renderer) =>
	text
		// split into markdown pages
		.split(renderer.pageRegex)
		// render to html pages
		.map(
			(page, index) =>
				`
        <div class='page phb' id='p${index + 1}' key='${index}' ${renderer.divHeader}>
          ${renderer.module.render(page)}${renderer.divFooter}\n
        </div>\n`,
		);

const renderHTML = (brew, renderer) => {
	const pages = renderBrewPages(brew.text, renderer);

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
      ${renderer.pageHeader}
      <div class='brewRenderer'>
        <style>${brew.style}</style>
        <div class='pages'>
			    ${pages.join("\n")}
        </div>
      </div>
		</body>
	</html>
	`;
	return htmlOutput;
};

const render = (brewText, rendererVersion) => {
	const renderer = RENDER_OPTIONS[rendererVersion];
	const brew = parseBrewText(brewText);
	const html = renderHTML(brew, renderer);

	return html;
};

yargs(hideBin(process.argv))
	.scriptName("homebrewery")
	.usage("$0 <cmd> [args]")
	.command(
		"write-brew <input> <output>",
		"write brew to file headlessly",
		(yargs) => {
			yargs.positional("input", {
				type: "string",
				describe: "path to markdown brew file",
			});
			yargs.positional("output", {
				type: "string",
				describe: "path to html output file",
			});
			yargs.option("r", {
				alias: "renderer",
				default: "v3",
				describe: "Renderer to use. Only v3 is supported.",
				type: "string",
			});
			yargs.option("x", {
				alias: "overwrite",
				default: false,
				describe: "Should overwrite existing files",
				type: "boolean",
			});
		},
		function (argv) {
			// Check if output file exists, and if we're allowed to overwrite it
			if (fs.existsSync(argv.output) && !argv.overwrite) {
				console.log(
					"Specified output file exists: please specify --overwrite to replace.",
				);
				process.exit();
			}

			// Read input file
			const inputText = fs.readFileSync(argv.input, {
				encoding: "UTF-8",
			});
			const html = render(inputText, argv.renderer);

			const outputDir = path.dirname(argv.output);
			fs.mkdirSync(outputDir, { recursive: true });
			// Write everything to the output file
			fs.writeFileSync(argv.output, html);
			// Write supporting web assets
			fs.cpSync("./build/", path.join(outputDir, "./"), { recursive: true });

			console.log(`Output written to file: ${argv.output}`);
		},
	)
	.help().argv;
