// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { generateAssetsPlugin } from "./vitePlugins/generateAssetsPlugin.js";

export default defineConfig({
	plugins: [react(), generateAssetsPlugin()],
	build: {
		outDir: "build",
		emptyOutDir: false,
		rollupOptions: {
			output: {
				entryFileNames: "[name]/bundle.js",
				chunkFileNames: "[name]/[name]-[hash].js",
				assetFileNames: "[name]/[name].[ext]",
			},
		},
	},
	define: {
		global: "window.__INITIAL_PROPS__",
	},
	server: {
		port: 8000,
		fs: {
			allow: ["."],
		},
	},
});
