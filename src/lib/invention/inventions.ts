import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ItemBank } from '../types';
import { ActivityTaskOptions } from '../types/minions';
import { assert, formatDuration, stringMatches } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import getOSItem from '../util/getOSItem';
import { minionName } from '../util/minionUtils';
import { IMaterialBank } from '.';
import { MaterialBank } from './MaterialBank';

const InventionFlags = ['equipped', 'bank'] as const;
type InventionFlag = typeof InventionFlags[number];

interface Invention {
	id: number;
	name: string;
	description: string;
	item: Item;
	materialTypeBank: MaterialBank;
	flags: InventionFlag[];
}

export const Inventions: Invention[] = [
	{
		id: 1,
		name: 'Superior bonecrusher',
		description: 'Provides a 25% increase in XP over the Gorajan bonecrusher.',
		item: getOSItem('Superior bonecrusher'),
		materialTypeBank: new MaterialBank({
			pious: 75,
			sharp: 10,
			magic: 15
		}),
		flags: ['bank']
	},
	{
		id: 2,
		name: 'Superior dwarf multicannon',
		description: 'A 25% stronger version of the Dwarven multicannon.',
		item: getOSItem('Superior dwarf multicannon'),
		materialTypeBank: new MaterialBank({
			pious: 75,
			sharp: 10,
			magic: 15
		}),
		flags: ['bank']
	},
	{
		id: 3,
		name: 'Superior inferno adze',
		description: 'Chops, and firemakes logs. Mines, and smelts ores.',
		item: getOSItem('Superior inferno adze'),
		materialTypeBank: new MaterialBank({
			pious: 75,
			sharp: 10,
			magic: 15
		}),
		flags: ['equipped']
	}
];

function calculateSuccessChance(invLevel: number, cl: Bank, invention: Invention) {
	let successRatePercent = 1;

	// Higher success for higher invention levels
	successRatePercent += invLevel * 0.1;

	// 2x success if they have made one before
	if (cl.has(invention.item.id)) successRatePercent *= 2;

	assert(successRatePercent >= 0 && successRatePercent <= 100);
	return successRatePercent;
}

function calculateMaterialCostOfInventionAttempt(invention: Invention, qty: number) {
	let baseMultiplierPerType = 100;
	let cost = new MaterialBank();
	for (const { type, quantity } of invention.materialTypeBank.values()) {
		cost.add(type, quantity * baseMultiplierPerType * qty);
	}
	return cost;
}

function inventionDetails(user: User, invention: Invention) {
	const stats = getSkillsOfMahojiUser(user, true);
	const cl = new Bank(user.collectionLogBank as ItemBank);
	const successChance = calculateSuccessChance(stats.invention, cl, invention);

	let durationPerInventAttempt = Time.Minute * 8;
	let attempts = Math.floor(calcMaxTripLength(user, 'ItemInventing') / durationPerInventAttempt);
	let duration = attempts * durationPerInventAttempt;
	const cost = calculateMaterialCostOfInventionAttempt(invention, attempts);

	return {
		successChance,
		attempts,
		duration,
		cost
	};
}

async function transactMaterialsFromUser({
	userID,
	add,
	remove
}: {
	userID: bigint;
	add?: MaterialBank;
	remove?: MaterialBank;
}) {
	const user = await mahojiUsersSettingsFetch(userID, {
		materials_owned: true
	});

	const bank = new MaterialBank(user.materials_owned as IMaterialBank);
	if (add) {
		bank.add(add);
	}
	if (remove) {
		bank.remove(remove);
	}
}

export interface ItemInventingOptions extends ActivityTaskOptions {
	i_id: number;
	attempts: number;
}

export async function inventCommand(user: User, channelID: bigint, inventionName: string): CommandResponse {
	const invention = Inventions.find(i => stringMatches(i.name, inventionName));
	if (!invention) return "That's not a valid invention.";
	if (!user.blueprints_owned.includes(invention.id)) {
		return "You don't have the blueprint for this Invention, so your minion doesn't know how to invent it!";
	}
	const details = inventionDetails(user, invention);
	await addSubTaskToActivityTask<ItemInventingOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		attempts: details.attempts,
		duration: details.duration,
		i_id: invention.id,
		type: 'ItemInventing'
	});

	return `${userMention(user.id)}, ${minionName(user)} is now making ${details.attempts} attempts at inventing a ${
		invention.name
	}, the trip will take ${formatDuration(details.duration)}. They are using these materials: ${details.cost}.`;
}
