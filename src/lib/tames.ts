/* eslint-disable no-case-declarations */
import { MessageCollector } from 'discord.js';
import { increaseNumByPercent, round, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Items, Monsters } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { collectables } from '../mahoji/lib/abstracted_commands/collectCommand';
import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import { getSimilarItems } from './data/similarItems';
import killableMonsters, { effectiveMonsters } from './minions/data/killableMonsters';
import { prisma, trackLoot } from './settings/prisma';
import { runCommand } from './settings/settings';
import { itemNameFromID, roll } from './util';
import { createCollector } from './util/createCollector';
import getOSItem from './util/getOSItem';
import { collectors } from './util/handleTripFinish';
import { makeBankImage } from './util/makeBankImage';
import { sendToChannelID } from './util/webhook';
import { Tame, tame_growth, TameActivity, User } from '.prisma/client';

export type Nursery = {
	egg: {
		species: number;
		insertedAt: number;
	} | null;
	eggsHatched: number;
	hasFuel: boolean;
} | null;

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

export enum TameSpeciesID {
	Igne = 1,
	Monkey = 2
}

export const tameSpecies: Species[] = [
	{
		id: TameSpeciesID.Igne,
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
			.add('Zenyte', 6)
			.add('Onyx', 10)
			.add('Draconic visage', 1)
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
			.add('Astral rune', 600)
			.add('Coins', 10_000_000),
		emoji: '<:dragonEgg:858948148641660948>',
		emojiID: '858948148641660948'
	},
	{
		id: TameSpeciesID.Monkey,
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
		emojiID: '883326001445224488',
		mergingCost: new Bank()
			.add('Banana', 3000)
			.add('Magic banana', 50)
			.add('Chimpling jar')
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
			.add('Astral rune', 600)
			.add('Coins', 10_000_000)
	}
];

export function tameHasBeenFed(tame: Tame, item: string | number) {
	const { id } = Items.get(item)!;
	const items = [id, ...getSimilarItems(id)];
	return items.some(i => Boolean((tame.fed_items as ItemBank)[i]));
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

function doubleLootCheck(tame: Tame, loot: Bank) {
	const hasMrE = tameHasBeenFed(tame, 'Mr. E');
	let doubleLootMsg = '';
	if (hasMrE && roll(12)) {
		loot.multiply(2);
		doubleLootMsg = '\n**2x Loot from Mr. E**';
	}

	return { loot, doubleLootMsg };
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
	emojiID: string;
}

export function shortTameTripDesc(activity: TameActivity) {
	const data = activity.data as unknown as TameTaskOptions;
	switch (data.type) {
		case TameType.Combat: {
			const mon = killableMonsters.find(i => i.id === data.monsterID);
			return `Killing ${mon!.name}`;
		}
		case TameType.Gatherer: {
			return `Collecting ${itemNameFromID(data.itemID)}`;
		}
		default:
			return 'Nothing';
	}
}

export async function runTameTask(activity: TameActivity, tame: Tame) {
	async function handleFinish(res: { loot: Bank; message: string; user: KlasaUser }) {
		const previousTameCl = new Bank({ ...(tame.max_total_loot as ItemBank) });

		await prisma.tame.update({
			where: {
				id: tame.id
			},
			data: {
				max_total_loot: previousTameCl.clone().add(res.loot.bank).bank
			}
		});

		const addRes = await addDurationToTame(tame, activity.duration);
		if (addRes) res.message += `\n${addRes}`;

		// TODO: make tames use buttons for continuing
		const continuationChar = 'y';
		res.message += `\nSay \`${continuationChar}\` to repeat this trip.`;

		sendToChannelID(activity.channel_id, {
			content: res.message,
			image: (
				await makeBankImage({
					bank: res.loot,
					title: `${tameName(tame)}'s Loot`,
					user: res.user,
					previousCL: previousTameCl
				})
			).file.buffer
		});

		createCollector({
			user: res.user,
			channelID: activity.channel_id,
			continuationCharacter: [continuationChar],
			toExecute: async (mes: KlasaMessage, collector: MessageCollector) => {
				if (globalClient.oneCommandAtATimeCache.has(mes.author.id)) {
					collector.stop();
					collectors.delete(mes.author.id);
					return;
				}
				globalClient.oneCommandAtATimeCache.add(mes.author.id);
				try {
					const activityData = activity.data as any as TameTaskOptions;
					switch (activityData.type) {
						case TameType.Combat:
							const monsterName = effectiveMonsters.find(e => e.id === activityData.monsterID)!.name;
							await runCommand({
								commandName: 'tames',
								args: {
									kill: {
										name: monsterName
									}
								},
								isContinue: true,
								bypassInhibitors: true,
								channelID: mes.channel.id,
								userID: mes.author.id,
								guildID: mes.guild?.id,
								user: mes.author,
								member: mes.member
							});
							break;
						case TameType.Gatherer:
							const collectableName = itemNameFromID(activityData.itemID)!.toLowerCase();
							await runCommand({
								commandName: 'tames',
								args: {
									collect: {
										name: collectableName
									}
								},
								isContinue: true,
								bypassInhibitors: true,
								channelID: mes.channel.id,
								userID: mes.author.id,
								guildID: mes.guild?.id,
								user: mes.author,
								member: mes.member
							});
							break;
						default:
							break;
					}
				} catch (err: any) {
					console.log({ err });
					mes.channel.send(err);
				} finally {
					setTimeout(() => globalClient.oneCommandAtATimeCache.delete(mes.author.id), 300);
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
					killQty = Math.ceil(increaseNumByPercent(killQty, 25));
				} else {
					for (let i = 0; i < quantity; i++) {
						if (roll(4)) killQty++;
					}
				}
			}
			const fullMonster = Monsters.get(monsterID)!;
			const loot = fullMonster.kill(killQty, {});
			const user = await globalClient.fetchUser(activity.user_id);
			let str = `${user}, ${tameName(tame)} finished killing ${quantity}x ${fullMonster.name}.`;
			const boosts = [];
			if (hasOri) {
				boosts.push('25% extra loot (ate an Ori)');
			}
			if (boosts.length > 0) {
				str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
			}
			const { doubleLootMsg } = doubleLootCheck(tame, loot);
			str += doubleLootMsg;
			const { itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: false });
			await trackLoot({
				duration: activity.duration,
				kc: activityData.quantity,
				id: fullMonster.name,
				changeType: 'loot',
				type: 'Monster',
				loot,
				suffix: 'tame'
			});
			handleFinish({
				loot: itemsAdded,
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
			const user = await globalClient.fetchUser(activity.user_id);
			let str = `${user}, ${tameName(tame)} finished collecting ${totalQuantity}x ${
				collectable.item.name
			}. (${Math.round((totalQuantity / (activity.duration / Time.Minute)) * 60).toLocaleString()}/hr)`;
			const { doubleLootMsg } = doubleLootCheck(tame, loot);
			str += doubleLootMsg;
			const { itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: false });
			handleFinish({
				loot: itemsAdded,
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

export async function tameLastFinishedActivity(user: User) {
	const tameID = user.selected_tame;
	if (!tameID) return null;
	return prisma.tameActivity.findFirst({
		where: {
			user_id: user.id,
			tame_id: tameID
		},
		orderBy: {
			finish_date: 'desc'
		}
	});
}

export function repeatTameTrip(msg: KlasaMessage, activity: TameActivity) {
	const data = activity.data as unknown as TameTaskOptions;
	switch (data.type) {
		case TameType.Combat: {
			const mon = killableMonsters.find(i => i.id === data.monsterID);
			return runCommand({
				commandName: 'tames',
				args: {
					kill: {
						name: mon!.name
					}
				},
				bypassInhibitors: true,
				channelID: msg.channel.id,
				userID: msg.author.id,
				guildID: msg.guild?.id,
				user: msg.author,
				member: msg.member
			});
		}
		case TameType.Gatherer: {
			return runCommand({
				commandName: 'tames',
				args: {
					collect: {
						name: itemNameFromID(data.itemID)
					}
				},
				bypassInhibitors: true,
				channelID: msg.channel.id,
				userID: msg.author.id,
				guildID: msg.guild?.id,
				user: msg.author,
				member: msg.member
			});
		}
		default: {
		}
	}
}

export async function getUsersTame(
	user: KlasaUser | User
): Promise<
	{ tame: null; activity: null; species: null } | { tame: Tame; species: Species; activity: TameActivity | null }
> {
	const selectedTame = (
		await mahojiUsersSettingsFetch(user.id, {
			selected_tame: true
		})
	).selected_tame;
	if (!selectedTame) {
		return {
			tame: null,
			activity: null,
			species: null
		};
	}
	const tame = await prisma.tame.findFirst({ where: { id: selectedTame } });
	if (!tame) {
		throw new Error('No tame found for selected tame.');
	}
	const activity = await prisma.tameActivity.findFirst({
		where: { user_id: user.id, tame_id: tame.id, completed: false }
	});
	const species = tameSpecies.find(i => i.id === tame.species_id)!;
	return { tame, activity, species };
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

export async function getAllUserTames(userID: bigint | string) {
	const tames = await prisma.tame.findMany({
		where: {
			user_id: userID.toString()
		},
		include: {
			tame_activity: {
				where: {
					completed: false
				}
			}
		}
	});
	return tames;
}
