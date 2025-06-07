import { formatDuration, mentionCommand } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { QuestID } from '../../../lib/minions/data/quests';
import { SkillsEnum } from '../../../lib/skilling/types';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
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
	{ base: 'Ranarr weed', paste: 'Lye', quantity: 26 },
	{ base: 'Toadflax', paste: 'Lye', quantity: 32 },
	{ base: 'Irit leaf', paste: 'Aga', quantity: 30 },
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
	const factor = 1 + (Math.random() * 2 - 1) * variance;
	return base * factor;
}

interface MixologyContract {
	name: string;
	pasteSequence: ('Mox' | 'Lye' | 'Aga')[];
	points: number;
	requiredLevel: number;
	xp: number;
	weight: number;
}

export const mixologyContracts: MixologyContract[] = [
	{
		name: 'Alco-AugmentAtor',
		pasteSequence: ['Aga', 'Aga', 'Aga'],
		points: 10,
		requiredLevel: 60,
		xp: 63,
		weight: 5
	},
	{
		name: 'Mammoth-Might Mix',
		pasteSequence: ['Mox', 'Mox', 'Mox'],
		points: 10,
		requiredLevel: 60,
		xp: 63,
		weight: 5
	},
	{
		name: 'LipLack Liquor',
		pasteSequence: ['Lye', 'Lye', 'Lye'],
		points: 10,
		requiredLevel: 60,
		xp: 63,
		weight: 5
	},
	{
		name: 'Mystic Mana Amalgam',
		pasteSequence: ['Mox', 'Mox', 'Aga'],
		points: 10,
		requiredLevel: 63,
		xp: 72,
		weight: 4
	},
	{
		name: "Marley's MoonLight",
		pasteSequence: ['Mox', 'Mox', 'Lye'],
		points: 10,
		requiredLevel: 66,
		xp: 80,
		weight: 4
	},
	{
		name: 'Azure Aura Mix',
		pasteSequence: ['Aga', 'Aga', 'Mox'],
		points: 10,
		requiredLevel: 69,
		xp: 88,
		weight: 4
	},
	{
		name: 'AquaLux Amalgam',
		pasteSequence: ['Aga', 'Lye', 'Aga'],
		points: 10,
		requiredLevel: 72,
		xp: 96,
		weight: 4
	},
	{
		name: 'MegaLite Liquid',
		pasteSequence: ['Mox', 'Lye', 'Lye'],
		points: 10,
		requiredLevel: 75,
		xp: 105,
		weight: 4
	},
	{
		name: 'Anti-Leech Lotion',
		pasteSequence: ['Aga', 'Lye', 'Lye'],
		points: 10,
		requiredLevel: 78,
		xp: 113,
		weight: 4
	},
	{
		name: 'MixALot',
		pasteSequence: ['Mox', 'Aga', 'Lye'],
		points: 10,
		requiredLevel: 81,
		xp: 122,
		weight: 3
	}
];

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

	const totalAvailable = mixologyContracts.filter(c =>
		c.pasteSequence.every(p => user.bank.amount(`${p} paste`) >= 1)
	).length;

	if (totalAvailable === 0) {
		return `You don't have enough paste to complete any contract. Try creating more first.`;
	}

	const contractTime = Time.Minute * 3;
	const maxTripLength = calcMaxTripLength(user, 'MasteringMixologyContract');
	const maxContracts = Math.floor(maxTripLength / contractTime);

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
