import { MessageCollector } from 'discord.js';
import { round, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Items, Monsters } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { addBanks } from 'oldschooljs/dist/util';

import { client } from '..';
import { collectables } from '../commands/Minion/collect';
import BankImageTask from '../tasks/bankImage';
import { effectiveMonsters } from './minions/data/killableMonsters';
import { prisma } from './settings/prisma';
import { UserSettings } from './settings/types/UserSettings';
import { generateContinuationChar, itemNameFromID, roll } from './util';
import { createCollector } from './util/createCollector';
import getOSItem from './util/getOSItem';
import { collectors } from './util/handleTripFinish';
import { sendToChannelID } from './util/webhook';
import { Tame, tame_growth, TameActivity } from '.prisma/client';

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

export function tameHasBeenFed(tame: Tame, item: string | number) {
	const { id } = Items.get(item)!;
	return Boolean((tame.fed_items as ItemBank)[id]);
}

export function tameGrowthLevel(tame: Tame) {
	const growth = 3 - [tame_growth.baby, tame_growth.juvenile, tame_growth.adult].indexOf(tame.growth_stage);
	return growth;
}

export function getTameSpecies(tame: Tame) {
	return tameSpecies.find(s => s.id === tame.species_id)!;
}

export function getMainTameLevel(tame: Tame) {
	return tameGetLevel(tame, getTameSpecies(tame).relevantLevelCategory);
}

export function tameGetLevel(tame: Tame, type: 'combat' | 'gatherer' | 'support' | 'artisan') {
	const growth = tameGrowthLevel(tame);
	switch (type) {
		case 'combat':
			return round(tame.max_combat_level / growth, 2);
		case 'gatherer':
			return round(tame.max_gatherer_level / growth, 2);
		case 'support':
			return round(tame.max_support_level / growth, 2);
		case 'artisan':
			return round(tame.max_artisan_level / growth, 2);
	}
}

export function tameName(tame: Tame) {
	return `${tame.nickname ?? getTameSpecies(tame).name}`;
}

export function tameToString(tame: Tame) {
	let str = `${tameName(tame)} (`;
	str += [
		[tameGetLevel(tame, 'combat'), '<:combat:802136963956080650>'],
		[tameGetLevel(tame, 'artisan'), '<:artisan:802136963611885569>'],
		[tameGetLevel(tame, 'gatherer'), '<:gathering:802136963913613372>']
	]
		.map(([emoji, lvl]) => `${emoji}${lvl}`)
		.join(' ');
	str += ')';
	return str;
}

export async function addDurationToTame(tame: Tame, duration: number) {
	if (tame.growth_stage === tame_growth.adult) return null;
	const percentToAdd = duration / Time.Minute / 20;
	let newPercent = Math.max(1, Math.min(100, tame.growth_percent + percentToAdd));

	if (newPercent >= 100) {
		const newTame = await prisma.tame.update({
			where: {
				id: tame.id
			},
			data: {
				growth_stage: tame.growth_stage === tame_growth.baby ? tame_growth.juvenile : tame_growth.adult,
				growth_percent: 0
			}
		});
		return `Your tame has grown into a ${newTame.growth_stage}!`;
	}

	await prisma.tame.update({
		where: {
			id: tame.id
		},
		data: {
			growth_percent: newPercent
		}
	});

	return `Your tame has grown ${percentToAdd.toFixed(2)}%!`;
}

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

export async function runTameTask(activity: TameActivity, tame: Tame) {
	async function handleFinish(res: { loot: Bank; message: string; user: KlasaUser }) {
		const previousTameCl = { ...(tame.max_total_loot as ItemBank) };

		await prisma.tame.update({
			where: {
				id: tame.id
			},
			data: {
				max_total_loot: addBanks([tame.max_total_loot as ItemBank, res.loot.bank])
			}
		});

		const addRes = await addDurationToTame(tame, activity.duration);
		if (addRes) res.message += `\n${addRes}`;

		const continuationChar = generateContinuationChar(res.user);
		res.message += `\nSay \`${continuationChar}\` to repeat this trip.`;

		sendToChannelID(client, activity.channel_id, {
			content: res.message,
			image: (
				await (client.tasks.get('bankImage') as BankImageTask).generateBankImage(
					res.loot,
					`${tameName(tame)}'s Loot`,
					true,
					{ showNewCL: 1 },
					res.user,
					previousTameCl
				)
			).image!
		});

		createCollector({
			user: res.user,
			channelID: activity.channel_id,
			continuationCharacter: [continuationChar],
			toExecute: async (mes: KlasaMessage, collector: MessageCollector) => {
				if (client.oneCommandAtATimeCache.has(mes.author.id)) {
					collector.stop();
					collectors.delete(mes.author.id);
					return;
				}
				client.oneCommandAtATimeCache.add(mes.author.id);
				try {
					const activityData = activity.data as any as TameTaskOptions;
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
						default:
							break;
					}
				} catch (err: any) {
					console.log({ err });
					mes.channel.send(err);
				} finally {
					setTimeout(() => client.oneCommandAtATimeCache.delete(mes.author.id), 300);
				}
			}
		});
	}

	const activityData = activity.data as any as TameTaskOptions;
	switch (activityData.type) {
		case 'pvm': {
			const { quantity, monsterID } = activityData;
			let killQty = quantity;
			const hasOri = tameHasBeenFed(tame, 'Ori');
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
			const user = await client.fetchUser(activity.user_id);
			let str = `${user}, ${tameName(tame)} finished killing ${quantity}x ${fullMonster.name}.`;
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
				user
			});
			break;
		}
		case 'collect': {
			const { quantity, itemID } = activityData;
			const collectable = collectables.find(c => c.item.id === itemID)!;
			const totalQuantity = quantity * collectable.quantity;
			const loot = new Bank().add(collectable.item.id, totalQuantity);
			const user = await client.fetchUser(activity.user_id);
			let str = `${user}, ${tameName(tame)} finished collecting ${totalQuantity}x ${
				collectable.item.name
			}. (${Math.round((totalQuantity / (activity.duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
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

export async function getUsersTame(user: KlasaUser): Promise<[Tame | null, TameActivity | null]> {
	const selectedTame = user.settings.get(UserSettings.SelectedTame);
	if (!selectedTame) {
		return [null, null];
	}
	const tame = await prisma.tame.findFirst({ where: { id: selectedTame } });
	if (!tame) {
		throw new Error('No tame found for selected tame.');
	}
	const activity = await prisma.tameActivity.findFirst({
		where: { user_id: user.id, tame_id: tame.id, completed: false }
	});
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
	selectedTame: Tame;
}) {
	const activity = prisma.tameActivity.create({
		data: {
			user_id: user.id,
			start_date: new Date(),
			finish_date: new Date(Date.now() + duration),
			completed: false,
			type,
			data: data as any,
			channel_id: channelID,
			duration: Math.floor(duration),
			tame_id: selectedTame.id
		}
	});

	return activity;
}
