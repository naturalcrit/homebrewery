// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "build",
		emptyOutDir: true,
		ssrManifest: true,
		rollupOptions: {
			input: {
				admin: path.resolve(__dirname, "client/admin/admin.jsx"),
				homebrew: path.resolve(__dirname, "client/homebrew/homebrew.jsx"),
			},
			output: {
				entryFileNames: "[name]/bundle.js",
				chunkFileNames: "[name]/[name]-[hash].js",
				assetFileNames: "[name]/[name].[ext]",
			},
		},
	},
	server: {
		fs: {
			allow: ["."],
		},
	},
});
