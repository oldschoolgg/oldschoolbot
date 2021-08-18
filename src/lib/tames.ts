import { deepClone, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { addBanks } from 'oldschooljs/dist/util';

import { client } from '..';
import BankImageTask from '../tasks/bankImage';
import { UserSettings } from './settings/types/UserSettings';
import { TameActivityTable } from './typeorm/TameActivityTable.entity';
import { TamesTable } from './typeorm/TamesTable.entity';
import { roll } from './util';
import getOSItem from './util/getOSItem';
import { sendToChannelID } from './util/webhook';

interface NurseryEgg {
	species: number;
	insertedAt: number;
}
export interface Nursery {
	egg: NurseryEgg | null;
	eggsHatched: number;
	hasFuel: boolean;
}

export interface Species {
	id: number;
	name: string;
	/**
	 * Tames get assigned a max level in these ranges,
	 * in a bell curve fashion, where the middle of the range
	 * is significantly more likely than the head/tail of the range.
	 *
	 * The maximum level is always 100. The minimum is 1.
	 *
	 * If your tame gets assigned a max level of 80,
	 * as a baby, the level will be (80/4). Fully grown, adult,
	 * it will be 80.
	 */
	combatLevelRange: [number, number];
	artisanLevelRange: [number, number];
	supportLevelRange: [number, number];
	gathererLevelRange: [number, number];
	hatchTime: number;
	egg: Item;
	emoji: string;
}

export const tameSpecies: Species[] = [
	{
		id: 1,
		name: 'Igne',
		combatLevelRange: [70, 100],
		artisanLevelRange: [1, 10],
		supportLevelRange: [1, 10],
		gathererLevelRange: [1, 10],
		hatchTime: Time.Hour * 18.5,
		egg: getOSItem(48_210),
		emoji: '<:dragonEgg:858948148641660948>'
	}
];

export type TameTaskType = 'pvm';

export interface TameTaskOptions {
	type: 'pvm';
	monsterID: number;
	quantity: number;
}

export async function runTameTask(activity: TameActivityTable) {
	async function handleFinish(res: { loot: Bank; message: string; user: KlasaUser }) {
		const previousTameCl = { ...deepClone(activity.tame.totalLoot) };
		activity.tame.totalLoot = addBanks([activity.tame.totalLoot, res.loot.bank]);
		await activity.tame.save();
		const addRes = await activity.tame.addDuration(activity.duration);
		if (addRes) {
			res.message += `\n${addRes}`;
		}
		sendToChannelID(client, activity.channelID, {
			content: res.message,
			image: (
				await (client.tasks.get('bankImage') as BankImageTask).generateBankImage(
					res.loot,
					`${activity.tame.name}'s PvM Trip Loot`,
					true,
					{ showNewCL: 1 },
					res.user,
					previousTameCl
				)
			).image!
		});
	}
	switch (activity.type) {
		case 'pvm': {
			const { quantity, monsterID } = activity.data;
			let killQty = quantity;
			const hasOri = activity.tame.hasBeenFed('Ori');
			// If less than 8 kills, roll 25% chance per kill
			if (hasOri) {
				if (killQty >= 8) {
					killQty = Math.floor(killQty * 1.25);
				} else {
					for (let i = 0; i < quantity; i++) {
						if (roll(4)) killQty++;
					}
				}
			}
			const fullMonster = Monsters.get(monsterID)!;
			const loot = fullMonster.kill(killQty, {});
			const user = await client.fetchUser(activity.userID);
			let str = `${user}, ${activity.tame.name} finished killing ${quantity}x ${fullMonster.name}.`;
			const boosts = [];
			if (hasOri) {
				boosts.push('25% extra loot (ate a Ori)');
			}
			if (boosts.length > 0) {
				str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
			}
			const { itemsAdded } = await user.addItemsToBank(loot);
			handleFinish({
				loot: new Bank(itemsAdded),
				message: str,
				user
			});
			break;
		}
		default: {
			console.error('Unmatched tame activity type', activity.type);
			break;
		}
	}
}

export async function getUsersTame(user: KlasaUser): Promise<[TamesTable | undefined, TameActivityTable | undefined]> {
	const selectedTame = user.settings.get(UserSettings.SelectedTame);
	if (!selectedTame) {
		return [undefined, undefined];
	}
	const tame = await TamesTable.findOne({ where: { id: selectedTame } });
	if (!tame) {
		throw new Error('No tame found for selected tame.');
	}
	const activity = await TameActivityTable.findOne({ where: { userID: user.id, tame, completed: false } });
	return [tame, activity];
}
