import fs from "fs";

const isProd = process.env.NODE_ENV === "production";

const template = async function ({ vite, url }, name, title = "", props = {}) {
	const ogTags = [];
	const ogMeta = props.ogMeta ?? {};

	Object.entries(ogMeta).forEach(([key, value]) => {
		if (!value) return;
		ogTags.push(`<meta property="og:${key}" content="${value}">`);
	});

	const ogMetaTags = ogTags.join("\n");

	// ----------------
	// PROD
	// ----------------
	if (isProd) {
		const ssrModule = await import(`../build/entry-server-${name}/bundle.js`);

		return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, height=device-height, interactive-widget=resizes-visual" />
    <link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
    <link href="/${name}/bundle.css" rel="stylesheet" />
    <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
    ${ogMetaTags}
    <meta name="twitter:card" content="summary">
    <title>${title.length ? `${title} - The Homebrewery` : "The Homebrewery - NaturalCrit"}</title>
  </head>
  <body>
    <main id="reactRoot">${ssrModule.default(props)}</main>
    <script src="/${name}/bundle.js"></script>
    <script>start_app(${JSON.stringify(props)})</script>
  </body>
</html>`;
	}

	// ----------------
	// DEV
	// ----------------
	const { default: render } = await vite.ssrLoadModule(`/client/entry-server-${name}.jsx`);

	let html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, height=device-height, interactive-widget=resizes-visual" />
    ${ogMetaTags}
    <title>${title.length ? `${title} - The Homebrewery` : "The Homebrewery - NaturalCrit"}</title>
  </head>
  <body>
  <main id="reactRoot">${render(props)}</main>

  <script type="module" src="/@vite/client"></script>
  <script type="module" src="/client/entry-client-${name}.jsx"></script>

</body>

</html>`;

	return vite.transformIndexHtml(url, html);
};

export default template;
