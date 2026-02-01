// vite-plugins/generateAssetsPlugin.js
import fs from "fs-extra";
import path from "path";
import less from "less";

export function generateAssetsPlugin(isDev = false) {
	return {
		name: "generate-assets",
		async buildStart() {
			const buildDir = path.resolve(process.cwd(), "build");

			// Copy favicon
			await fs.copy("./client/homebrew/favicon.ico", `${buildDir}/assets/favicon.ico`);

			// Copy shared styles/fonts
			const assets = fs.readdirSync("./shared/naturalcrit/styles");
			for (const file of assets) {
				await fs.copy(`./shared/naturalcrit/styles/${file}`, `${buildDir}/fonts/${file}`);
			}

			// Compile Legacy themes
			const themes = { Legacy: {}, V3: {} };
			const legacyDirs = fs.readdirSync("./themes/Legacy");
			for (const dir of legacyDirs) {
				const themeData = JSON.parse(fs.readFileSync(`./themes/Legacy/${dir}/settings.json`, "utf-8"));
				themeData.path = dir;
				themes.Legacy[dir] = themeData;

				const src = `./themes/Legacy/${dir}/style.less`;
				const outputDir = `${buildDir}/themes/Legacy/${dir}/style.css`;
				const lessOutput = await less.render(fs.readFileSync(src, "utf-8"), { compress: !isDev });
				await fs.outputFile(outputDir, lessOutput.css);
			}

			// Compile V3 themes
			const v3Dirs = fs.readdirSync("./themes/V3");
			for (const dir of v3Dirs) {
				const themeData = JSON.parse(fs.readFileSync(`./themes/V3/${dir}/settings.json`, "utf-8"));
				themeData.path = dir;
				themes.V3[dir] = themeData;

				await fs.copy(
					`./themes/V3/${dir}/dropdownTexture.png`,
					`${buildDir}/themes/V3/${dir}/dropdownTexture.png`,
				);
				await fs.copy(
					`./themes/V3/${dir}/dropdownPreview.png`,
					`${buildDir}/themes/V3/${dir}/dropdownPreview.png`,
				);

				const src = `./themes/V3/${dir}/style.less`;
				const outputDir = `${buildDir}/themes/V3/${dir}/style.css`;
				const lessOutput = await less.render(fs.readFileSync(src, "utf-8"), { compress: !isDev });
				await fs.outputFile(outputDir, lessOutput.css);
			}

			// Write themes.json
			await fs.outputFile("./themes/themes.json", JSON.stringify(themes, null, 2));

			// Copy fonts/assets/icons
			await fs.copy("./themes/fonts", `${buildDir}/fonts`);
			await fs.copy("./themes/assets", `${buildDir}/assets`);
			await fs.copy("./client/icons", `${buildDir}/icons`);

			// Compile CodeMirror editor themes
			const editorThemesBuildDir = `${buildDir}/homebrew/cm-themes`;
			await fs.copy("./node_modules/codemirror/theme", editorThemesBuildDir);
			await fs.copy("./themes/codeMirror/customThemes", editorThemesBuildDir);

			const editorThemeFiles = fs.readdirSync(editorThemesBuildDir);
			await fs.outputFile(
				"./themes/codeMirror/editorThemes.json",
				JSON.stringify(["default", ...editorThemeFiles.map((f) => f.slice(0, -4))], null, 2),
			);

			// Copy remaining CodeMirror assets
			await fs.copy("./themes/codeMirror", `${buildDir}/homebrew/codeMirror`);
		},
	};
}
