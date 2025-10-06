import { constants } from 'node:http2';
import cors from '@fastify/cors';
import { isValidDiscordSnowflake } from '@oldschoolgg/toolkit';
import fastify from 'fastify';

import { globalConfig } from '../constants.js';
import { type GithubSponsorsWebhookData, verifyGithubSecret } from '../lib/githubSponsor.js';
import { parseStrToTier, patreonTask, verifyPatreonSecret } from '../lib/patreon.js';
import { patronLogWebhook } from '../util.js';

export async function startServer() {
	const server = fastify({
		trustProxy: true,
		disableRequestLogging: true
	});
	await server.register(import('fastify-raw-body'), {
		field: 'rawBody',
		global: true,
		encoding: 'utf8'
	});

	await server.register(cors, {
		origin: '*'
	});

	server.route({
		method: 'POST',
		url: '/debug',
		async handler(request, reply) {
			console.log(request.rawBody);
			return reply.send(constants.HTTP_STATUS_OK).send('OK');
		}
	});

	server.route({
		method: 'POST',
		url: '/webhooks/patreon',
		async handler(request, reply) {
			if (!request.rawBody || typeof request.rawBody !== 'string') {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send('Missing body');
			}
			if (!request.headers['x-patreon-signature']) {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send('Missing header');
			}
			const isVerified = verifyPatreonSecret(request.rawBody, request.headers['x-patreon-signature']);
			if (!isVerified) {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send('Unverified');
			}
			patreonTask.run().then(res => {
				if (res) {
					patronLogWebhook.send(res.join('\n').slice(0, 1950));
				}
			});
			return reply.send(constants.HTTP_STATUS_OK).send('OK');
		}
	});

	server.route({
		method: 'POST',
		url: '/webhooks/github',
		async handler(request, reply) {
			const isVerified = verifyGithubSecret(JSON.stringify(request.body), request.headers['x-hub-signature']);
			if (!isVerified) {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send();
			}
			const data = request.body as GithubSponsorsWebhookData;
			const user = await roboChimpClient.user.findFirst({
				where: {
					github_id: Number(data.sender.id)
				}
			});
			switch (data.action) {
				case 'created': {
					const tier = parseStrToTier(data.sponsorship.tier.name);
					if (!tier) return;
					if (user) {
						await patreonTask.changeTier(user, tier);
					}
					break;
				}
				case 'tier_changed':
				case 'pending_tier_change': {
					const to = parseStrToTier(data.sponsorship.tier.name);
					if (!to) return;
					if (user) {
						await patreonTask.changeTier(user, to);
					}
					break;
				}
				case 'cancelled': {
					const tier = parseStrToTier(data.sponsorship.tier.name);
					if (!tier) return;
					if (user) {
						await patreonTask.removePerks(user, 'Cancelled');
					}
					break;
				}
			}
			return reply.code(constants.HTTP_STATUS_OK).send('OK');
		},
		config: {}
	});

	server.route({
		method: 'GET',
		url: '/minion/:userID',
		async handler(request, reply) {
			const query = (request.query as any) ?? {};
			let userID = (request.params as any)?.userID;

			if (!userID || typeof userID !== 'string') {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send('Invalid user ID 1');
			}

			if (!isValidDiscordSnowflake(userID)) {
				const djsUser = globalClient.users.cache.find(u => u.username === userID);
				if (djsUser) {
					userID = djsUser.id;
				} else {
					return reply.code(constants.HTTP_STATUS_NOT_FOUND).send('Could not find this users id');
				}
			}

			if (!userID || !isValidDiscordSnowflake(userID)) {
				return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send('Invalid user ID 3');
			}

			const _osb = query.bot !== 'bso';
			const args = {
				where: {
					id: userID
				},
				select: {
					id: true,
					completed_ca_task_ids: true,
					minion_ironman: true
				}
			} as const;

			const roboChimpUser = await roboChimpClient.user.findFirst({
				where: {
					id: BigInt(userID)
				}
			});
			const user = await (_osb ? osbClient.user.findFirst(args) : bsoClient.user.findFirst(args));
			if (!user || !roboChimpUser) {
				return reply.code(constants.HTTP_STATUS_NOT_FOUND).send('User not found');
			}

			return reply.send({
				id: user.id,
				completed_ca_task_ids: user.completed_ca_task_ids,
				is_ironman: user.minion_ironman,
				leagues_completed_tasks_ids: roboChimpUser.leagues_completed_tasks_ids
			});
		},
		config: {}
	});

	await server.listen({ port: globalConfig.httpPort });
	await server.ready();
	return server;
}
