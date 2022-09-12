/* eslint-disable no-case-declarations */
import { userMention } from '@discordjs/builders';
import { GuildMember, MessageActionRow, MessageButton } from 'discord.js';
import { increaseNumByPercent, objectEntries, round, Time } from 'e';
import { KlasaUser } from 'klasa';
import { APIInteractionGuildMember } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc';

import { collectables } from '../mahoji/lib/abstracted_commands/collectCommand';
import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import { handleSpecialCoxLoot } from '../tasks/minions/minigames/raidsActivity';
import { getSimilarItems } from './data/similarItems';
import killableMonsters from './minions/data/killableMonsters';
import { customDemiBosses } from './minions/data/killableMonsters/custom/demiBosses';
import { KillableMonster } from './minions/types';
import { prisma, trackLoot } from './settings/prisma';
import { runCommand } from './settings/settings';
import { assert, channelIsSendable, itemNameFromID, roll } from './util';
import getOSItem from './util/getOSItem';
import { makeBankImageKlasa } from './util/makeBankImage';
import resolveItems from './util/resolveItems';
import { Tame, tame_growth, TameActivity, User } from '.prisma/client';

export enum TameSpeciesID {
	Igne = 1,
	Monkey = 2
}

export const igneArmors = [
	{
		item: getOSItem('Dragon igne armor'),
		coxDeathChance: 85,
		foodReduction: 5
	},
	{
		item: getOSItem('Barrows igne armor'),
		coxDeathChance: 75,
		foodReduction: 8
	},
	{
		item: getOSItem('Volcanic igne armor'),
		coxDeathChance: 65,
		foodReduction: 10
	},
	{
		item: getOSItem('Justiciar igne armor'),
		coxDeathChance: 50,
		foodReduction: 15
	},
	{
		item: getOSItem('Drygore igne armor'),
		coxDeathChance: 30,
		foodReduction: 22
	},
	{
		item: getOSItem('Dwarven igne armor'),
		coxDeathChance: 10,
		foodReduction: 27
	},
	{
		item: getOSItem('Gorajan igne armor'),
		coxDeathChance: 5,
		foodReduction: 33
	}
].map(i => ({ ...i, tameSpecies: [TameSpeciesID.Igne], slot: 'equipped_armor' as const }));

export type TameKillableMonster = {
	loot: (opts: { quantity: number; tame: Tame }) => Bank;
	deathChance?: (opts: { tame: Tame }) => number;
	oriWorks?: false;
	mustBeAdult?: true;
	minArmorTier?: Item;
} & Omit<KillableMonster, 'table'>;

function calcPointsForTame(tame: Tame) {
	const lvl = tame.max_combat_level;
	if (lvl < 75) return 25_000;
	if (lvl < 80) return 26_500;
	if (lvl < 85) return 28_000;
	if (lvl < 90) return 30_000;
	return 35_000;
}

export const tameKillableMonsters: TameKillableMonster[] = [
	{
		id: 334_912,
		name: 'Chambers of Xeric',
		aliases: ['cox', 'chambers of xeric'],
		timeToFinish: Time.Minute * 90,
		emoji: '<:Dharoks_helm:403038864199122947>',
		wildy: false,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		loot({ quantity, tame }) {
			let loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				loot.add(
					ChambersOfXeric.complete({ team: [{ id: '1', personalPoints: calcPointsForTame(tame) }] })['1']
				);
				handleSpecialCoxLoot(loot);
			}

			return loot;
		},
		deathChance: ({ tame }) => {
			const armorEquipped = tame.equipped_armor;
			if (!armorEquipped) return 95;
			const armorObj = igneArmors.find(i => i.item.id === armorEquipped)!;
			assert(Boolean(armorObj), `${armorEquipped} not valid armor`);
			return armorObj.coxDeathChance;
		},
		healAmountNeeded: 1588,
		mustBeAdult: true,
		oriWorks: false,
		itemCost: {
			qtyPerKill: 1,
			itemCost: new Bank().add('Stamina potion(4)', 2)
		}
	},
	...killableMonsters.map(
		(i): TameKillableMonster => ({
			...i,
			loot: ({ quantity }) => {
				return i.table.kill(quantity, {});
			}
		})
	)
];

const overrides = [
	{
		id: customDemiBosses.Nihiliz.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.Treebeard.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.QueenBlackDragon.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.SeaKraken.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.Malygos.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	}
] as const;

for (const override of overrides) {
	const obj = tameKillableMonsters.find(i => i.id === override.id)!;
	for (const [key, val] of objectEntries(override)) {
		// @ts-ignore trust me
		obj[key] = val;
	}
}

export async function getIgneTameKC(tame: Tame) {
	const result = await prisma.$queryRaw<
		{ mid: number; kc: number }[]
	>`SELECT (data->>'monsterID')::int AS mid, SUM((data->>'quantity')::int) AS kc
										  FROM tame_activity
										  WHERE tame_id = ${tame.id}
										  AND completed = true
										  GROUP BY data->>'monsterID';`;
	let namedBank: Record<string, number> = {};
	let idBank: Record<number, number> = {};
	for (const { mid, kc } of result) {
		const mon = tameKillableMonsters.find(i => i.id === mid);
		if (!mon) continue;
		namedBank[mon.name] = kc;
		idBank[mon.id] = kc;
	}

	return { namedBank, idBank, sortedTuple: Object.entries(namedBank).sort((a, b) => b[1] - a[1]) };
}

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
			const mon = tameKillableMonsters.find(i => i.id === data.monsterID);
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
	async function handleFinish(res: { loot: Bank | null; message: string; user: KlasaUser }) {
		const previousTameCl = new Bank({ ...(tame.max_total_loot as ItemBank) });

		if (res.loot) {
			await prisma.tame.update({
				where: {
					id: tame.id
				},
				data: {
					max_total_loot: previousTameCl.clone().add(res.loot.bank).bank
				}
			});
		}
		const addRes = await addDurationToTame(tame, activity.duration);
		if (addRes) res.message += `\n${addRes}`;

		const channel = globalClient.channels.cache.get(activity.channel_id);
		if (!channelIsSendable(channel)) return;
		channel.send({
			content: res.message,
			components: [
				new MessageActionRow().addComponents(
					new MessageButton().setCustomID('REPEAT_TAME_TRIP').setLabel('Repeat Trip').setStyle('SECONDARY')
				)
			],
			...(res.loot
				? await makeBankImageKlasa({
						bank: res.loot,
						title: `${tameName(tame)}'s Loot`,
						user: res.user,
						previousCL: previousTameCl
				  })
				: {})
		});
	}
	const user = await globalClient.fetchUser(activity.user_id);

	const activityData = activity.data as any as TameTaskOptions;
	switch (activityData.type) {
		case 'pvm': {
			const { quantity, monsterID } = activityData;
			const mon = tameKillableMonsters.find(i => i.id === monsterID)!;

			let killQty = quantity - activity.deaths;
			if (killQty < 1) {
				handleFinish({
					loot: null,
					message: `${userMention(user.id)}, Your tame died in all their attempts to kill ${
						mon.name
					}. Get them some better armor!`,
					user
				});
				return;
			}
			const hasOri = tameHasBeenFed(tame, 'Ori');

			const oriIsApplying = hasOri && mon.oriWorks !== false;
			// If less than 8 kills, roll 25% chance per kill
			if (oriIsApplying) {
				if (killQty >= 8) {
					killQty = Math.ceil(increaseNumByPercent(killQty, 25));
				} else {
					for (let i = 0; i < quantity; i++) {
						if (roll(4)) killQty++;
					}
				}
			}
			const loot = mon.loot({ quantity: killQty, tame });
			let str = `${user}, ${tameName(tame)} finished killing ${quantity}x ${mon.name}.${
				activity.deaths > 0 ? ` ${tameName(tame)} died ${activity.deaths}x times.` : ''
			}`;
			const boosts = [];
			if (oriIsApplying) {
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
				id: mon.name,
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

export async function repeatTameTrip({
	channelID,
	userID,
	guildID,
	user,
	member
}: {
	channelID: string | bigint;
	userID: string | bigint;
	guildID: string | bigint | undefined;
	user: User;
	member: APIInteractionGuildMember | GuildMember | null;
}) {
	const activity = await tameLastFinishedActivity(user);
	if (!activity) {
		return;
	}
	const data = activity.data as unknown as TameTaskOptions;
	switch (data.type) {
		case TameType.Combat: {
			const mon = tameKillableMonsters.find(i => i.id === data.monsterID);
			return runCommand({
				commandName: 'tames',
				args: {
					kill: {
						name: mon!.name
					}
				},
				bypassInhibitors: true,
				channelID,
				userID,
				guildID,
				user,
				member
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
				channelID,
				userID,
				guildID,
				user,
				member
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
	selectedTame,
	fakeDuration,
	deaths
}: {
	user: KlasaUser;
	channelID: string;
	type: TameType;
	data: TameTaskOptions;
	duration: number;
	selectedTame: Tame;
	fakeDuration?: number;
	deaths?: number;
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
			tame_id: selectedTame.id,
			fake_duration: fakeDuration,
			deaths
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
