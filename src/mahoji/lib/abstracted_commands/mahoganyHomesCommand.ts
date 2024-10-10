import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { Time, calcPercentOfNum, calcWhatPercent, randArrItem, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { getMinigameScore } from '../../../lib/settings/minigames';
import { Plank } from '../../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

interface IContract {
	name: string;
	tier: number;
	level: number;
	plank: number;
	xp: number;
	points: number;
	plankXP: number[];
}

export const contractTiers: IContract[] = [
	{
		name: 'Expert (Mahogany Planks)',
		tier: 4,
		level: 70,
		plank: Plank.MahoganyPlank,
		xp: 2750,
		points: 5,
		plankXP: [112, 240]
	},
	{
		name: 'Adept (Teak Planks)',
		tier: 3,
		level: 50,
		plank: Plank.TeakPlank,
		xp: 2250,
		points: 4,
		plankXP: [72, 190]
	},
	{
		name: 'Novice (Oak Planks)',
		tier: 2,
		level: 20,
		plank: Plank.OakPlank,
		xp: 1250,
		points: 3,
		plankXP: [48, 160]
	},
	{
		name: 'Beginner (Planks)',
		tier: 1,
		level: 1,
		plank: Plank.Plank,
		xp: 500,
		points: 2,
		plankXP: [22.5, 127.5]
	}
];

const planksTable = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4];

function calcTrip(
	tier: IContract,
	kc: number,
	maxLen: number,
	hasSack: boolean
): [number, Bank, number, number, number] {
	const percentSkill = Math.min(100, calcWhatPercent(kc, 300));
	const qtyPerHour = 31 + Math.ceil(calcPercentOfNum(percentSkill, 5)) + (hasSack ? 6 : 0);
	const qtyPerMaxLen = (qtyPerHour / Time.Hour) * maxLen;
	const lenPerQty = maxLen / qtyPerMaxLen;

	const qty = Math.floor(maxLen / lenPerQty);
	const itemsNeeded = new Bank();
	let xp = 0;

	for (let i = 0; i < qty; i++) {
		if (tier.name !== 'Beginner' && roll(5)) {
			itemsNeeded.add('Steel bar', randInt(2, 4));
		}
		let planksNeeded = 0;
		const planksCap = randInt(10, 16);

		while (planksNeeded <= planksCap - 2) {
			const plankBuild = randArrItem(planksTable);
			planksNeeded += plankBuild;
			xp += tier.plankXP[roll(2) ? 0 : 1] * plankBuild;
		}
		itemsNeeded.add(tier.plank, planksNeeded);
		xp += tier.xp;
	}

	const points = qty * tier.points;
	return [qty, itemsNeeded, xp, lenPerQty * qty, points];
}

export const mahoganyHomesBuyables = [
	{ item: getOSItem('Builders supply crate'), cost: 25 },
	{ item: getOSItem("Amy's saw"), cost: 500 },
	{ item: getOSItem('Plank sack'), cost: 350 },
	{ item: getOSItem('Hosidius blueprints'), cost: 2000 },
	{ item: getOSItem("Carpenter's helmet"), cost: 400 },
	{ item: getOSItem("Carpenter's shirt"), cost: 800 },
	{ item: getOSItem("Carpenter's trousers"), cost: 600 },
	{ item: getOSItem("Carpenter's boots"), cost: 200 }
];

export async function mahoganyHomesBuyCommand(user: MUser, input = '', quantity?: number) {
	const buyable = mahoganyHomesBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${mahoganyHomesBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	if (!quantity) {
		quantity = 1;
	}

	const { item, cost } = buyable;
	const balance = user.user.carpenter_points;
	if (balance < cost * quantity) {
		return `You don't have enough Carpenter Points to buy ${quantity.toLocaleString()}x ${item.name}. You need ${
			cost * quantity
		}, but you have only ${balance}.`;
	}
	await user.update({
		carpenter_points: {
			decrement: cost * quantity
		}
	});
	const loot = new Bank().add(item.id, quantity);
	await transactItems({ userID: user.id, itemsToAdd: loot, collectionLog: true });

	return `Successfully purchased ${loot} for ${cost * quantity} Carpenter Points.`;
}

export async function mahoganyHomesPointsCommand(user: MUser) {
	const balance = user.user.carpenter_points;
	return `You have **${balance.toLocaleString()}** Mahogany Homes points.`;
}

export async function mahoganyHomesBuildCommand(user: MUser, channelID: string, tier?: number): CommandResponse {
	if (user.minionIsBusy) return `${user.minionName} is currently busy.`;

	const conLevel = user.skillLevel(SkillsEnum.Construction);
	const kc = await getMinigameScore(user.id, 'mahogany_homes');

	let tierData = contractTiers.find(contractTier => conLevel >= contractTier.level)!;

	if (tier) {
		tierData = contractTiers.find(contractTier => Number(tier) === contractTier.tier) || tierData;
		if (tierData.level > conLevel) {
			return `You need ${tierData.level} Construction for this contract, you have ${conLevel}.`;
		}
	} else {
		tierData = contractTiers.find(contractTier => conLevel >= contractTier.level)!;
	}

	const hasSack = user.hasEquippedOrInBank('Plank sack');
	const [quantity, itemsNeeded, xp, duration, points] = calcTrip(
		tierData,
		kc,
		calcMaxTripLength(user, 'MahoganyHomes'),
		hasSack
	);

	if (!user.owns(itemsNeeded)) {
		return `You don't have enough items for this trip. You need: ${itemsNeeded}.`;
	}
	await user.removeItemsFromBank(itemsNeeded);

	updateBankSetting('construction_cost_bank', itemsNeeded);

	await addSubTaskToActivityTask<MahoganyHomesActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		type: 'MahoganyHomes',
		minigameID: 'mahogany_homes',
		quantity,
		duration,
		points,
		xp,
		tier: tierData.tier
	});

	let str = `${user.minionName} is now doing ${quantity}x ${
		tierData.name
	} Mahogany homes contracts, the trip will take ${formatDuration(duration)}. Removed ${itemsNeeded} from your bank.`;

	if (hasSack) {
		str += "\nYou're getting more XP/Hr because of your Plank sack!";
	}

	return str;
}
