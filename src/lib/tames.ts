import { MessageCollector } from 'discord.js';
import { deepClone, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { addBanks } from 'oldschooljs/dist/util';

import { client } from '..';
import { collectables } from '../commands/Minion/collect';
import BankImageTask from '../tasks/bankImage';
import { effectiveMonsters } from './minions/data/killableMonsters';
import { UserSettings } from './settings/types/UserSettings';
import { TameActivityTable } from './typeorm/TameActivityTable.entity';
import { TamesTable } from './typeorm/TamesTable.entity';
import { ItemBank } from './types';
import { generateContinuationChar, itemNameFromID, roll } from './util';
import { createCollector } from './util/createCollector';
import getOSItem from './util/getOSItem';
import { collectors } from './util/handleTripFinish';
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

export const enum TameType {
	Combat = 'pvm',
	Gatherer = 'collect',
	Support = 'support',
	Artisan = 'craft'
}

export interface TameTaskCombatOptions {
	type: TameType.Combat;
	monsterID: number;
	quantity: number;
}

export interface TameTaskGathererOptions {
	type: TameType.Gatherer;
	itemID: number;
	quantity: number;
}

export type TameTaskOptions = TameTaskCombatOptions | TameTaskGathererOptions;

export interface Species {
	id: number;
	type: TameType;
	name: string;
	// Tame type within its specie
	variants: number[];
	shinyVariant: number;
	shinyChance: number;
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
	relevantLevelCategory: 'combat' | 'artisan' | 'support' | 'gatherer';
	hatchTime: number;
	egg: Item;
	mergingCost: Bank;
	emoji: string;
}

export const tameSpecies: Species[] = [
	{
		id: 1,
		type: TameType.Combat,
		name: 'Igne',
		variants: [1, 2, 3],
		shinyVariant: 4,
		shinyChance: 30,
		combatLevelRange: [70, 100],
		artisanLevelRange: [1, 10],
		supportLevelRange: [1, 10],
		gathererLevelRange: [1, 10],
		relevantLevelCategory: 'combat',
		hatchTime: Time.Hour * 18.5,
		egg: getOSItem(48_210),
		mergingCost: new Bank()
			.add('Ignecarus scales', 100)
			.add('Zenyte', 2)
			.add('Soul rune', 2500)
			.add('Elder rune', 100),
		emoji: '<:dragonEgg:858948148641660948>'
	},
	{
		id: 2,
		type: TameType.Gatherer,
		name: 'Monkey',
		variants: [1, 2, 3],
		shinyVariant: 4,
		shinyChance: 60,
		combatLevelRange: [12, 24],
		artisanLevelRange: [1, 10],
		supportLevelRange: [1, 10],
		gathererLevelRange: [75, 100],
		relevantLevelCategory: 'gatherer',
		hatchTime: Time.Hour * 4.5,
		egg: getOSItem('Monkey egg'),
		emoji: '<:monkey_egg:883326001445224488>',
		mergingCost: new Bank()
			.add('Banana', 1000)
			.add('Magic banana', 50)
			.add('Chimpling jar')
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
	}
];

export async function runTameTask(activity: TameActivityTable) {
	async function handleFinish(res: { loot: Bank; message: string; user: KlasaUser; activityDone: ItemBank }) {
		const previousTameCl = { ...deepClone(activity.tame.totalLoot) };

		activity.tame.totalLoot = addBanks([activity.tame.totalLoot, res.loot.bank]);
		activity.tame.activitiesDone = addBanks([activity.tame.activitiesDone, res.activityDone]);

		await activity.tame.save();
		const addRes = await activity.tame.addDuration(activity.duration);
		if (addRes) res.message += `\n${addRes}`;

		const continuationChar = generateContinuationChar(res.user);
		res.message += `\nSay \`${continuationChar}\` to repeat this trip.`;

		sendToChannelID(client, activity.channelID, {
			content: res.message,
			image: (
				await (client.tasks.get('bankImage') as BankImageTask).generateBankImage(
					res.loot,
					`${activity.tame.name}'s Loot`,
					true,
					{ showNewCL: 1 },
					res.user,
					previousTameCl
				)
			).image!
		});

		createCollector({
			user: res.user,
			channelID: activity.channelID,
			continuationCharacter: [continuationChar],
			toExecute: async (mes: KlasaMessage, collector: MessageCollector) => {
				if (client.oneCommandAtATimeCache.has(mes.author.id)) {
					collector.stop();
					collectors.delete(mes.author.id);
					return;
				}
				client.oneCommandAtATimeCache.add(mes.author.id);
				try {
					const activityData = activity.data;
					let tameInteraction = '';
					switch (activityData.type) {
						case TameType.Combat:
							tameInteraction = effectiveMonsters.find(e => e.id === activityData.monsterID)!.name;
							(client.commands.get('tame') as any)!.k(mes, [tameInteraction]);
							break;
						case TameType.Gatherer:
							tameInteraction = itemNameFromID(activityData.itemID)!.toLowerCase();
							(client.commands.get('tame') as any)!.c(mes, [tameInteraction]);
							break;
					}
				} catch (err) {
					console.log({ err });
					mes.channel.send(err);
				} finally {
					setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
				}
			}
		});
	}

	switch (activity.data.type) {
		case 'pvm': {
			const { quantity, monsterID } = activity.data;
			let killQty = quantity;
			const hasOri = activity.tame.hasBeenFed('Ori');
			// If less than 8 kills, roll 25% chance per kill
			if (hasOri) {
				if (killQty >= 8) {
					killQty = Math.ceil(killQty * 1.25);
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
				boosts.push('25% extra loot (ate an Ori)');
			}
			if (boosts.length > 0) {
				str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
			}
			const { itemsAdded } = await user.addItemsToBank(loot);
			handleFinish({
				loot: new Bank(itemsAdded),
				message: str,
				user,
				activityDone: { [monsterID]: quantity }
			});
			break;
		}
		case 'collect': {
			const { quantity, itemID } = activity.data;
			const collectable = collectables.find(c => c.item.id === itemID)!;
			const totalQuantity = quantity * collectable.quantity;
			const loot = new Bank().add(collectable.item.id, totalQuantity);
			const user = await client.fetchUser(activity.userID);
			let str = `${user}, ${activity.tame.name} finished collecting ${totalQuantity}x ${
				collectable.item.name
			}. (${Math.round((totalQuantity / (activity.duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
			const { itemsAdded } = await user.addItemsToBank(loot);
			handleFinish({
				loot: new Bank(itemsAdded),
				message: str,
				user,
				activityDone: { [itemID]: quantity }
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
	const tame = await TamesTable.findOne({ where: { id: selectedTame as Number } });
	if (!tame) {
		throw new Error('No tame found for selected tame.');
	}
	const activity = await TameActivityTable.findOne({ where: { userID: user.id, tame, completed: false } });
	return [tame, activity];
}

export async function createTameTask({
	user,
	channelID,
	type,
	data,
	duration,
	selectedTame
}: {
	user: KlasaUser;
	channelID: string;
	type: TameType;
	data: TameTaskOptions;
	duration: number;
	selectedTame: TamesTable;
}) {
	const activity = new TameActivityTable();
	activity.userID = user.id;
	activity.startDate = new Date();
	activity.finishDate = new Date(Date.now() + duration);
	activity.completed = false;
	activity.type = type;
	activity.data = data;
	activity.channelID = channelID;
	activity.duration = Math.floor(duration);
	activity.tame = selectedTame;
	await activity.save();
	return activity;
}
