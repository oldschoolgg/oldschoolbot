import preact from '@astrojs/preact';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import type { Plugin } from 'vite';

import remarkItems from './src/plugins/items.js';
import rehypeFixInlineSpacing from './src/plugins/rehypeFixInlineSpacing.js';

function splitVendorChunkPlugin() {
	const plugin: Plugin = {
		name: 'split-vendor-chunk-plugin',
		config() {
			return {
				build: {
					rollupOptions: {
						output: {
							manualChunks(id) {
								for (const osmod of [
									'item_data',
									'EItem',
									'monster',
									'openables',
									'misc',
									'util',
									'EGear'
								]) {
									if (id.includes('oldschooljs') && id.includes(osmod)) {
										return `oldschooljs_${osmod}`;
									}
								}
								if (id.includes('oldschooljs')) {
									return 'oldschooljs';
								}
								if (id.includes('remeda')) {
									return 'remeda';
								}
								if (id.includes('data/bso')) {
									return `${id.split('data/bso/')[1].split('/')[0].split('.')[0]}-data`;
								}
								if (id.includes('data/osb')) {
									return `${id.split('data/osb/')[1].split('/')[0].split('.')[0]}-data`;
								}
								if (id.includes('item_data.json')) {
									return 'osb-item-data';
								}
								if (id.includes('bso/custom-items.json')) {
									return 'bso-item-data';
								}
								return null;
							}
						}
					}
				}
			};
		}
	};

	return plugin;
}

export default defineConfig({
	vite: {
		resolve: {
			alias: {
				'@data': '../../../data'
			}
		},
		plugins: [tailwindcss(), splitVendorChunkPlugin()],
		ssr: {
			noExternal: ['zod']
		},
		build: {
			minify: true,
			cssCodeSplit: true,
			cssMinify: true
		}
	},
	i18n: {
		locales: ['en'],
		defaultLocale: 'en'
	},
	devToolbar: {
		enabled: false
	},
	markdown: {
		remarkPlugins: [remarkItems as any],
		rehypePlugins: [rehypeFixInlineSpacing],
		smartypants: false,
		syntaxHighlight: false
	},
	site: 'https://wiki.oldschool.gg',
	integrations: [
		starlight({
			plugins: [
				starlightLinksValidator({
					errorOnInvalidHashes: false,
					errorOnLocalLinks: false,
					errorOnRelativeLinks: false,
					errorOnFallbackPages: false
				})
			],
			components: {
				Footer: './src/components/Footer.astro',
				Header: './src/components/Header.astro'
			},
			title: 'Oldschool.gg Wiki',
			favicon: 'favicon.ico',
			social: [
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/ob' },
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/oldschoolgg/oldschoolbot' }
			],
			customCss: ['./src/styles/main.css', './src/fonts/font-face.css'],
			pagination: false,
			head: [
				{
					tag: 'script',
					content: `if (window.location.href.includes('/bso/')) {
window.onload = () => document.body.classList.add('bso-theme');
}`
				},
				{
					tag: 'script',
					attrs: { src: '/scripts/copyCommand.js', defer: true }
				}
			],
			editLink: {
				baseUrl: 'https://github.com/oldschoolgg/oldschoolbot/edit/master/docs/'
			},
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'getting-started' },
					collapsed: false
				},
				{
					label: 'Old School Bot (OSB)',
					autogenerate: { directory: 'osb', collapsed: true },
					collapsed: false
				},
				{
					label: 'BSO',
					autogenerate: { directory: 'bso', collapsed: true },
					collapsed: false
				}
			]
		}),
		preact({ compat: true })
	]
});
