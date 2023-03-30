const template = async function(name, title='', props = {}){
	const ogTags = [];
	const ogMeta = props.ogMeta ?? {};
	Object.entries(ogMeta).forEach(([key, value])=>{
		if(!value) return;
		const tag = `<meta property="og:${key}" content="${value}">`;
		ogTags.push(tag);
	});
	const ogMetaTags = ogTags.join('\n');

	return `<!DOCTYPE html>
	<html>
		<head>
			<link href="//use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet" />
			<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
			<link href=${`/${name}/bundle.css`} rel='stylesheet' />
			${props.config?.editorTheme ? `<link href='../homebrew/cm-themes/${props.config.editorTheme}.css' rel='stylesheet' />` : ''}
			<link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
			${ogMetaTags}
			<meta name="twitter:card" content="summary">
			<title>${title.length ? `${title} - The Homebrewery`: 'The Homebrewery - NaturalCrit'}</title>
		</head>
		<body>
			<main id="reactRoot">${require(`../build/${name}/ssr.js`)(props)}</main>
			<script src=${`/${name}/bundle.js`}></script>
			<script>start_app(${JSON.stringify(props)})</script>
		</body>
	</html>
	`;
};

module.exports = template;