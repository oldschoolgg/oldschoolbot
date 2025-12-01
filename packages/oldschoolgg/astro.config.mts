import path from 'node:path';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import type { Plugin } from 'vite';

function dynamicAlias(): Plugin {
	return {
		name: 'dynamic-alias',
		resolveId(source, importer) {
			if (importer?.includes('oldschooljs')) {
				console.log({ source, importer });
			}
			if (source.includes('@') && importer?.includes('oldschooljs')) {
				const resolved = path
					.join(process.cwd(), `../oldschooljs/src/${source.split('@')[1]}`)
					.replace('.js', '.ts');
				return resolved;
			}

			return null;
		}
	};
}

function splitVendorChunkPlugin() {
	const plugin: Plugin = {
		name: 'split-vendor-chunk-plugin',
		config() {
			return {
				build: {
					rollupOptions: {
						output: {
							manualChunks(id) {
								if (id.includes('oldschooljs') && id.includes('item_data')) {
									return 'oldschooljs_items';
								}
								if (id.includes('oldschooljs')) {
									return 'oldschooljs';
								}
								// for (const [chunkName, matchingNames] of Object.entries(manualChunks)) {
								// 	if (matchingNames.some(m => id.includes(m))) {
								// 		return chunkName;
								// 	}
								// }
								if (id.includes('node_modules')) {
									const match = /.*node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(id);
									return match !== null && match.length > 0 ? match[1] : 'vendor';
								}
							}
						}
					}
				}
			};
		}
	};

	return plugin;
}

const config = {
	__API_URL__: process.env.API_URL || 'https://api.oldschool.gg',
	__FRONTEND_URL__: process.env.FRONTEND_URL || 'https://oldschool.gg',
	__WS_URL__: process.env.WS_URL || 'wss://ws.oldschool.gg',
	__DISCORD_CLIENT_ID__: process.env.DISCORD_CLIENT_ID || '',
	__IS_PRODUCTION__: process.env.NODE_ENV === 'production'
};
for (const [key, value] of Object.entries(config)) {
	config[key] = JSON.stringify(value);
}

export default defineConfig({
	server: {
		allowedHosts: ['wfe.magnaboy.com'],
		port: 3002,
		host: true
	},
	vite: {
		ssr: {
			noExternal: ['zod']
		},
		// resolve: {
		// 	alias: {
		// 		'@': path.resolve('./src')
		// 	}
		// },
		plugins: [tailwindcss(), splitVendorChunkPlugin()],
		define: {
			...config
		},
		build: {
			minify: false
			// rollupOptions: {
			// 	treeshake: 'smallest'
			// }
		}
	},
	devToolbar: { enabled: false },
	integrations: [react()],
	output: 'static'
});
