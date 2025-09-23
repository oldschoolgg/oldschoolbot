import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { createNodeWebSocket } from '@hono/node-ws';
import {
	type ITestBotAuthenticationResponse,
	type ITestBotPrivateUserUpdate,
	type ITestBotWebsocketEvent,
	ZTestBotWebsocketEvent
} from '@oldschoolgg/toolkit/test-bot-websocket';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import type { WSContext } from 'hono/ws';
import { Bank, Items } from 'oldschooljs';
import type { WebSocket } from 'ws';

import '@/lib/safeglobals';

import { BOT_TYPE, globalConfig, META_CONSTANTS } from '@/lib/constants';
import killableMonsters from '@/lib/minions/data/killableMonsters';
import { minionStatusRaw } from './minionStatusRaw.js';
import { testBotKvStore } from './TestBotStore.js';

type HonoServerGeneric = { Bindings: {}; Variables: {} };

const honoApp = new Hono<HonoServerGeneric>();

honoApp.use(compress());

honoApp.use('*', async (c, next) => {
	const ip = c.req.header('Cf-Connecting-Ip') ?? getConnInfo(c)?.remote?.address ?? c.req.header('User-Agent')!;
	console.log(`[${c.req.method}] [${c.req.header('Origin')}] ${c.req.path} [${ip}]`);
	await next();
});

honoApp.get('/monsters', () => {
	const monsters = killableMonsters.sort((a, b) => a.timeToFinish - b.timeToFinish);
	return Response.json({
		killable_monsters: monsters.map(monster => ({
			id: monster.id,
			name: monster.name,
			base_kill_time_ms: monster.timeToFinish,
			respawn_time_ms: monster.respawnTime,

			is_wildy: monster.wildy ?? false,
			is_slayer_only: monster.slayerOnly ?? false,
			can_be_pked: monster.canBePked ?? false,
			is_wildy_multi: monster.wildyMulti ?? false,
			pk_base_death_chance: monster.pkBaseDeathChance,
			items_required:
				monster.itemsRequired?.map(i =>
					typeof i === 'number' ? Items.itemNameFromId(i) : i.map(i => Items.itemNameFromId(i))
				) ?? [],
			qp_required: monster.qpRequired ?? 0,
			item_in_bank_boosts: monster.itemInBankBoosts?.map(group => new Bank(group).toNamedBank()) ?? [],

			can_barrage: monster.canBarrage ?? false,
			can_chin: monster.canChinning ?? false,
			can_cannon: monster.canCannon ?? false,
			cannon_multi: monster.cannonMulti ?? false
		}))
	});
});

function tbLog(message: string) {
	console.log(`[TestBotServer] ${message}`);
}

const clients = new Map<
	string,
	{
		uuid: string;
		authenticated_discord_id: string | null;
		ws: WSContext<WebSocket>;
	}
>();

function broadcastJSON(data: ITestBotWebsocketEvent) {
	const json = JSON.stringify(data);
	for (const client of clients.values()) {
		client.ws.send(json);
	}
}

async function getUserUpdate(discordId: string) {
	const mUser = await mUserFetch(discordId);
	const djsUser = await globalClient.users.fetch(discordId, { cache: true });
	const recentTrips = await prisma.activity.findMany({
		where: {
			user_id: BigInt(discordId)
		},
		orderBy: {
			start_date: 'desc'
		},
		take: 5
	});

	const minigameScores = await mUser.fetchMinigameScores();
	return {
		username: djsUser.username,
		avatar_url: djsUser.displayAvatarURL({ size: 256, forceStatic: true }),
		raw_user_data: mUser.user,
		recent_trips: recentTrips
			.map(_act => ActivityManager.convertStoredActivityToFlatActivity(_act))
			.map(minionStatusRaw),
		minigame_scores: minigameScores.map(_i => ({ minigame: _i.minigame.name, score: _i.score })),
		skills_as_xp: mUser.skillsAsXP,
		skills_as_levels: mUser.skillsAsLevels
	};
}

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app: honoApp });

honoApp.get(
	'/ws',
	upgradeWebSocket(() => {
		return {
			async onOpen(_, ws) {
				console.log('WebSocket connection established');
				const uuid = crypto.randomUUID();
				clients.set(uuid, {
					uuid,
					authenticated_discord_id: null,
					ws
				});
				ws.send(JSON.stringify(await getBotDataUpdate()));
			},
			async onMessage(event, ws) {
				let parsed: any;
				try {
					parsed = JSON.parse(event.data as string);
				} catch {
					ws.send(JSON.stringify({ error: 'Invalid JSON' }));
					return;
				}
				const data = ZTestBotWebsocketEvent.parse(parsed);
				switch (data.type) {
					case 'auth_request': {
						const matchingUser = testBotKvStore
							.getAll('user.*.code')
							.find(_u => _u.value === data.data.code);
						ws.send(
							JSON.stringify({
								type: 'auth_response',
								data: { success: Boolean(matchingUser) }
							} as ITestBotAuthenticationResponse)
						);
						tbLog(`Someone is attempting to authenticate with code: ${data.data.code}`);
						if (matchingUser) {
							const userId = matchingUser.key.split('.')[1];
							const data = await getUserUpdate(userId);
							tbLog(`User ${data.username} authenticated`);
							ws.send(
								JSON.stringify({
									type: 'private_user_update',
									data: data
								} as ITestBotPrivateUserUpdate)
							);
							const client = Array.from(clients.values()).find(c => c.ws === ws);
							if (client) {
								client.authenticated_discord_id = userId;
							}
						}
					}
				}
			},
			onClose(_, ws) {
				const client = Array.from(clients.values()).find(c => c.ws === ws);
				// console.log('WebSocket connection closed:', _);
				clients.delete(client!.uuid);
			},
			onError(_, ws) {
				const client = Array.from(clients.values()).find(c => c.ws === ws);
				console.log('WebSocket error:', _);
				clients.delete(client!.uuid);
			}
		};
	})
);

async function getBotDataUpdate(): Promise<ITestBotWebsocketEvent> {
	return {
		type: 'data_update',
		data: {
			bot_type: BOT_TYPE,
			username: globalClient.user?.username,
			avatar_url: globalClient.user?.displayAvatarURL(),
			start_time: META_CONSTANTS.STARTUP_DATE.toISOString()
		}
	};
}

export async function startTestBotServer(port = 3387) {
	tbLog(`Starting test bot server on port ${port}...`);
	if (globalConfig.isProduction) {
		throw new Error('Cannot start test bot server in production mode.');
	}

	const server = serve({
		fetch: honoApp.fetch,
		port
	});
	injectWebSocket(server);
}

setInterval(async () => {
	tbLog('Broadcasting bot data...');
	broadcastJSON(await getBotDataUpdate());
	for (const { authenticated_discord_id, ws } of clients.values()) {
		if (authenticated_discord_id) {
			ws.send(
				JSON.stringify({
					type: 'private_user_update',
					data: await getUserUpdate(authenticated_discord_id)
				} as ITestBotPrivateUserUpdate)
			);
		}
	}
}, 10_000);
