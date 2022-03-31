import { calcPercentOfNum, calcWhatPercent, randArrItem, randInt, roll, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Plank } from '../../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../../lib/util/getOSItem';

const contractTiers = [
	{
		name: 'Expert',
		level: 70,
		plank: Plank.MahoganyPlank,
		xp: 2750,
		points: 5,
		plankXP: [112, 240]
	},
	{
		name: 'Adept',
		level: 50,
		plank: Plank.TeakPlank,
		xp: 2250,
		points: 4,
		plankXP: [72, 190]
	},
	{
		name: 'Novice',
		level: 20,
		plank: Plank.OakPlank,
		xp: 1250,
		points: 3,
		plankXP: [48, 160]
	},
	{
		name: 'Beginner',
		level: 1,
		plank: Plank.Plank,
		xp: 500,
		points: 2,
		plankXP: [22.5, 127.5]
	}
];

const planksTable = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4];

function calcTrip(level: number, kc: number, maxLen: number, hasSack: boolean): [number, Bank, number, number, number] {
	const percentSkill = Math.min(100, calcWhatPercent(kc, 300));
	const qtyPerHour = 31 + Math.ceil(calcPercentOfNum(percentSkill, 5)) + (hasSack ? 6 : 0);
	const qtyPerMaxLen = (qtyPerHour / Time.Hour) * maxLen;
	const lenPerQty = maxLen / qtyPerMaxLen;
	const tier = contractTiers.find(tier => level >= tier.level)!;

	const qty = Math.floor(maxLen / lenPerQty);
	let itemsNeeded = new Bank();
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

export async function mahoganyHomesBuyCommand(user: KlasaUser, input = '') {
	const buyable = mahoganyHomesBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${mahoganyHomesBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	const { item, cost } = buyable;
	const balance = user.settings.get(UserSettings.CarpenterPoints);
	if (balance < cost) {
		return `You don't have enough Carpenter Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`;
	}

	await user.settings.update(UserSettings.CarpenterPoints, balance - cost);
	await user.addItemsToBank({ items: { [item.id]: 1 }, collectionLog: true });

	return `Successfully purchased 1x ${item.name} for ${cost} Carpenter Points.`;
}

export async function mahoganyHomesBuildCommand(user: KlasaUser, channelID: bigint): CommandResponse {
	if (user.minionIsBusy) return `${user.minionName} is currently busy.`;
	await user.settings.sync(true);

	const conLevel = user.skillLevel(SkillsEnum.Construction);
	const kc = await user.getMinigameScore('mahogany_homes');

	const hasSack = user.hasItemEquippedOrInBank('Plank sack');
	const [quantity, itemsNeeded, xp, duration, points] = calcTrip(
		conLevel,
		kc,
		user.maxTripLength('MahoganyHomes'),
		hasSack
	);

	if (!user.bank().has(itemsNeeded.bank)) {
		return `You don't have enough items for this trip. You need: ${itemsNeeded}.`;
	}
	await user.removeItemsFromBank(itemsNeeded.bank);

	updateBankSetting(client, ClientSettings.EconomyStats.ConstructCostBank, itemsNeeded);

	await addSubTaskToActivityTask<MahoganyHomesActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		type: 'MahoganyHomes',
		minigameID: 'mahogany_homes',
		quantity,
		duration,
		points,
		xp
	});

	let str = `${
		user.minionName
	} is now doing ${quantity}x Mahogany homes contracts, the trip will take ${formatDuration(
		duration
	)}. Removed ${itemsNeeded} from your bank.`;

	if (hasSack) {
		str += "\nYou're getting more XP/Hr because of your Plank sack!";
	}

	return str;
}
