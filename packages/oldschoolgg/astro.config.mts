import path from 'node:path';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import type { Plugin } from 'vite';

function splitVendorChunkPlugin() {
	const plugin: Plugin = {
		name: 'split-vendor-chunk-plugin',
		config() {
			return {
				build: {
					rollupOptions: {
						output: {
							manualChunks(id) {
								for (const osmod of ['item_data', 'EItem', 'monster']) {
									if (id.includes('oldschooljs') && id.includes(osmod)) {
										return `oldschooljs_${osmod}`;
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

const production = false;

const config: Record<string, string> = {
	__API_URL__: production ? 'https://api.oldschool.gg' : 'https://osgtestapi.magnaboy.com',
	__FRONTEND_URL__: process.env.FRONTEND_URL || 'https://oldschool.gg',
};

for (const [key, value] of Object.entries(config)) {
	config[key] = JSON.stringify(value);
}

export default defineConfig({
	prefetch: true,
	site: 'https://oldschool.gg',
	server: {
		allowedHosts: ['osgtest.magnaboy.com'],
		port: 5488,
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
		plugins: [tailwindcss(), splitVendorChunkPlugin()],
		define: {
			...config
		},
		build: {
			minify: true
		}
	},
	devToolbar: { enabled: false },
	integrations: [react()],
	output: 'static'
});
