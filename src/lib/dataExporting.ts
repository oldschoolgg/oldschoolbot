import { PerkTier } from './constants';
import { BlowpipeData } from './minions/types';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';

export async function minionExport(user: MUser) {
	const gear: any = {};
	for (const [key, val] of Object.entries(user.gear)) {
		gear[key] = val.raw();
	}

	const data: Record<string, string | number | boolean | ItemBank | null | (string | number)[] | BlowpipeData> = {};

	data.id = user.id;
	data.cl = user.cl.bank;
	data.bank = user.bank.bank;
	data.gp = user.GP;
	data.equipped_pet = user.user.minion_equippedPet;
	data.combat_level = user.combatLevel;
	data.gear = gear;
	data.skills_xp = user.skillsAsXP;
	data.skills_levels = user.skillsAsLevels;
	data.is_ironman = user.isIronman;
	data.qp = user.QP;
	data.bought_date = user.user.minion_bought_date?.toString() ?? null;
	data.name = user.user.minion_name;
	data.blowpipe = user.blowpipe;
	data.ironman_alts = user.user.ironman_alts;
	data.main_account = user.user.main_account;
	data.slayer_unlocks = user.user.slayer_unlocks;
	data.slayer_blocked_tasks = user.user.slayer_blocked_ids;
	data.badges = user.user.badges;
	data.bitfield = user.user.bitfield;

	const stats = await prisma.userStats.findFirst({ where: { user_id: BigInt(user.id) } });
	if (stats && user.perkTier() >= PerkTier.Four) {
		for (const [key, val] of Object.entries(stats)) {
			if (['user_id', 'cl_array'].includes(key)) continue;
			data[key] = val as any;
		}
	}

	return data;
}

export async function tradeExports(user: MUser) {
	const allTrades = await prisma.economyTransaction.findMany({
		where: {
			OR: [
				{
					sender: BigInt(user.id)
				},
				{
					recipient: BigInt(user.id)
				}
			],
			type: 'trade'
		},
		orderBy: {
			date: 'desc'
		},
		select: {
			date: true,
			sender: true,
			recipient: true,
			items_received: true,
			items_sent: true
		}
	});

	return allTrades;
}
