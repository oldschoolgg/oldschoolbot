import {
	type ISimpleMinionInfo,
	type IUserMinionConfigPatchPayload,
	ZUserMinionConfigPatchRequest,
	ZUserMinionGetRequest,
	ZUserMinionsGetRequest
} from '@oldschoolgg/schemas';
import { Hono } from 'hono';

import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';
import { fetchFullMinionData } from '@/lib/fullMinionData.js';

const configToPrismaFieldMap: Record<keyof IUserMinionConfigPatchPayload, string> = {
	bank_sort_method: 'bank_sort_method',
	bank_sort_weightings: 'bank_sort_weightings',
	favorite_items: 'favoriteItems',
	favorite_alchables: 'favorite_alchables',
	favorite_foods: 'favorite_food',
	favorite_bh_seeds: 'favorite_bh_seeds',
	auto_farm_filter: 'auto_farm_filter',
	default_compost: 'minion_defaultCompostToUse',
	attack_style: 'attack_style',
	combat_options: 'combat_options'
} as const;

export const userServer = new Hono<HonoServerGeneric>();

type Account = {
	user_id: string;
	minions: ISimpleMinionInfo[];
};

type UsersMinionsResponse = {
	users: Account[];
};

userServer.get('/:userId/minions', async c => {
	const requestingUser = c.get('user');
	if (!requestingUser) {
		return httpErr.UNAUTHORIZED();
	}

	const data = ZUserMinionsGetRequest.safeParse({
		targetUserId: c.req.param('userId')
	});
	if (!data.success) {
		return httpErr.BAD_REQUEST({
			message: `Invalid request data`
		});
	}
	const { targetUserId } = data.data;

	if (requestingUser.id.toString() !== targetUserId && !requestingUser.isMod()) {
		return httpErr.FORBIDDEN({ message: 'You are not authorized to access to this minion data' });
	}

	const targetUser = await c.get('client').fetchRUser(BigInt(targetUserId));
	const allUsers = await targetUser.fetchGroup();

	const users: Account[] = [];

	for (const groupUser of allUsers) {
		const userId = groupUser.id.toString();
		const minions: ISimpleMinionInfo[] = [];

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

	const parseResult = ZUserMinionGetRequest.safeParse({
		bot: c.req.param('bot'),
		targetUserId: c.req.param('userId')
	});
	if (!parseResult.success) {
		return httpErr.BAD_REQUEST({
			message: `Invalid request data`
		});
	}
	const { bot, targetUserId } = parseResult.data;

	const requestingUserGroup: string[] = await requestingUser.findGroup();

	if (
		requestingUser.id.toString() !== targetUserId &&
		!requestingUserGroup.includes(targetUserId) &&
		!requestingUser.isMod()
	) {
		return httpErr.FORBIDDEN({ message: 'You are not authorized to access to this minion data' });
	}

	const response = await fetchFullMinionData(bot, targetUserId);
	if (!response) {
		return httpErr.NOT_FOUND({ message: 'Minion data not found for the specified user and bot' });
	}

	return httpRes.JSON(response);
});

userServer.patch('/:userId/:bot/minion', async c => {
	const requestingUser = c.get('user');
	if (!requestingUser) {
		return httpErr.UNAUTHORIZED();
	}

	const parseResult = ZUserMinionConfigPatchRequest.safeParse({
		body: await c.req.json().catch(() => null),
		bot: c.req.param('bot'),
		targetUserId: c.req.param('userId')
	});

	if (!parseResult.success) {
		return httpErr.BAD_REQUEST({
			message: `Invalid request data`
		});
	}

	const { bot, targetUserId, body } = parseResult.data;

	if (requestingUser.id.toString() !== targetUserId) {
		return httpErr.FORBIDDEN({ message: 'You can only edit your own configuration' });
	}

	if (Object.keys(body).length === 0) {
		return httpErr.BAD_REQUEST({ message: 'No configuration fields provided to update' });
	}

	const prismaUpdate: Record<string, any> = {};
	for (const [configKey, prismaKey] of Object.entries(configToPrismaFieldMap)) {
		const value = body[configKey as keyof IUserMinionConfigPatchPayload];
		if (value !== undefined) {
			prismaUpdate[prismaKey] = value;
		}
	}

	const uArgs = {
		where: { id: targetUserId },
		data: prismaUpdate,
		select: {
			id: true,
			bank_sort_method: true,
			bank_sort_weightings: true,
			favoriteItems: true,
			favorite_alchables: true,
			favorite_food: true,
			favorite_bh_seeds: true,
			auto_farm_filter: true,
			minion_defaultCompostToUse: true,
			attack_style: true,
			combat_options: true
		}
	} as const;
	const updatedUser = await (bot === 'osb' ? osbClient.user.update(uArgs) : bsoClient.user.update(uArgs));

	return httpRes.JSON({
		success: true,
		updated_fields: Object.keys(body),
		config: {
			bank_sort_method: updatedUser.bank_sort_method,
			bank_sort_weightings: updatedUser.bank_sort_weightings as Record<string, number>,
			favorite_items: updatedUser.favoriteItems,
			favorite_alchables: updatedUser.favorite_alchables,
			favorite_foods: updatedUser.favorite_food,
			favorite_bh_seeds: updatedUser.favorite_bh_seeds,
			auto_farm_filter: updatedUser.auto_farm_filter,
			default_compost: updatedUser.minion_defaultCompostToUse,
			attack_style: updatedUser.attack_style,
			combat_options: updatedUser.combat_options
		}
	});
});
