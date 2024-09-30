// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkItems } from './src/plugins/items';

// https://astro.build/config
export default defineConfig({
	markdown: {
    remarkPlugins: [remarkItems],
  },
	integrations: [
		starlight({
			title: 'Oldschool.gg Wiki',
			 favicon: 'favicon.ico',
			social: {
				github: 'https://github.com/oldschoolgg/oldschoolbot',
				discord: "https://discord.gg/ob",
			},
			customCss: [
				"./src/styles/main.css",
				  './src/fonts/font-face.css',
			],
			pagination: false,
			head: [  {
      tag: 'script',
	  content: `if (window.location.href.includes('/bso/')) {
  window.onload = () => document.body.classList.add('bso-theme');
}`
    }],
			sidebar: [
				{
					label: 'Getting Started',
					autogenerate: { directory: 'getting-started' },
					collapsed: false,
				},{
					label: 'OSB',
					autogenerate: { directory: 'osb' },
					collapsed: true,
				},
				{
					label: 'BSO',
					autogenerate: { directory: 'bso' },
					collapsed: true,
				},
			],
			
		}),
	],
});
