import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';

import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const minionServer = new Hono<HonoServerGeneric>();

minionServer.get('/:userID', async c => {
	const params = c.req.param();
	const queryBot = c.req.query('bot');
	const userID = params.userID;

	if (!userID || typeof userID !== 'string') {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID' });
	}

	// TODO: support for tags/username
	// if (!isValidDiscordSnowflake(userID)) {
	// 	const djsUser = globalClient.users.cache.find((u: any) => u.username === userID);
	// 	if (djsUser) userID = djsUser.id;
	// 	else return httpErr.NOT_FOUND({ message: 'Could not find this users id' });
	// }

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
