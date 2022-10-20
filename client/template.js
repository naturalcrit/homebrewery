const template = async function(name, title='', props = {}){
	const HOMEBREWERY_PUBLIC_URL=props.config.publicUrl;

	const ogMeta = {
		siteName    : 'The Homebrewery - Make your Homebrew content look legit!',
		title       : 'The Homebrewery',
		description : 'Homepage',
		thumbnail   : `${HOMEBREWERY_PUBLIC_URL}/thumbnail.png`,
		type        : 'website'
	};

	if(props.url.match(/\/share\/|\/edit\//)){
		Object.assign(ogMeta, {
			siteName    : null,
			title       : props.brew.title || 'Homebrewery - Untitled Brew',
			description : props.brew.description || 'No description.',
			thumbnail   : props.brew.thumbnail || null,
			type        : 'article'
		});
	} else if(props.url.match(/\/print\/|\/source\//)){
		Object.assign(ogMeta, {
			siteName    : null,
			title       : `${props.brew.title} - ${props.url.match(/\/print\/|\/source\//)}` || 'Homebrewery - Untitled Brew',
			description : props.brew.description || 'No description.',
			thumbnail   : props.brew.thumbnail || null,
			type        : 'article'
		});
	}

	const ogTags = [];
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
			<link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
			${ogMetaTags}
			<meta name="twitter:card" content="summary_large_image">
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