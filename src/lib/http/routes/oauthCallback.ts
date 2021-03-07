import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { encode } from 'querystring';

import { client } from '../../..';
import { CLIENT_ID, CLIENT_SECRET } from '../../../config';
import { UserSettings } from '../../settings/types/UserSettings';
import { encryptJWT, rateLimit } from '../util';

export async function fetchUser(token: string) {
	const apiToken = `Bearer ${token}`;
	const apiUser = await fetch('https://discordapp.com/api/users/@me', {
		headers: { Authorization: apiToken }
	}).then((result: any) => result.json());
	const user = await client.users.fetch(apiUser.id);

	return {
		...apiUser,
		bitfield: user.settings.get(UserSettings.BitField),
		badges: user.settings.get(UserSettings.Badges)
	};
}

const OAuthCallBackBodySchema = Type.Object(
	{
		redirect_uri: Type.String({ minLength: 1 }),
		code: Type.String({ minLength: 1 })
	},
	{ additionalProperties: false }
);

const oauthCallbackRoute = (server: FastifyInstance) =>
	server.route<{ Body: Static<typeof OAuthCallBackBodySchema> }>({
		method: 'POST',
		url: '/oauth/callback',
		schema: {
			body: OAuthCallBackBodySchema
		},
		async handler(request, reply) {
			const authFetch = await fetch('https://discord.com/api/oauth2/token', {
				headers: {
					Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
						'base64'
					)}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: encode({
					grant_type: 'authorization_code',
					scope: 'identify',
					redirect_uri: request.body.redirect_uri,
					code: request.body.code
				}),
				method: 'POST'
			});

			if (!authFetch.ok) {
				return reply.badRequest();
			}

			const body = await authFetch.json();
			const user = await fetchUser(body.access_token);

			return reply.send({
				access_token: encryptJWT(
					{
						token: body.access_token,
						user_id: user.id
					},
					CLIENT_SECRET
				),
				user
			});
		},
		config: {
			...rateLimit(2, '30 seconds')
		}
	});

export default oauthCallbackRoute;
