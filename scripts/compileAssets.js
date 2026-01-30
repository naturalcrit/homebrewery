import fs from "fs-extra";
import less from "less";
const isDev = !!process.argv.find((arg) => arg === "--dev");

const compileAssets = async () => {
	await fs.copy("./client/homebrew/favicon.ico", "./build/assets/favicon.ico");

	//v==----------------------------- COMPILE THEMES --------------------------------==v//

	// Update list of all Theme files
	const themes = { Legacy: {}, V3: {} };

	let themeFiles = fs.readdirSync("./themes/Legacy");
	for (const dir of themeFiles) {
		const themeData = JSON.parse(fs.readFileSync(`./themes/Legacy/${dir}/settings.json`).toString());
		themeData.path = dir;
		themes.Legacy[dir] = themeData;
		//fs.copy(`./themes/Legacy/${dir}/dropdownTexture.png`, `./build/themes/Legacy/${dir}/dropdownTexture.png`);
		const src = `./themes/Legacy/${dir}/style.less`;
		((outputDirectory) => {
			less.render(
				fs.readFileSync(src).toString(),
				{
					compress: !isDev,
				},
				function (e, output) {
					fs.outputFile(outputDirectory, output.css);
				},
			);
		})(`./build/themes/Legacy/${dir}/style.css`);
	}

	themeFiles = fs.readdirSync("./themes/V3");
	for (const dir of themeFiles) {
		const themeData = JSON.parse(fs.readFileSync(`./themes/V3/${dir}/settings.json`).toString());
		themeData.path = dir;
		themes.V3[dir] = themeData;
		fs.copy(`./themes/V3/${dir}/dropdownTexture.png`, `./build/themes/V3/${dir}/dropdownTexture.png`);
		fs.copy(`./themes/V3/${dir}/dropdownPreview.png`, `./build/themes/V3/${dir}/dropdownPreview.png`);
		const src = `./themes/V3/${dir}/style.less`;
		((outputDirectory) => {
			less.render(
				fs.readFileSync(src).toString(),
				{
					compress: !isDev,
				},
				function (e, output) {
					fs.outputFile(outputDirectory, output.css);
				},
			);
		})(`./build/themes/V3/${dir}/style.css`);
	}

	await fs.outputFile("./themes/themes.json", JSON.stringify(themes, null, 2));

	// await less.render(lessCode, {
	// 	compress  : !dev,
	// 	sourceMap : (dev ? {
	// 		sourceMapFileInline: true,
	// 		outputSourceFiles: true
	// 	} : false),
	// })

	// Move assets
	await fs.copy("./themes/fonts", "./build/fonts");
	await fs.copy("./themes/assets", "./build/assets");
	await fs.copy("./client/icons", "./build/icons");

	//v==---------------------------MOVE CM EDITOR THEMES -----------------------------==v//

	const editorThemesBuildDir = "./build/homebrew/cm-themes";
	await fs.copy("./node_modules/codemirror/theme", editorThemesBuildDir);
	await fs.copy("./themes/codeMirror/customThemes", editorThemesBuildDir);
	const editorThemeFiles = fs.readdirSync(editorThemesBuildDir);

	const editorThemeFile = "./themes/codeMirror/editorThemes.json";
	if (fs.existsSync(editorThemeFile)) fs.rmSync(editorThemeFile);
	const stream = fs.createWriteStream(editorThemeFile, { flags: "a" });
	stream.write('[\n"default"');

	for (const themeFile of editorThemeFiles) {
		stream.write(`,\n"${themeFile.slice(0, -4)}"`);
	}
	stream.write("\n]\n");
	stream.end();

	await fs.copy("./themes/codeMirror", "./build/homebrew/codeMirror");
};

compileAssets();
