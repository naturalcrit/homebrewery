// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "build",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				entryFileNames: "[name]/bundle.js",
				chunkFileNames: "[name]/[name]-[hash].js",
				assetFileNames: "[name]/[name].[ext]",
			},
		},
	},
	// vite.config.js
	define: {
		global: "window",
	},
	server: {
		port: 8000,
		fs: {
			allow: ["."],
		},
	},
});
