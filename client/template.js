module.exports = async(name, title = '', props = {})=>{
	return `
<!DOCTYPE html>
<html>
	<head>
		<link href="//use.fontawesome.com/releases/v5.15.1/css/all.css" rel="stylesheet" />
		<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
		<link href=${`/${name}/bundle.css`} rel='stylesheet' />
		<link rel="icon" href="/assets/homebrew/favicon.ico" type="image/x-icon" />
		<meta property="og:title" content="${props.brew?.title ? props.brew.title : 'Homebrewery - Untitled Brew'}">
		<meta property="og:url" content="https://homebrewery.naturalcrit.com${props.brew?.shareId ? `/share/${props.brew.shareId}` : '/new'}">
		<meta property="og:image" content="${props.brew?.thumbnail ? props.brew.thumbnail : 'https://i.imgur.com/FwRuhv7.png'}">
		<meta property="og:description" content="${props.brew?.description ? props.brew.description : 'No description.'}">
		<meta property="og:site_name" content="The Homebrewery - Make your Homebrew content look legit!">
		<meta property="og:type" content="website">
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
