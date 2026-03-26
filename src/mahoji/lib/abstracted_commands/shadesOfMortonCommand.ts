import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, LootTable, resolveItems } from 'oldschooljs';

import type {
	ShadesOfMortonOptions,
	ShadesOfMortonPyreLogsOptions,
	ShadesOfMortonSacredOilOptions
} from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

type Remains = 'Loar' | 'Phrin' | 'Riyl' | 'Fiyr' | 'Asyn' | 'Urium';

interface ShadesLog {
	oiledLog: Item;
	normalLog: Item;
	fmLevel: number;
	fmXP: number;
	sacOilDoses: number;
	remains: Remains[];
	prayerXP: Partial<Record<Remains, number>>;
}

interface Shade {
	shadeName: Remains;
	gpRange: [number, number];
	lowMetalKeys?: {
		fraction: number;
		items: number[];
	};
	highMetalKeys?: {
		fraction: number;
		items: number[];
	};
	item: Item;
}

export const shades: Shade[] = [
	{
		shadeName: 'Loar',
		gpRange: [400, 500],
		highMetalKeys: {
			fraction: 0.79,
			items: resolveItems(['Bronze key red', 'Bronze key brown', 'Bronze key crimson'])
		},
		item: Items.getOrThrow('Loar remains')
	},
	{
		shadeName: 'Phrin',
		gpRange: [600, 700],
		lowMetalKeys: {
			fraction: 0.125,
			items: resolveItems(['Bronze key black', 'Bronze key purple'])
		},
		highMetalKeys: {
			fraction: 0.665,
			items: resolveItems(['Steel key red', 'Steel key brown', 'Steel key crimson'])
		},
		item: Items.getOrThrow('Phrin remains')
	},
	{
		shadeName: 'Riyl',
		gpRange: [700, 800],
		lowMetalKeys: {
			fraction: 0.125,
			items: resolveItems(['Steel key black', 'Steel key purple'])
		},
		highMetalKeys: {
			fraction: 0.665,
			items: resolveItems(['Black key red', 'Black key brown', 'Black key crimson'])
		},
		item: Items.getOrThrow('Riyl remains')
	},
	{
		shadeName: 'Asyn',
		gpRange: [800, 900],
		lowMetalKeys: {
			fraction: 0.282,
			items: resolveItems(['Black key crimson', 'Black key black', 'Black key purple'])
		},
		highMetalKeys: {
			fraction: 0.508,
			items: resolveItems(['Silver key red', 'Silver key brown'])
		},
		item: Items.getOrThrow('Asyn remains')
	},
	{
		shadeName: 'Fiyr',
		gpRange: [1500, 5000],
		lowMetalKeys: {
			fraction: 0.634,
			items: resolveItems(['Silver key brown', 'Silver key crimson', 'Silver key black', 'Silver key purple'])
		},
		highMetalKeys: {
			fraction: 0.156,
			items: resolveItems(['Gold key red'])
		},
		item: Items.getOrThrow('Fiyr remains')
	},
	{
		shadeName: 'Urium',
		gpRange: [2000, 7000],
		lowMetalKeys: {
			fraction: 0.79,
			items: resolveItems([
				'Gold key red',
				'Gold key brown',
				'Gold key crimson',
				'Gold key black',
				'Gold key purple'
			])
		},
		item: Items.getOrThrow('Urium remains')
	}
];

export const shadesLogs: ShadesLog[] = [
	{
		oiledLog: Items.getOrThrow('Pyre logs'),
		normalLog: Items.getOrThrow('Logs'),
		fmLevel: 5,
		fmXP: 50,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin'],
		prayerXP: {
			Loar: 25,
			Phrin: 37.5
		}
	},
	{
		oiledLog: Items.getOrThrow('Oak pyre logs'),
		normalLog: Items.getOrThrow('Oak logs'),
		fmLevel: 20,
		fmXP: 70,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin'],
		prayerXP: {
			Loar: 33,
			Phrin: 45.5
		}
	},
	{
		oiledLog: Items.getOrThrow('Willow pyre logs'),
		normalLog: Items.getOrThrow('Willow logs'),
		fmLevel: 35,
		fmXP: 100,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl'],
		prayerXP: {
			Loar: 33.5,
			Phrin: 46,
			Riyl: 61
		}
	},
	{
		oiledLog: Items.getOrThrow('Teak pyre logs'),
		normalLog: Items.getOrThrow('Teak logs'),
		fmLevel: 40,
		fmXP: 120,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl'],
		prayerXP: {
			Loar: 33.7,
			Phrin: 46.2,
			Riyl: 61.2
		}
	},
	{
		oiledLog: Items.getOrThrow('Arctic pyre logs'),
		normalLog: Items.getOrThrow('Arctic pine logs'),
		fmLevel: 47,
		fmXP: 158,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin', 'Riyl'],
		prayerXP: {
			Loar: 33.9,
			Phrin: 46.4,
			Riyl: 61.4
		}
	},
	{
		oiledLog: Items.getOrThrow('Maple pyre logs'),
		normalLog: Items.getOrThrow('Maple logs'),
		fmLevel: 50,
		fmXP: 175,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl'],
		prayerXP: {
			Loar: 34,
			Phrin: 46.5,
			Riyl: 61.5
		}
	},
	{
		oiledLog: Items.getOrThrow('Mahogany pyre logs'),
		normalLog: Items.getOrThrow('Mahogany logs'),
		fmLevel: 55,
		fmXP: 210,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl'],
		prayerXP: {
			Loar: 34.3,
			Phrin: 46.8,
			Riyl: 61.8
		}
	},
	{
		oiledLog: Items.getOrThrow('Yew pyre logs'),
		normalLog: Items.getOrThrow('Yew logs'),
		fmLevel: 65,
		fmXP: 255,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn'],
		prayerXP: {
			Loar: 34.5,
			Phrin: 47,
			Riyl: 62,
			Asyn: 79.5
		}
	},
	{
		oiledLog: Items.getOrThrow('Magic pyre logs'),
		normalLog: Items.getOrThrow('Magic logs'),
		fmLevel: 80,
		fmXP: 404.5,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn', 'Fiyr'],
		prayerXP: {
			Loar: 35,
			Phrin: 47.5,
			Riyl: 62.5,
			Asyn: 80,
			Fiyr: 100
		}
	},
	{
		oiledLog: Items.getOrThrow('Redwood pyre logs'),
		normalLog: Items.getOrThrow('Redwood logs'),
		fmLevel: 95,
		fmXP: 500,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn', 'Fiyr', 'Urium'],
		prayerXP: {
			Loar: 35.5,
			Phrin: 48,
			Riyl: 63,
			Asyn: 80.5,
			Fiyr: 100.5,
			Urium: 120.5
		}
	}
];

const coffins = ['Bronze coffin', 'Steel coffin', 'Black coffin', 'Silver coffin', 'Gold coffin'];

const CREMATIONS_PER_HOUR = 450;
const TIME_PER_CREMATION = Time.Hour / CREMATIONS_PER_HOUR;

export const pyreLogRecipes = shadesLogs.map(entry => ({
	log: entry.normalLog,
	pyreLogs: entry.oiledLog
}));

const SACRED_OIL_PER_HOUR = 400;
const TIME_PER_SACRED_OIL = Time.Hour / SACRED_OIL_PER_HOUR;

const PYRE_LOGS_PER_HOUR = 1400;
const TIME_PER_PYRE_LOG = Time.Hour / PYRE_LOGS_PER_HOUR;

export function buildShadeTable(shade: Shade): LootTable {
	const table = new LootTable();

	if (shade.lowMetalKeys) {
		const subTable = new LootTable();
		for (const key of shade.lowMetalKeys.items) subTable.add(key);
		table.add(subTable, 1, Math.round(shade.lowMetalKeys.fraction * 1000));
	}

	if (shade.highMetalKeys) {
		const subTable = new LootTable();
		for (const key of shade.highMetalKeys.items) subTable.add(key);
		table.add(subTable, 1, Math.round(shade.highMetalKeys.fraction * 1000));
	}

	const keyWeight = Math.round(((shade.lowMetalKeys?.fraction ?? 0) + (shade.highMetalKeys?.fraction ?? 0)) * 1000);
	table.add('Coins', 1, 1000 - keyWeight);

	return table;
}

function checkCremationRequirements(user: MUser, log: ShadesLog, shade: Shade): string | null {
	const userStats = user.skillsAsLevels;

	if (userStats.firemaking < log.fmLevel) {
		return `You need ${log.fmLevel} Firemaking to use ${log.normalLog.name}.`;
	}

	const prayerLevels: Record<Remains, number> = {
		Loar: 1,
		Phrin: 1,
		Riyl: 20,
		Asyn: 40,
		Fiyr: 60,
		Urium: 70
	};

	const requiredPrayer = prayerLevels[shade.shadeName];
	if (userStats.prayer < requiredPrayer) {
		return `You need ${requiredPrayer} Prayer to cremate ${shade.shadeName} remains.`;
	}

	return null;
}

export async function shadesOfMortonStartCommand(user: MUser, channelId: string, logStr: string, shadeStr: string) {
	const messages: string[] = [];
	let totalTime = await user.calcMaxTripLength('ShadesOfMorton');
	for (let i = coffins.length - 1; i >= 0; i--) {
		const coffin = coffins[i];
		if (user.hasEquipped(coffin)) {
			const bonusTime = i * Time.Minute;
			if (bonusTime) {
				totalTime += bonusTime;
				messages.push(`${formatDuration(bonusTime)} bonus max trip length for ${coffin}.`);
				break;
			}
		}
	}

	const logItem = Items.getItem(logStr);
	if (!logItem) return 'Invalid logs item';

	const userBank = user.bank;
	const logsOwned = userBank.amount(logItem.id);
	if (logsOwned === 0) return `You don't own any ${logItem.name}!`;

	const log = shadesLogs.find(i => i.oiledLog.id === logItem.id);
	const shade = shades.find(i => i.shadeName === shadeStr);
	if (!log || !shade) return 'Invalid item';

	const reqError = checkCremationRequirements(user, log, shade);
	if (reqError) return reqError;

	const shadesOwned = userBank.amount(shade.item.id);
	if (!shadesOwned) return `You don't own any ${shade.item.name}! Go kill some shades.`;

	const prayerXP = log.prayerXP[shade.shadeName];
	if (!prayerXP) {
		return `You can't use ${log.oiledLog.name} with ${shade.item.name}.`;
	}

	const quantity = Math.min(logsOwned, shadesOwned, Math.floor(totalTime / TIME_PER_CREMATION));
	const duration = quantity * TIME_PER_CREMATION;

	if (quantity < 1) return 'You cannot do any cremations in that time.';

	const cost = new Bank();
	cost.add(log.oiledLog.id, quantity);
	cost.add(shade.item.id, quantity);
	if (!user.owns(cost)) return `You don't own: ${cost}.`;

	await user.removeItemsFromBank(cost);
	await user.statsBankUpdate('shades_of_morton_cost_bank', cost);

	await ActivityManager.startTrip<ShadesOfMortonOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'ShadesOfMorton',
		minigameID: 'shades_of_morton',
		logID: logItem.id,
		shadeID: shade.shadeName
	});

	let str = `${
		user.minionName
	} is now off to do Shades of Mort'ton using ${cost} - the total trip will take ${await formatTripDuration(user, duration)}.`;
	if (messages.length > 0) {
		str += `\n**Messages:** ${messages.join(', ')}`;
	}
	return str;
}

export async function shadesOfMortonSacredOilCommand(user: MUser, channelId: string) {
	const oliveOilItem = Items.getOrThrow('Olive oil(4)');
	const sacredOilItem = Items.getOrThrow('Sacred oil(4)');

	const userStats = user.skillsAsLevels;
	if (userStats.firemaking < 5) {
		return "You need at least 5 Firemaking to create sacred oil at the Mort'ton temple.";
	}

	const oliveOilOwned = user.bank.amount(oliveOilItem.id);
	if (oliveOilOwned === 0) return `You don't have any ${oliveOilItem.name} to upgrade!`;

	const totalTime = await user.calcMaxTripLength('ShadesOfMortonSacredOil');
	const quantity = Math.min(oliveOilOwned, Math.floor(totalTime / TIME_PER_SACRED_OIL));
	if (quantity < 1) return 'You do not have enough time to create any sacred oil.';

	const duration = quantity * TIME_PER_SACRED_OIL;
	const cost = new Bank().add(oliveOilItem.id, quantity);

	if (!user.owns(cost)) return `You don't own: ${cost}.`;
	await user.removeItemsFromBank(cost);
	await user.statsBankUpdate('shades_of_morton_cost_bank', cost);

	await ActivityManager.startTrip<ShadesOfMortonSacredOilOptions>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'ShadesOfMortonSacredOil'
	});

	return `${user.minionName} is now off to the Mort'ton temple to upgrade ${quantity}x ${oliveOilItem.name} into ${sacredOilItem.name} - trip will take ${await formatTripDuration(user, duration)}.`;
}

export async function shadesOfMortonCreatePyreLogsCommand(
	user: MUser,
	channelId: string,
	logStr: string,
	quantity?: number
) {
	const sacredOilItem = Items.getOrThrow('Sacred oil(4)');

	const recipe = pyreLogRecipes.find(r => r.log.name.toLowerCase() === logStr.toLowerCase());
	if (!recipe) {
		const validLogs = pyreLogRecipes.map(r => r.log.name).join(', ');
		return `Invalid log type. Valid options: ${validLogs}.`;
	}

	const pyreLog = shadesLogs.find(l => l.normalLog.id === recipe.log.id);
	if (!pyreLog) return 'Could not find pyre log data.';

	const userStats = user.skillsAsLevels;
	if (userStats.firemaking < pyreLog.fmLevel) {
		return `You need ${pyreLog.fmLevel} Firemaking to create ${recipe.pyreLogs.name}.`;
	}

	const logsOwned = user.bank.amount(recipe.log.id);
	const sacredOilOwned = user.bank.amount(sacredOilItem.id);

	if (logsOwned === 0) return `You don't have any ${recipe.log.name}!`;
	if (sacredOilOwned === 0) return `You don't have any ${sacredOilItem.name}!`;

	const totalTime = await user.calcMaxTripLength('ShadesOfMortonPyreLogs');
	const maxQuantity = Math.min(logsOwned, sacredOilOwned, Math.floor(totalTime / TIME_PER_PYRE_LOG));
	const finalQuantity = quantity ? Math.min(quantity, maxQuantity) : maxQuantity;
	if (finalQuantity < 1) return 'You do not have enough time or supplies to make any pyre logs.';

	const duration = finalQuantity * TIME_PER_PYRE_LOG;
	const cost = new Bank().add(recipe.log.id, finalQuantity).add(sacredOilItem.id, finalQuantity);

	if (!user.owns(cost)) return `You don't own: ${cost}.`;
	await user.removeItemsFromBank(cost);
	await user.statsBankUpdate('shades_of_morton_cost_bank', cost);

	await ActivityManager.startTrip<ShadesOfMortonPyreLogsOptions>({
		userID: user.id,
		channelId,
		quantity: finalQuantity,
		duration,
		type: 'ShadesOfMortonPyreLogs',
		logID: recipe.log.id
	});

	return `${user.minionName} is now off to apply sacred oil to ${finalQuantity}x ${recipe.log.name} - trip will take ${await formatTripDuration(user, duration)}.`;
}
