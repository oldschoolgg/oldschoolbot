import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { getSkillsOfMahojiUser, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ItemBank } from '../types';
import { ActivityTaskOptions } from '../types/minions';
import { assert, formatDuration, stringMatches } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import getOSItem from '../util/getOSItem';
import { handleTripFinish } from '../util/handleTripFinish';
import { minionIsBusy } from '../util/minionIsBusy';
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
	itemCost: Bank;
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
		flags: ['bank'],
		itemCost: new Bank().add('Gorajan bonecrusher')
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
		flags: ['bank'],
		itemCost: new Bank().add('Cannon base').add('Cannon stand').add('Cannon barrel').add('Cannon furnace')
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
		flags: ['equipped'],
		itemCost: new Bank().add('Inferno adze').add('Infernal core').add('Dragon pickaxe')
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
	let baseMultiplierPerType = 7;
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

export async function transactMaterialsFromUser({
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
	await mahojiUserSettingsUpdate(userID, {
		materials_owned: bank.bank
	});
}

export interface ItemInventingOptions extends ActivityTaskOptions {
	i_id: number;
	attempts: number;
}

export async function inventCommand(user: User, channelID: bigint, inventionName: string): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	const invention = Inventions.find(i => stringMatches(i.name, inventionName));
	if (!invention) return "That's not a valid invention.";
	const details = inventionDetails(user, invention);

	const ownedBank = new MaterialBank(user.materials_owned as IMaterialBank);
	if (!ownedBank.has(details.cost)) {
		const missing = details.cost.clone().remove(ownedBank);
		return `You don't have enough materials to do this trip. You are missing: ${missing}.`;
	}

	await transactMaterialsFromUser({
		userID: BigInt(user.id),
		remove: details.cost
	});
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

export async function itemInventingActivity(options: ItemInventingOptions) {
	const { userID, channelID, i_id } = options;
	const mahojiUser = await mahojiUsersSettingsFetch(userID);
	const klasaUser = await globalClient.fetchUser(userID);
	const invention = Inventions.find(i => i.id === i_id)!;

	handleTripFinish(
		klasaUser,
		channelID,
		`${userMention(userID)}, ${minionName(mahojiUser)} finished inventing`,
		[
			'invention',
			{
				invent: {
					name: invention.name
				}
			},
			true
		],
		undefined,
		options,
		null
	);
}
