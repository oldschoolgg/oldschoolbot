import { formatDuration, mentionCommand, stringMatches } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { QuestID } from '../../../lib/minions/data/quests';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions';
import { randFloat } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { getOSItem } from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export interface MixologyHerb {
	name: string;
	paste: 'Mox' | 'Lye' | 'Aga';
	quantity: number;
}

const baseHerbs: { base: string; paste: 'Mox' | 'Lye' | 'Aga'; quantity: number; unf?: string }[] = [
	{ base: 'Guam leaf', paste: 'Mox', quantity: 10, unf: 'Guam potion (unf)' },
	{ base: 'Marrentill', paste: 'Mox', quantity: 13 },
	{ base: 'Tarromin', paste: 'Mox', quantity: 15 },
	{ base: 'Harralander', paste: 'Mox', quantity: 20 },
	{ base: 'Ranarr weed', paste: 'Lye', quantity: 26, unf: 'Ranarr potion (unf)' },
	{ base: 'Toadflax', paste: 'Lye', quantity: 32 },
	{ base: 'Irit leaf', paste: 'Aga', quantity: 30, unf: 'Irit potion (unf)' },
	{ base: 'Avantoe', paste: 'Lye', quantity: 30 },
	{ base: 'Kwuarm', paste: 'Lye', quantity: 33 },
	{ base: 'Huasca', paste: 'Aga', quantity: 20 },
	{ base: 'Snapdragon', paste: 'Lye', quantity: 40 },
	{ base: 'Cadantine', paste: 'Aga', quantity: 34 },
	{ base: 'Lantadyme', paste: 'Aga', quantity: 40 },
	{ base: 'Dwarf weed', paste: 'Aga', quantity: 42 },
	{ base: 'Torstol', paste: 'Aga', quantity: 44 }
];

export const mixologyHerbs: MixologyHerb[] = baseHerbs.flatMap(({ base, paste, quantity, unf }) => [
	{ name: base, paste, quantity },
	{ name: unf ?? `${base} potion (unf)`, paste, quantity }
]);

export async function MixologyPasteCreationCommand(
	user: MUser,
	channelID: string,
	herbName: string,
	optionQuantity?: number
) {
	const currentLevel = user.skillLevel(SkillsEnum.Herblore);
	if (currentLevel < 60) return 'You need at least 60 Herblore to participate in the mixology.';

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can participate in the mixology. Send your minion to do the quest using: ${mentionCommand(
			globalClient,
			'activities',
			'quest'
		)}.`;
	}
	const herb = mixologyHerbs.find(h => h.name.toLowerCase() === herbName.toLowerCase());
	if (!herb) {
		return 'That is not a valid herb for mixology paste.';
	}

	const bankQty = user.bank.amount(herb.name);
	if (bankQty === 0) {
		return `You don't have any ${herb.name} to convert into ${herb.paste} paste.`;
	}

	const timeToMixOne = Time.Second * 0.72; //Based off 5,000 used per hour
	const maxTripLength = calcMaxTripLength(user, 'MixologyPasteCreation');
	const maxByTime = Math.floor(maxTripLength / timeToMixOne);
	const maxByItems = bankQty;

	let quantity = optionQuantity ?? Math.min(maxByTime, maxByItems);
	if (quantity < 1) {
		return `You don't have enough ${herb.name} or time to make any paste.`;
	}

	if (quantity > maxByItems) quantity = maxByItems;
	if (quantity > maxByTime) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}. Try a lower quantity. You can make up to ${maxByTime}x.`;
	}

	const pasteYield = quantity * herb.quantity;
	const duration = quantity * timeToMixOne;
	const cost = new Bank().add(herb.name, quantity);

	if (!user.owns(cost)) {
		return `You're missing items to mix ${quantity}x ${herb.name}.`;
	}

	await user.removeItemsFromBank(cost);
	await updateBankSetting('mastering_mixology_cost_bank', cost);

	await addSubTaskToActivityTask<MasteringMixologyContractCreatingTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		type: 'MixologyPasteCreation',
		minigameID: 'mastering_mixology',
		herbName: herb.name,
		quantity,
		duration
	});

	return `You are using ${quantity}x ${herb.name} to create ${pasteYield}x ${herb.paste} paste. This will take ${formatDuration(
		duration
	)}.`;
}

export function getMixologyContractDuration(base: number): number {
	const variance = 0.1;
	const factor = 1 + (randFloat(0, 2) - 1) * variance;
	return base * factor;
}

interface MixologyContract {
	name: string;
	pasteSequence: ('Mox' | 'Lye' | 'Aga')[];
	requiredLevel: number;
	xp: number;
	weight: number;
}

export const mixologyContracts: MixologyContract[] = [
	{
		name: 'Alco-AugmentAtor',
		pasteSequence: ['Aga', 'Aga', 'Aga'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'Mammoth-Might Mix',
		pasteSequence: ['Mox', 'Mox', 'Mox'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'LipLack Liquor',
		pasteSequence: ['Lye', 'Lye', 'Lye'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'Mystic Mana Amalgam',
		pasteSequence: ['Mox', 'Mox', 'Aga'],
		requiredLevel: 63,
		xp: 215,
		weight: 4
	},
	{
		name: "Marley's MoonLight",
		pasteSequence: ['Mox', 'Mox', 'Lye'],
		requiredLevel: 66,
		xp: 240,
		weight: 4
	},
	{
		name: 'Azure Aura Mix',
		pasteSequence: ['Aga', 'Aga', 'Mox'],
		requiredLevel: 69,
		xp: 265,
		weight: 4
	},
	{
		name: 'AquaLux Amalgam',
		pasteSequence: ['Aga', 'Lye', 'Aga'],
		requiredLevel: 72,
		xp: 290,
		weight: 4
	},
	{
		name: 'MegaLite Liquid',
		pasteSequence: ['Mox', 'Lye', 'Lye'],
		requiredLevel: 75,
		xp: 315,
		weight: 4
	},
	{
		name: 'Anti-Leech Lotion',
		pasteSequence: ['Aga', 'Lye', 'Lye'],
		requiredLevel: 78,
		xp: 340,
		weight: 4
	},
	{
		name: 'MixALot',
		pasteSequence: ['Mox', 'Aga', 'Lye'],
		requiredLevel: 81,
		xp: 365,
		weight: 3
	}
];

export const masteringMixologyBuyables = [
	{
		item: getOSItem('Apprentice potion pack'),
		cost: { Mox: 420, Aga: 70, Lye: 30 },
		requiredLevel: 60
	},
	{
		item: getOSItem('Adept potion pack'),
		cost: { Mox: 180, Aga: 440, Lye: 70 },
		requiredLevel: 70
	},
	{
		item: getOSItem('Expert potion pack'),
		cost: { Mox: 410, Aga: 320, Lye: 480 },
		requiredLevel: 85
	},
	{
		item: getOSItem('Prescription goggles'),
		cost: { Mox: 8600, Aga: 7000, Lye: 9350 }
	},
	{ item: getOSItem('Alchemist labcoat'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: getOSItem('Alchemist pants'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: getOSItem('Alchemist gloves'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: getOSItem('Reagent pouch'), cost: { Mox: 13800, Aga: 11200, Lye: 15100 } },
	{ item: getOSItem('Potion storage'), cost: { Mox: 7750, Aga: 6300, Lye: 8950 } },
	{
		item: getOSItem('Chugging barrel (disassembled)'),
		cost: { Mox: 17250, Aga: 14000, Lye: 18600 }
	},
	{ item: getOSItem("Alchemist's amulet"), cost: { Mox: 6900, Aga: 5650, Lye: 7400 } },
	{ item: getOSItem('Aldarium'), cost: { Mox: 80, Aga: 60, Lye: 90 } }
];

export async function MasteringMixologyBuyCommand(user: MUser, input = '', quantity = 1) {
	const buyable = masteringMixologyBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy:\n\n${masteringMixologyBuyables
			.map(i => {
				const levelReq = i.requiredLevel ? ` (requires ${i.requiredLevel} Herblore)` : '';
				return `**${i.item.name}:** ${i.cost.Mox} Mox, ${i.cost.Aga} Aga, ${i.cost.Lye} Lye${levelReq}`;
			})
			.join('\n')}.`;
	}

	const currentLevel = user.skillLevel(SkillsEnum.Herblore);
	if (buyable.requiredLevel && currentLevel < buyable.requiredLevel) {
		return `You need ${buyable.requiredLevel} Herblore to buy the ${buyable.item.name}.`;
	}

	const totalCost = {
		Mox: buyable.cost.Mox * quantity,
		Aga: buyable.cost.Aga * quantity,
		Lye: buyable.cost.Lye * quantity
	};

	if (
		user.user.mixology_mox_points < totalCost.Mox ||
		user.user.mixology_aga_points < totalCost.Aga ||
		user.user.mixology_lye_points < totalCost.Lye
	) {
		return (
			`You don't have enough Mixology points to buy ${quantity.toLocaleString()}x ${buyable.item.name}. ` +
			`You need ${totalCost.Mox} Mox, ${totalCost.Aga} Aga and ${totalCost.Lye} Lye points.`
		);
	}

	await user.update({
		mixology_mox_points: { decrement: totalCost.Mox },
		mixology_aga_points: { decrement: totalCost.Aga },
		mixology_lye_points: { decrement: totalCost.Lye }
	});

	const loot = new Bank().add(buyable.item.id, quantity);
	await transactItems({ userID: user.id, itemsToAdd: loot, collectionLog: true });

	return `Successfully purchased ${loot} for ${totalCost.Mox} Mox, ${totalCost.Aga} Aga and ${totalCost.Lye} Lye points.`;
}

export async function MasteringMixologyContractStartCommand(user: MUser, channelID: string, contracts?: number) {
	const currentLevel = user.skillLevel(SkillsEnum.Herblore);

	if (currentLevel < 60) return 'You need at least 60 Herblore to participate in the mixology.';

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can participate in the mixology. Send your minion to do the quest using: ${mentionCommand(
			globalClient,
			'activities',
			'quest'
		)}.`;
	}

	const totalAvailable = mixologyContracts.filter(c => {
		const counts: Record<'Mox' | 'Lye' | 'Aga', number> = {
			Mox: 0,
			Lye: 0,
			Aga: 0
		};
		for (const p of c.pasteSequence) counts[p] += 10;
		return (
			currentLevel >= c.requiredLevel &&
			Object.entries(counts).every(([p, c]) => user.bank.amount(`${p} paste`) >= c)
		);
	}).length;
	if (totalAvailable === 0) {
		return `You're out of paste! Each contract requires 30 paste (3 batches of 10). \nCreate more using ${mentionCommand(
			globalClient,
			'minigames',
			'mastering_mixology',
			'create'
		)} before starting any contracts.`;
	}

	const contractTime = Time.Hour / 343;
	const maxTripLength = calcMaxTripLength(user, 'MasteringMixologyContract');
	const maxContracts = Math.floor(maxTripLength / (contractTime * 1.1));

	if (!contracts) {
		contracts = maxContracts;
	}

	if (contracts < 1 || contracts > maxContracts) {
		return `You can only complete between 1 and ${maxContracts} contracts based on your current max trip length.`;
	}
	let totalDuration = 0;
	for (let i = 0; i < contracts; i++) {
		totalDuration += getMixologyContractDuration(contractTime);
	}
	const duration = Math.round(totalDuration);

	await addSubTaskToActivityTask<MasteringMixologyContractActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		type: 'MasteringMixologyContract',
		duration,
		minigameID: 'mastering_mixology',
		quantity: contracts
	});

	return `${user.minionName} is now attempting ${contracts} Mastering Mixology contract${contracts > 1 ? 's' : ''}. If enough paste is available, the trip will take ${formatDuration(duration)}.`;
}

export async function MasteringMixologyStatusCommand(user: MUser) {
	const { mixology_mox_points, mixology_aga_points, mixology_lye_points } = user.user;
	const moxPaste = user.bank.amount('Mox paste');
	const agaPaste = user.bank.amount('Aga paste');
	const lyePaste = user.bank.amount('Lye paste');
	const kc = await getMinigameScore(user.id, 'mastering_mixology');

	return `You have ${mixology_mox_points.toLocaleString()} Mox points, ${mixology_aga_points.toLocaleString()} Aga points and ${mixology_lye_points.toLocaleString()} Lye points.
You have ${moxPaste.toLocaleString()}x Mox paste, ${agaPaste.toLocaleString()}x Aga paste and ${lyePaste.toLocaleString()}x Lye paste.
You have completed ${kc} Mastering Mixology contracts.`;
}
