import DB from "./server/db.js";
import createApp from "./server/app.js";
import config from "./server/config.js";
import { createServer as createViteServer } from "vite";

const isProd = process.env.NODE_ENV === "production";

async function start() {
	let vite;

	//==== Create Vite dev server only in development ====//
	if (!isProd) {
		vite = await createViteServer({
			server: { middlewareMode: true },
			appType: "custom",
		});
		
	}

	//==== Connect to the database ====//
	await DB.connect(config).catch((err) => {
		console.error("Database connection failed:", err);
		process.exit(1);
	});

	//==== Create the Express app ====//
	const app = await createApp(vite);

	//==== Start listening ====//
	const PORT = process.env.PORT || config.get("web_port") || 8000;
	app.listen(PORT, () => {
		const reset = "\x1b[0m"; // Reset to default style
		const bright = "\x1b[1m"; // Bright (bold) style
		const cyan = "\x1b[36m"; // Cyan color
		const underline = "\x1b[4m"; // Underlined style

		console.log(`\n\tserver started at: ${new Date().toLocaleString()}`);
		console.log(`\tserver on port: ${PORT}`);
		console.log(
			`\t${bright + cyan}Open in browser: ${reset}${underline + bright + cyan}http://localhost:${PORT}${reset}\n\n`,
		);
	});
}

//==== Start the server ====//
start();
