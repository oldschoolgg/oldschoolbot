import { Time } from 'e';
import { Bank, type Item } from 'oldschooljs';

import type { ShadesOfMortonOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, resolveItems } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { userStatsBankUpdate } from '../../mahojiSettings';

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
		item: getOSItem('Loar remains')
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
		item: getOSItem('Phrin remains')
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
		item: getOSItem('Riyl remains')
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
		item: getOSItem('Asyn remains')
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
		item: getOSItem('Fiyr remains')
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
		item: getOSItem('Urium remains')
	}
];

export const shadesLogs: ShadesLog[] = [
	{
		oiledLog: getOSItem('Pyre logs'),
		normalLog: getOSItem('Logs'),
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
		oiledLog: getOSItem('Oak pyre logs'),
		normalLog: getOSItem('Oak logs'),
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
		oiledLog: getOSItem('Willow pyre logs'),
		normalLog: getOSItem('Willow logs'),
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
		oiledLog: getOSItem('Teak pyre logs'),
		normalLog: getOSItem('Teak logs'),
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
		oiledLog: getOSItem('Arctic pyre logs'),
		normalLog: getOSItem('Arctic pine logs'),
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
		oiledLog: getOSItem('Maple pyre logs'),
		normalLog: getOSItem('Maple logs'),
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
		oiledLog: getOSItem('Mahogany pyre logs'),
		normalLog: getOSItem('Mahogany logs'),
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
		oiledLog: getOSItem('Yew pyre logs'),
		normalLog: getOSItem('Yew logs'),
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
		oiledLog: getOSItem('Magic pyre logs'),
		normalLog: getOSItem('Magic logs'),
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
		oiledLog: getOSItem('Redwood pyre logs'),
		normalLog: getOSItem('Redwood logs'),
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

export async function shadesOfMortonStartCommand(user: MUser, channelID: string, logStr: string, shadeStr: string) {
	const messages: string[] = [];
	let totalTime = calcMaxTripLength(user, 'ShadesOfMorton');
	for (let i = coffins.length - 1; i >= 0; i--) {
		const coffin = coffins[i];
		if (user.hasEquipped(coffin)) {
			const bonusTime = i * Time.Minute;
			if (bonusTime) {
				totalTime += bonusTime;
				messages.push(`${formatDuration(bonusTime)} bonus max trip length for ${itemNameFromID(coffin)}`);
				break;
			}
		}
	}

	const logItem = getItem(logStr);
	if (!logItem) return 'Invalid logs item';

	const userBank = user.bank;
	const logsOwned = userBank.amount(logItem.id);
	if (logsOwned === 0) return `You don't own any ${logItem.name}!`;

	const log = shadesLogs.find(i => i.normalLog.id === logItem.id);
	const shade = shades.find(i => i.shadeName === shadeStr);
	if (!log || !shade) return 'Invalid item';

	const shadesOwned = userBank.amount(shade.item.id);
	if (!shadesOwned) return `You don't own any ${shade.item.name}! Go kill some shades.`;

	const timePerLog = Time.Minute;
	const quantity = Math.min(logsOwned, shadesOwned, Math.floor(totalTime / timePerLog));
	const duration = quantity * timePerLog;

	const prayerXP = log.prayerXP[shade.shadeName];
	if (!prayerXP) {
		return `You can't use ${log.normalLog.name} with ${shade.item.name}.`;
	}

	const cost = new Bank();
	cost.add(log.normalLog.id, quantity);
	cost.add(shade.item.id, quantity);
	if (!user.owns(cost)) return `You don't own: ${cost}.`;

	await user.removeItemsFromBank(cost);
	await userStatsBankUpdate(user, 'shades_of_morton_cost_bank', cost);

	await addSubTaskToActivityTask<ShadesOfMortonOptions>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'ShadesOfMorton',
		minigameID: 'shades_of_morton',
		logID: logItem.id,
		shadeID: shade.shadeName
	});

	let str = `${
		user.minionName
	} is now off to do Shades of Mort'ton using ${cost} - the total trip will take ${formatDuration(duration)}.`;
	if (messages.length > 0) {
		str += `\n**Messages:** ${messages.join(', ')}`;
	}
	return str;
}
