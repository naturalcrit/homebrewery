const fs = require('fs-extra');
const git = require('simple-git');

const Themes = JSON.parse(fs.readFileSync(`./themes/remoteThemes.json`).toString());

const snippets = [];
const checkoutPromises = [];
for (const renderVersion in Themes) {
	for (const theme in Themes[renderVersion]) {
		const cur = Themes[renderVersion][theme];
		if(cur?.homeRepository) {
			if(fs.existsSync(`themes/${renderVersion}/${theme}`)) {
				fs.rmdirSync(`themes/${renderVersion}/${theme}`, { recursive: true, force: true });
			}
			checkoutPromises.push(git().clone(cur.homeRepository, `themes/${renderVersion}/${theme}/latest`));
		}
		if(cur.versions) {
			for (const versionDir in cur.versions) {
				const tag = cur.versions[versionDir];
				checkoutPromises.push(git().clone(cur.homeRepository, `themes/${renderVersion}/${theme}/${tag}`,
					{ '--depth': '1', '--branch': tag }));
			}
		}
	}
}

Promise.all(checkoutPromises).then((results) => {
	const renderEngines = ['Legacy', 'V3'];
	for (const renderVersion in renderEngines ) {
		const engine = renderEngines[renderVersion];
		themeFiles = fs.readdirSync(`./themes/${engine}`);
		for (const theme of themeFiles) {
			const stats = fs.lstatSync(`./themes/${engine}/${theme}`);
			if(stats.isDirectory()) {
				if(engine == 'Legacy') {
					snippets.push(`'${engine}_${theme}' : require('themes/${engine}/${theme}/snippets.js')`);
				} else {
					const themeVerions = fs.readdirSync(`./themes/${engine}/${theme}`);
					for (versionDir of themeVerions) {
						snippets.push(`'${engine}_${theme}_${versionDir}' : require('themes/${engine}/${theme}/${versionDir}/snippets.js')`);
					}
				}
			}
		}
	}
	let snippetsFile = 'module.exports = {\n';
	for (const s in snippets) {
		snippetsFile += `    ${snippets[s]}`;
		if(s != snippets.length - 1) {
			snippetsFile += ',\n';
		} else {
			snippetsFile += '\n';
		}
	};
	snippetsFile += '};\n';
	fs.writeFileSync(`./themes/themeSnippets.js`, snippetsFile);
});
