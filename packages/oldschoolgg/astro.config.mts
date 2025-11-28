import { type Plugin } from 'vite';
import path from 'node:path';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const manualChunks = {
	oldschooljs: ['oldschooljs']
};

type ManualChunks = Record<string, string[]>;

function splitVendorChunkPlugin() {
	const plugin: Plugin = {
		name: 'split-vendor-chunk-plugin',
		config() {
			return {
				build: {
					rollupOptions: {
						output: {
							manualChunks(id) {
								if (id.includes('oldschooljs') && id.includes('monster')) {
									return 'oldschooljs_monsters';
								}
								if (id.includes('oldschooljs') && id.includes('item')) {
									return 'oldschooljs_items';
								}
								if (id.includes('oldschooljs')) {
									console.log(`oldschooljs: ${id}`);
								}
								for (const [chunkName, matchingNames] of Object.entries(manualChunks)) {
									if (matchingNames.some(m => id.includes(m))) {
										return chunkName;
									}
								}
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
		resolve: {
			alias: {
				'@': path.resolve('./src')
			}
		},
		plugins: [tailwindcss(),
		splitVendorChunkPlugin()],
		define: {
			...config
		}
	},
	devToolbar: { enabled: false },
	integrations: [react()],
	output: 'static'
});
