const template = async function(name, title='', props = {}){
	const ogTags = [];
	const ogMeta = props.ogMeta ?? {};
	Object.entries(ogMeta).forEach(([key, value])=>{
		if(!value) return;
		const tag = `<meta property="og:${key}" content="${value}">`;
		ogTags.push(tag);
	});
	const ogMetaTags = ogTags.join('\n');

	const ssrModule = await import(`../build/${name}/ssr.cjs`);

	return `<!DOCTYPE html>
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1, height=device-height, interactive-widget=resizes-visual" />
			<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
			<link href=${`/${name}/bundle.css`} type="text/css" rel='stylesheet' />
			<link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
			${ogMetaTags}
			<meta name="twitter:card" content="summary">
			<title>${title.length ? `${title} - The Homebrewery`: 'The Homebrewery - NaturalCrit'}</title>
		</head>
		<body>
			<main id="reactRoot">${ssrModule.default(props)}</main>
			<script src=${`/${name}/bundle.js`}></script>
			<script>start_app(${JSON.stringify(props)})</script>
		</body>
	</html>
	`;
};

export default template;