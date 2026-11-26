// vite.config.js
import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateAssetsPlugin } from './vitePlugins/generateAssetsPlugin.js';

const logger = createLogger();

const originalWarnOnce = logger.warnOnce.bind(logger);

logger.warnOnce = (message, options) => {
	if (message.includes("didn't resolve at build time")) {
		return;
	}

	originalWarnOnce(message, options);
};

export default defineConfig({
	customLogger : logger,
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
		preserveSymlinks: true,
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
