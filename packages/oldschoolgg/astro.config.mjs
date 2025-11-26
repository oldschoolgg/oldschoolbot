// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import path from 'node:path';

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
		plugins: [tailwindcss()],
		// define: {
		// 	__API_URL__: JSON.stringify(config.apiUrl),
		// 	__FRONTEND_URL__: JSON.stringify(config.frontendUrl),
		// 	__WS_URL__: JSON.stringify(config.wsUrl),
		// 	__DISCORD_CLIENT_ID__: JSON.stringify(config.discordClientID),
		// 	__BOT_INVITE_URL__: JSON.stringify(config.botInviteURL),
		// 	__IS_PRODUCTION__: JSON.stringify(config.isProduction)
		// }
	},
	devToolbar: { enabled: false },
	integrations: [react()]
});
