import { discordAuth } from '@hono/oauth-providers/discord';
import { Time } from '@oldschoolgg/toolkit';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';

import { globalConfig } from '@/constants.js';
import type { AuthenticatedUser } from '@/http/api-types.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';
import { encryptToken } from '@/modules/encryption.js';

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
		const isBlacklisted: boolean =
			(await roboChimpClient.blacklistedEntity.count({
				where: {
					type: 'user',
					id: user.id
				}
			})) > 0;
		if (isBlacklisted) {
			return httpErr.FORBIDDEN({ message: 'You are blacklisted.' });
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
		return c.redirect(`${globalConfig.frontendUrl}/login-callback`);
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

	const result: AuthenticatedUser = {
		id: discordUser.id,
		username: discordUser.username,
		avatar: discordUser.avatar,
		global_name: discordUser.global_name,
		bits: user.bits
	};
	return httpRes.JSON(result);
});

oauthHonoServer.get('/logout', async c => {
	deleteCookie(c, 'token', {
		httpOnly: true,
		secure: true,
		domain: globalConfig.cookieOrigin,
		sameSite: 'lax',
		path: '/'
	});
	return c.redirect(`${globalConfig.frontendUrl}/`);
});
