// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateAssetsPlugin } from './vitePlugins/generateAssetsPlugin.js';

export default defineConfig({
	plugins : [react(), generateAssetsPlugin()],
	resolve : {
		alias : {
			'@vitreum'      : path.resolve(import.meta.dirname, './vitreum'),
			'@shared'       : path.resolve(import.meta.dirname, './shared'),
			'@sharedStyles' : path.resolve(import.meta.dirname, './shared/naturalcrit/styles'),
			'@navbar'       : path.resolve(import.meta.dirname, './client/homebrew/navbar'),
			'@themes'       : path.resolve(import.meta.dirname, './themes'),
			'@components'   : path.resolve(import.meta.dirname, './client/components')
		},
	},
	build : {
		outDir        : 'build',
		emptyOutDir   : false,
		rollupOptions : {
			output : {
				entryFileNames : '[name]/bundle.js',
				chunkFileNames : '[name]/[name]-[hash].js',
				assetFileNames : '[name]/[name].[ext]',
			},
		},
	},
	define : {
		global : 'window.__INITIAL_PROPS__',
	},
	server : {
		port : 8000,
		fs   : {
			allow : ['.'],
		},
	},
});
