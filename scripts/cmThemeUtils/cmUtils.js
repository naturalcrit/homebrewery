import fs from 'fs-extra';

// const editorThemesBuildDir = './build/homebrew/cm-themes';

const editorThemeFile = './themes/codeMirror/editorThemes.json';
const sources = ['./node_modules/codemirror/theme', './themes/codeMirror/customThemes'];


const getThemesFromFiles = function(){
	const themes = [];

	sources.forEach((source)=>{
		const files = fs.readdirSync(source);
		const output = files.map((file)=>{ return file.slice(0, -4);});
		themes.push(...output);
	});

	themes.sort();

	return ['default', ...themes];
};

const checkThemesFile = function(extended=false){
	const themeFromSources = getThemesFromFiles();

	let themeFromFile;
	try {
		themeFromFile = JSON.parse(fs.readFileSync(editorThemeFile));
	} catch {
		themeFromFile = [];
	}

	// console.log('Func:', themeFromSources.toString());
	// console.log('File:', themeFromFile.toString())

	const output = [
		themeFromSources.toString() != themeFromFile.toString(),
		themeFromSources,
		themeFromFile
	];

	if(extended) return output;
	return output[0];
};

const updateThemesFile = function(){
	const [updateRequired, themeFromSources] = checkThemesFile(true);

	if(!updateRequired){
		console.log('No updates required to CM themes file:', editorThemeFile);
		return;
	}

	console.log('Updating CM themes file:', editorThemeFile);
	try {
		fs.writeFileSync(editorThemeFile, JSON.stringify(themeFromSources, null, 2));
	} catch (err) {
		console.log('Error updating themes file', err);
		throw err;
	}
	return;
};

export {
	checkThemesFile,
	updateThemesFile
};
