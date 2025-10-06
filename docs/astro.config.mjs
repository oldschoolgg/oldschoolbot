import preact from '@astrojs/preact';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import { remarkItems } from './src/plugins/items';
import rehypeFixInlineSpacing from './src/plugins/rehypeFixInlineSpacing';

// https://astro.build/config
export default defineConfig({
	vite: {
		resolve: {
			alias: {
				'@data': '../../../data'
			}
		},
		plugins: []
	},
	devToolbar: {
		enabled: false
	},
	experimental: {
		clientPrerender: true
	},
	markdown: {
		remarkPlugins: [remarkItems],
		rehypePlugins: [rehypeFixInlineSpacing],
		smartypants: false,
		syntaxHighlight: false
	},
	site: 'https://wiki.oldschool.gg',
	integrations: [
		starlight({
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
