// vite-plugins/generateAssetsPlugin.js
import fs from 'fs-extra';
import path from 'path';
import less from 'less';

export function generateAssetsPlugin(isDev = false) {
	return {
		name : 'generate-assets',
		async buildStart() {
			const buildDir = path.resolve(process.cwd(), 'build');

			// Copy favicon
			await fs.copy('./client/homebrew/favicon.ico', `${buildDir}/assets/favicon.ico`);

			// Copy shared styles/fonts
			const assets = fs.readdirSync('./shared/naturalcrit/styles');
			for (const file of assets) {
				await fs.copy(`./shared/naturalcrit/styles/${file}`, `${buildDir}/fonts/${file}`);
			}

			// Compile Legacy themes
			const themes = { Legacy: {}, V3: {} };
			const legacyDirs = fs.readdirSync('./themes/legacy');
			for (const dir of legacyDirs) {
				const themeData = JSON.parse(fs.readFileSync(`./themes/legacy/${dir}/settings.json`, 'utf-8'));
				themeData.path = dir;
				themes.Legacy[dir] = themeData;

				const src = `./themes/legacy/${dir}/style.less`;
				const outputDir = `${buildDir}/themes/legacy/${dir}/style.css`;
				const lessOutput = await less.render(fs.readFileSync(src, 'utf-8'), { compress: !isDev });
				await fs.outputFile(outputDir, lessOutput.css);
			}

			// Compile V3 themes
			const v3Dirs = fs.readdirSync('./themes/v3');
			for (const dir of v3Dirs) {
				const themeData = JSON.parse(fs.readFileSync(`./themes/v3/${dir}/settings.json`, 'utf-8'));
				themeData.path = dir;
				themes.V3[dir] = themeData;

				await fs.copy(
					`./themes/v3/${dir}/dropdownTexture.png`,
					`${buildDir}/themes/v3/${dir}/dropdownTexture.png`,
				);
				await fs.copy(
					`./themes/v3/${dir}/dropdownPreview.png`,
					`${buildDir}/themes/v3/${dir}/dropdownPreview.png`,
				);

				const src = `./themes/v3/${dir}/style.less`;
				const outputDir = `${buildDir}/themes/v3/${dir}/style.css`;
				const lessOutput = await less.render(fs.readFileSync(src, 'utf-8'), { compress: !isDev });
				await fs.outputFile(outputDir, lessOutput.css);
			}

			// Write themes.json
			await fs.outputFile('./themes/themes.json', JSON.stringify(themes, null, 2));

			// Copy fonts/assets/icons
			await fs.copy('./themes/fonts', `${buildDir}/fonts`);
			await fs.copy('./themes/assets', `${buildDir}/assets`);
			await fs.copy('./client/icons', `${buildDir}/icons`);
		},
	};
}
