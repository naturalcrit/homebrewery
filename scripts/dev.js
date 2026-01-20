import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import url from "url";
import template from "../client/template.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();

async function start() {
	const vite = await createViteServer({
		server: { middlewareMode: true },
		root: path.resolve(__dirname, "../client"),
		appType: "custom",
	});

	app.use(vite.middlewares);
	app.use("/assets", express.static(path.resolve(__dirname, "../client/assets")));

	app.use(/(.*)/, async (req, res, next) => {
		try {
			const parsed = url.parse(req.url);
			const pathname = parsed.pathname || "/";

			// Ignore vite HMR or ping requests
			if (pathname.startsWith("/__vite")) return next();

			const entry = pathname.startsWith("/admin") ? "admin" : "homebrew";

			const ssrModule = await vite.ssrLoadModule(`/${entry}/${entry}.jsx`);

			const html = await template(entry, "", { path: pathname, ssrModule });
			res.status(200).set({ "Content-Type": "text/html" }).end(html);
		} catch (e) {
			vite.ssrFixStacktrace(e);
			console.error(e);
			res.status(500).end(e.message);
		}
	});

	app.listen(8000, () => console.log("Dev server running on http://localhost:8000"));
}

start();
