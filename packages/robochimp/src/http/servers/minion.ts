import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';
import type { ItemBank } from 'oldschooljs';

import type { FullMinionData } from '@/http/api-types.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const minionServer = new Hono<HonoServerGeneric>();

minionServer.get('/:bot/me', async c => {
	const params = c.req.param();
	const user = c.get('user');
	if (!user) {
		return httpErr.UNAUTHORIZED();
	}
	const bot = params.bot === 'bso' ? 'bso' : 'osb';
	const opt = { where: { id: user.id.toString() } } as const;
	const botUser = await (bot === 'osb' ? osbClient.user.findFirst(opt) : bsoClient.user.findFirst(opt));
	if (!botUser) {
		return httpErr.NOT_FOUND({ message: 'Bot user not found' });
	}
	const response: FullMinionData = {
		is_ironman: botUser?.minion_ironman,
		gp: Number(botUser?.GP),
		qp: botUser?.QP,
		collection_log_bank: botUser?.collectionLogBank as ItemBank,
		bitfield: botUser?.bitfield,
		osb_total_level: user.osbTotalLevel,
		bso_total_level: user.bsoTotalLevel,
		osb_cl_percent: user.osbClPercent,
		bso_cl_percent: user.bsoClPercent,
		osb_mastery: user.osbMastery,
		bso_mastery: user.bsoMastery
	};
	return httpRes.JSON(response);
});

minionServer.get('/:bot/:userID', async c => {
	const params = c.req.param();
	const queryBot = c.req.query('bot');
	const userID = params.userID;

	if (!userID || typeof userID !== 'string') {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID' });
	}

	if (!isValidDiscordSnowflake(userID)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID, not a valid snowflake' });
	}

	const _osb = queryBot !== 'bso';
	const args = {
		where: { id: userID },
		select: { id: true, completed_ca_task_ids: true, minion_ironman: true }
	} as const;

	const roboChimpUser = await roboChimpClient.user.findFirst({
		where: { id: BigInt(userID) }
	});

	const user = await (_osb ? osbClient.user.findFirst(args) : bsoClient.user.findFirst(args));
	if (!user || !roboChimpUser) return httpErr.NOT_FOUND({ message: 'User not found' });

	return httpRes.JSON({
		id: user.id,
		completed_ca_task_ids: user.completed_ca_task_ids,
		is_ironman: user.minion_ironman,
		leagues_completed_tasks_ids: roboChimpUser.leagues_completed_tasks_ids
	});
});
