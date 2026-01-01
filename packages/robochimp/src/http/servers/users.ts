import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';
import type { ItemBank } from 'oldschooljs';

import type { FullMinionData } from '@/http/api-types.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const userServer = new Hono<HonoServerGeneric>();

type SimpleMinionInfo = {
	is_ironman: boolean;
	has_minion: boolean;
	bot: 'osb' | 'bso';
	total_level: number;
};

type Account = {
	user_id: string;
	minions: SimpleMinionInfo[];
};

type UsersMinionsResponse = {
	users: Account[];
};

userServer.get('/:userId/minions', async c => {
	const requestingUser = c.get('user');
	if (!requestingUser) {
		return httpErr.UNAUTHORIZED();
	}

	const targetUserId = c.req.param('userId');
	if (!targetUserId || !isValidDiscordSnowflake(targetUserId)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID' });
	}
	if (requestingUser.id.toString() !== targetUserId && !requestingUser.isMod()) {
		return httpErr.FORBIDDEN({ message: 'You are not authorized to access to this minion data' });
	}

	const targetUser = await c.get('client').fetchRUser(BigInt(targetUserId));
	const allUsers = await targetUser.fetchGroup();

	const users: Account[] = [];

	for (const groupUser of allUsers) {
		const userId = groupUser.id.toString();
		const minions: SimpleMinionInfo[] = [];

		const osbUser = await osbClient.user.findFirst({
			where: { id: groupUser.id.toString() },
			select: { id: true, minion_ironman: true, minion_hasBought: true }
		});

		const bsoUser = await bsoClient.user.findFirst({
			where: { id: groupUser.id.toString() },
			select: { id: true, minion_ironman: true, minion_hasBought: true }
		});

		if (osbUser?.minion_hasBought) {
			minions.push({
				bot: 'osb',
				has_minion: true,
				is_ironman: osbUser.minion_ironman,
				total_level: groupUser.osb_total_level!
			});
		}

		if (bsoUser?.minion_hasBought) {
			minions.push({
				bot: 'bso',
				has_minion: true,
				is_ironman: bsoUser.minion_ironman,
				total_level: groupUser.bso_total_level!
			});
		}
		users.push({ user_id: userId, minions });
	}

	return httpRes.JSON<UsersMinionsResponse>({ users });
});

userServer.get('/:userId/:bot/minion', async c => {
	const requestingUser = c.get('user');
	if (!requestingUser) {
		return httpErr.UNAUTHORIZED();
	}

	const targetUserId = c.req.param('userId');
	if (!targetUserId || !isValidDiscordSnowflake(targetUserId)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID' });
	}

	const requestingUserGroup: string[] = await requestingUser.findGroup();

	if (
		requestingUser.id.toString() !== targetUserId &&
		!requestingUserGroup.includes(targetUserId) &&
		!requestingUser.isMod()
	) {
		return httpErr.FORBIDDEN({ message: 'You are not authorized to access to this minion data' });
	}

	const params = c.req.param();
	const bot = params.bot === 'bso' ? 'bso' : 'osb';

	const opt = { where: { id: targetUserId } } as const;
	const botUser = await (bot === 'osb' ? osbClient.user.findFirst(opt) : bsoClient.user.findFirst(opt));
	if (!botUser) {
		return httpErr.NOT_FOUND({ message: 'Bot user not found' });
	}

	const response: FullMinionData = {
		is_ironman: botUser.minion_ironman,
		gp: Number(botUser.GP),
		qp: botUser.QP,
		collection_log_bank: botUser.collectionLogBank as ItemBank,
		bitfield: botUser.bitfield
	};
	return httpRes.JSON(response);
});
