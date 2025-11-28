import { discordAuth } from '@hono/oauth-providers/discord';
import { Time } from '@oldschoolgg/toolkit';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';

import { globalConfig } from '@/constants.js';
import { encryptToken } from '@/http/auth.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const oauthHonoServer = new Hono<HonoServerGeneric>();

oauthHonoServer.use(
	'/login/discord',
	discordAuth({
		client_id: globalConfig.appID,
		client_secret: process.env.DISCORD_CLIENT_SECRET,
		scope: ['identify'],
		redirect_uri: `${globalConfig.apiUrl}/oauth/login/discord`
	}),
	async c => {
		const accessToken = c.get('token');
		const refreshToken = c.get('refresh-token');
		const grantedScopes = c.get('granted-scopes');
		const discordUserData = c.get('user-discord');

		if (!accessToken || !refreshToken || !grantedScopes || !discordUserData || !discordUserData.id) {
			return c.json({ error: 'Invalid token' }, 400);
		}

		const userId = BigInt(discordUserData.id);

		await roboChimpClient.discordUser.upsert({
			where: {
				id: discordUserData.id
			},
			update: {
				username: discordUserData.username,
				avatar: discordUserData.avatar,
				global_name: discordUserData.global_name
			},
			create: {
				id: discordUserData.id,
				username: discordUserData.username,
				avatar: discordUserData.avatar,
				global_name: discordUserData.global_name,
				created_at: new Date(DiscordSnowflake.timestampFrom(discordUserData.id))
			}
		});
		const user = await roboChimpClient.user.findFirst({
			where: {
				id: userId
			}
		});
		if (!user) {
			return c.json({ error: 'User not found' }, 400);
		}

		const secret = JSON.stringify({
			access_token: accessToken,
			refresh_token: refreshToken,
			granted_scopes: grantedScopes
		});
		await roboChimpClient.userSecrets.upsert({
			where: {
				user_id_type: {
					type: 'DISCORD_OAUTH',
					user_id: user.id
				}
			},
			update: {
				secret
			},
			create: {
				secret,
				type: 'DISCORD_OAUTH',
				user_id: user.id
			}
		});

		const token = await encryptToken({ user_id: user.id.toString() });
		setCookie(c, 'token', token, {
			expires: new Date(Date.now() + Time.Day * 30),
			httpOnly: true,
			secure: true,
			domain: globalConfig.cookieOrigin,
			sameSite: 'lax',
			path: '/'
		});
		return c.redirect(`${globalConfig.frontendUrl}/login_callback`);
	}
);

oauthHonoServer.get('/me', async c => {
	const user = c.get('user');
	if (!user) {
		return httpErr.UNAUTHORIZED();
	}

	const discordUser = await roboChimpClient.discordUser.findUnique({
		where: {
			id: user.id.toString()
		}
	});

	if (!discordUser) {
		return httpErr.NOT_FOUND({ message: 'Discord user not found' });
	}

	return httpRes.JSON({
		id: discordUser.id,
		username: discordUser.username,
		avatar: discordUser.avatar,
		global_name: discordUser.global_name,
		bits: user.bits
	});
});
