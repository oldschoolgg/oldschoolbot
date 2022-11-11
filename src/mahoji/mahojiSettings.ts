import type { ClientStorage, Guild, Prisma, User, UserStats } from '@prisma/client';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	Guild as DJSGuild,
	InteractionResponseType,
	Routes
} from 'discord.js';
import { noOp, objectEntries, round, Time } from 'e';
import LRUCache from 'lru-cache';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import PromiseQueue from 'p-queue';

import { CLIENT_ID } from '../config';
import { deduplicateClueScrolls } from '../lib/clues/clueUtils';
import { SILENT_ERROR } from '../lib/constants';
import { evalMathExpression } from '../lib/expressionParser';
import { effectiveMonsters } from '../lib/minions/data/killableMonsters';
import { KillableMonster } from '../lib/minions/types';
import { getMinigameScore, Minigames } from '../lib/settings/minigames';
import { prisma } from '../lib/settings/prisma';
import creatures from '../lib/skilling/skills/hunter/creatures';
import { Rune } from '../lib/skilling/skills/runecraft';
import { filterLootReplace } from '../lib/slayer/slayerUtil';
import { hasGracefulEquipped, readableStatName } from '../lib/structures/Gear';
import type { ItemBank } from '../lib/types';
import {
	anglerBoosts,
	channelIsSendable,
	formatItemReqs,
	hasSkillReqs,
	itemNameFromID,
	sanitizeBank,
	stringMatches,
	validateItemBankAndThrow
} from '../lib/util';
import { deferInteraction, interactionReply } from '../lib/util/interactionReply';
import resolveItems from '../lib/util/resolveItems';
import { bingoIsActive, determineBingoProgress, onFinishTile } from './lib/bingo';
import { mahojiUserSettingsUpdate } from './settingsUpdate';

export function mahojiParseNumber({
	input,
	min,
	max
}: {
	input: number | string | undefined | null;
	min?: number;
	max?: number;
}): number | null {
	if (input === undefined || input === null) return null;
	const parsed = typeof input === 'number' ? input : evalMathExpression(input);
	if (parsed === null) return null;
	if (min && parsed < min) return null;
	if (max && parsed > max) return null;
	if (Number.isNaN(parsed)) return null;
	return parsed;
}

async function silentButtonAck(interaction: ButtonInteraction) {
	return globalClient.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate
		}
	});
}

export async function handleMahojiConfirmation(
	interaction: ChatInputCommandInteraction,
	str: string,
	_users?: string[]
) {
	const channel = globalClient.channels.cache.get(interaction.channelId.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	if (!interaction.deferred) {
		await deferInteraction(interaction);
	}

	const users = _users ?? [interaction.user.id];
	let confirmed: string[] = [];
	const isConfirmed = () => confirmed.length === users.length;
	const confirmMessage = await channel.send({
		content: str,
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder({
					label: 'Confirm',
					style: ButtonStyle.Primary,
					customId: 'CONFIRM'
				}),
				new ButtonBuilder({
					label: 'Cancel',
					style: ButtonStyle.Secondary,
					customId: 'CANCEL'
				})
			])
		]
	});

	return new Promise<void>(async (resolve, reject) => {
		const collector = confirmMessage.createMessageComponentCollector<ComponentType.Button>({
			time: Time.Second * 15
		});

		async function confirm(id: string) {
			if (confirmed.includes(id)) return;
			confirmed.push(id);
			if (!isConfirmed()) return;
			collector.stop();
			await confirmMessage.delete().catch(noOp);
			resolve();
		}

		let cancelled = false;
		const cancel = async (reason: 'time' | 'cancel') => {
			if (cancelled) return;
			cancelled = true;
			await confirmMessage.delete().catch(noOp);
			if (!interaction.replied) {
				await interactionReply(interaction, {
					content: reason === 'cancel' ? 'The confirmation was cancelled.' : 'You did not confirm in time.',
					ephemeral: true
				});
			}
			collector.stop();
			reject(new Error(SILENT_ERROR));
		};

		collector.on('collect', i => {
			const { id } = i.user;
			if (!users.includes(id)) {
				i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
				return;
			}
			if (i.customId === 'CANCEL') {
				cancel('cancel');
				return;
			}
			if (i.customId === 'CONFIRM') {
				silentButtonAck(i);
				confirm(id);
			}
		});

		collector.on('end', () => {
			if (!isConfirmed()) {
				cancel('time');
			}
		});
	});
}

/**
 *
 * User
 *
 */

// Is not typesafe, returns only what is selected, but will say it contains everything.
export async function mahojiUsersSettingsFetch(user: bigint | string, select?: Prisma.UserSelect) {
	const result = await prisma.user.upsert({
		where: {
			id: user.toString()
		},
		select,
		create: {
			id: user.toString()
		},
		update: {}
	});
	if (!result) throw new Error(`mahojiUsersSettingsFetch returned no result for ${user}`);
	return result as User;
}

/**
 *
 * Guild
 *
 */

export const untrustedGuildSettingsCache = new LRUCache<string, Guild>({ max: 5000 });

export async function mahojiGuildSettingsFetch(guild: string | DJSGuild) {
	const id = typeof guild === 'string' ? guild : guild.id;
	const result = await prisma.guild.upsert({
		where: {
			id
		},
		update: {},
		create: {
			id
		}
	});
	untrustedGuildSettingsCache.set(id, result);
	return result;
}

export async function mahojiGuildSettingsUpdate(guild: string | DJSGuild, data: Prisma.GuildUpdateArgs['data']) {
	const guildID = typeof guild === 'string' ? guild : guild.id;

	const newGuild = await prisma.guild.update({
		data,
		where: {
			id: guildID
		}
	});
	untrustedGuildSettingsCache.set(newGuild.id, newGuild);
	return { newGuild };
}

export function patronMsg(tierNeeded: number) {
	return `You need to be a Tier ${
		tierNeeded - 1
	} Patron to use this command. You can become a patron to support the bot here: <https://www.patreon.com/oldschoolbot>`;
}

// Is not typesafe, returns only what is selected, but will say it contains everything.
export async function mahojiClientSettingsFetch(select?: Prisma.ClientStorageSelect) {
	const clientSettings = await prisma.clientStorage.findFirst({
		where: {
			id: CLIENT_ID
		},
		select
	});
	return clientSettings as ClientStorage;
}

export async function mahojiClientSettingsUpdate(data: Prisma.ClientStorageUpdateInput) {
	await prisma.clientStorage.update({
		where: {
			id: CLIENT_ID
		},
		data
	});
}

export function getMahojiBank(user: User) {
	return new Bank(user.bank as ItemBank);
}

export async function userStatsUpdate(userID: string, data: (u: UserStats) => Prisma.UserStatsUpdateInput) {
	const id = BigInt(userID);
	const userStats = await prisma.userStats.upsert({
		create: {
			user_id: id
		},
		update: {},
		where: {
			user_id: id
		}
	});
	await prisma.userStats.update({
		data: data(userStats),
		where: {
			user_id: id
		}
	});
}

type UserStatsBankKey =
	| 'puropuro_implings_bank'
	| 'passive_implings_bank'
	| 'create_cost_bank'
	| 'create_loot_bank'
	| 'bird_eggs_offered_bank';
export async function userStatsBankUpdate(userID: string, key: UserStatsBankKey, bank: Bank) {
	await userStatsUpdate(userID, u => ({
		[key]: bank.clone().add(u[key] as ItemBank).bank
	}));
}

export const userQueues: Map<string, PromiseQueue> = new Map();
export function getUserUpdateQueue(userID: string) {
	let currentQueue = userQueues.get(userID);
	if (!currentQueue) {
		let queue = new PromiseQueue({ concurrency: 1 });
		userQueues.set(userID, queue);
		return queue;
	}
	return currentQueue;
}

async function userQueueFn<T>(userID: string, fn: () => Promise<T>) {
	const queue = getUserUpdateQueue(userID);
	return queue.add(() => fn());
}

interface TransactItemsArgs {
	userID: string;
	itemsToAdd?: Bank;
	itemsToRemove?: Bank;
	collectionLog?: boolean;
	filterLoot?: boolean;
	dontAddToTempCL?: boolean;
}

declare global {
	const transactItems: typeof transactItemsFromBank;
}
declare global {
	namespace NodeJS {
		interface Global {
			transactItems: typeof transactItemsFromBank;
		}
	}
}
global.transactItems = transactItemsFromBank;
export async function transactItemsFromBank({
	userID,
	collectionLog = false,
	filterLoot = true,
	dontAddToTempCL = false,
	...options
}: TransactItemsArgs) {
	let itemsToAdd = options.itemsToAdd ? options.itemsToAdd.clone() : undefined;
	let itemsToRemove = options.itemsToRemove ? options.itemsToRemove.clone() : undefined;
	return userQueueFn(userID, async () => {
		const settings = await mUserFetch(userID);
		const currentBank = new Bank().add(settings.user.bank as ItemBank);
		const previousCL = new Bank().add(settings.user.collectionLogBank as ItemBank);
		const previousTempCL = new Bank().add(settings.user.temp_cl as ItemBank);

		let clUpdates: Prisma.UserUpdateArgs['data'] = {};
		if (itemsToAdd) {
			itemsToAdd = deduplicateClueScrolls({
				loot: itemsToAdd.clone(),
				currentBank: currentBank.clone().remove(itemsToRemove ?? {})
			});
			const { bankLoot, clLoot } = filterLoot
				? filterLootReplace(settings.allItemsOwned(), itemsToAdd)
				: { bankLoot: itemsToAdd, clLoot: itemsToAdd };
			itemsToAdd = bankLoot;

			clUpdates = collectionLog ? settings.calculateAddItemsToCLUpdates({ items: clLoot, dontAddToTempCL }) : {};
		}

		let gpUpdate: { increment: number } | undefined = undefined;
		if (itemsToAdd) {
			const coinsInLoot = itemsToAdd.amount('Coins');
			if (coinsInLoot > 0) {
				gpUpdate = {
					increment: coinsInLoot
				};
				itemsToAdd.remove('Coins', itemsToAdd.amount('Coins'));
			}
		}

		const newBank = new Bank().add(currentBank);
		if (itemsToAdd) newBank.add(itemsToAdd);

		sanitizeBank(newBank);

		if (itemsToRemove) {
			if (itemsToRemove.has('Coins')) {
				if (!gpUpdate) {
					gpUpdate = {
						increment: 0 - itemsToRemove.amount('Coins')
					};
				} else {
					gpUpdate.increment -= itemsToRemove.amount('Coins');
				}
				itemsToRemove.remove('Coins', itemsToRemove.amount('Coins'));
			}
			if (!newBank.has(itemsToRemove)) {
				throw new Error(
					`Tried to remove ${itemsToRemove} from ${userID}. but they don't own them. Missing: ${itemsToRemove
						.clone()
						.remove(currentBank)}`
				);
			}
			newBank.remove(itemsToRemove);
		}

		const { newUser } = await mahojiUserSettingsUpdate(userID, {
			bank: newBank.bank,
			GP: gpUpdate,
			...clUpdates
		});

		const itemsAdded = new Bank().add(itemsToAdd);
		if (itemsAdded && gpUpdate && gpUpdate.increment > 0) {
			itemsAdded.add('Coins', gpUpdate.increment);
		}

		const itemsRemoved = new Bank().add(itemsToRemove);
		if (itemsRemoved && gpUpdate && gpUpdate.increment < 0) {
			itemsRemoved.add('Coins', gpUpdate.increment);
		}

		const newCL = new Bank(newUser.collectionLogBank as ItemBank);
		const newTempCL = new Bank(newUser.temp_cl as ItemBank);

		if (newUser.bingo_tickets_bought > 0 && bingoIsActive()) {
			const before = determineBingoProgress(previousTempCL);
			const after = determineBingoProgress(newTempCL);
			// If they finished a tile, process it.
			if (before.tilesCompletedCount !== after.tilesCompletedCount) {
				onFinishTile(newUser, before, after);
			}
		}

		return {
			previousCL,
			itemsAdded,
			itemsRemoved: itemsToRemove,
			newBank: new Bank(newUser.bank as ItemBank),
			newCL,
			newUser
		};
	});
}

export async function updateGPTrackSetting(
	setting:
		| 'gp_luckypick'
		| 'gp_daily'
		| 'gp_open'
		| 'gp_dice'
		| 'gp_slots'
		| 'gp_sell'
		| 'gp_pvm'
		| 'gp_alch'
		| 'gp_pickpocket'
		| 'duelTaxBank',
	amount: number,
	user?: MUser
) {
	if (!user) {
		await prisma.clientStorage.update({
			where: {
				id: CLIENT_ID
			},
			data: {
				[setting]: {
					increment: amount
				}
			}
		});
		return;
	}
	await user.update({
		[setting]: {
			increment: amount
		}
	});
}

export function userHasGracefulEquipped(user: MUser) {
	const rawGear = user.gear;
	for (const i of Object.values(rawGear)) {
		if (hasGracefulEquipped(i)) return true;
	}
	return false;
}

export function anglerBoostPercent(user: MUser) {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	let boostPercent = 0;
	for (const [id, percent] of anglerBoosts) {
		if (skillingSetup.hasEquipped([id])) {
			boostPercent += percent;
			amountEquipped++;
		}
	}
	if (amountEquipped === 4) {
		boostPercent += 0.5;
	}
	return round(boostPercent, 1);
}

const rogueOutfit = resolveItems(['Rogue mask', 'Rogue top', 'Rogue trousers', 'Rogue gloves', 'Rogue boots']);

export function rogueOutfitPercentBonus(user: MUser): number {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	for (const id of rogueOutfit) {
		if (skillingSetup.hasEquipped([id])) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}

export function hasMonsterRequirements(user: MUser, monster: KillableMonster) {
	if (monster.qpRequired && user.QP < monster.qpRequired) {
		return [
			false,
			`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`/activities quest\``
		];
	}

	if (monster.itemsRequired) {
		const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
		for (const item of monster.itemsRequired) {
			if (Array.isArray(item)) {
				if (!item.some(itemReq => user.hasEquippedOrInBank(itemReq as number))) {
					return [false, `You need these items to kill ${monster.name}: ${itemsRequiredStr}`];
				}
			} else if (!user.hasEquippedOrInBank(item)) {
				return [
					false,
					`You need ${itemsRequiredStr} to kill ${monster.name}. You're missing ${itemNameFromID(item)}.`
				];
			}
		}
	}

	if (monster.levelRequirements) {
		const [hasReqs, str] = hasSkillReqs(user, monster.levelRequirements);
		if (!hasReqs) {
			return [false, `You don't meet the skill requirements to kill ${monster.name}, you need: ${str}.`];
		}
	}

	if (monster.minimumGearRequirements) {
		for (const [setup, requirements] of objectEntries(monster.minimumGearRequirements)) {
			const gear = user.gear[setup];
			if (setup && requirements) {
				const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(requirements);
				if (!meetsRequirements) {
					return [
						false,
						`You don't have the requirements to kill ${monster.name}! Your ${readableStatName(
							unmetKey!
						)} stat in your ${setup} setup is ${has}, but you need atleast ${
							monster.minimumGearRequirements[setup]![unmetKey!]
						}.`
					];
				}
			}
		}
	}

	return [true];
}

export function resolveAvailableItemBoosts(user: MUser, monster: KillableMonster) {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = parseInt(itemID);
				if (monster.wildy ? !user.hasEquipped(parsedId) : !user.hasEquippedOrInBank(parsedId)) {
					continue;
				}
				if (boostAmount > highestBoostAmount) {
					highestBoostAmount = boostAmount;
					highestBoostItem = parsedId;
				}
			}

			if (highestBoostAmount && highestBoostItem) {
				boosts.add(highestBoostItem, highestBoostAmount);
			}
		}
	}
	return boosts.bank;
}

export async function getKCByName(user: MUser, kcName: string): Promise<[string, number] | [null, 0]> {
	const mon = effectiveMonsters.find(
		mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (mon) {
		return [mon.name, user.getKC((mon as unknown as Monster).id)];
	}

	const minigame = Minigames.find(
		game => stringMatches(game.name, kcName) || game.aliases.some(alias => stringMatches(alias, kcName))
	);
	if (minigame) {
		return [minigame.name, await getMinigameScore(user.id, minigame.column)];
	}

	const creature = creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));
	if (creature) {
		return [creature.name, user.getCreatureScore(creature.id)];
	}

	const special: [string[], number][] = [
		[['superior', 'superiors', 'superior slayer monster'], user.user.slayer_superior_count],
		[['tithefarm', 'tithe'], user.user.stats_titheFarmsCompleted]
	];
	const res = special.find(s => s[0].includes(kcName));
	if (res) {
		return [res[0][0], res[1]];
	}

	return [null, 0];
}

export function calcMaxRCQuantity(rune: Rune, user: MUser) {
	const level = user.skillLevel('runecraft');
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

type ClientBankKey =
	| 'sold_items_bank'
	| 'herblore_cost_bank'
	| 'construction_cost_bank'
	| 'farming_cost_bank'
	| 'farming_loot_bank'
	| 'buy_cost_bank'
	| 'buy_loot_bank'
	| 'magic_cost_bank'
	| 'crafting_cost'
	| 'gnome_res_cost'
	| 'gnome_res_loot'
	| 'rogues_den_cost'
	| 'gauntlet_loot'
	| 'cox_cost'
	| 'cox_loot'
	| 'collecting_cost'
	| 'collecting_loot'
	| 'mta_cost'
	| 'bf_cost'
	| 'mage_arena_cost'
	| 'hunter_cost'
	| 'hunter_loot'
	| 'revs_cost'
	| 'revs_loot'
	| 'inferno_cost'
	| 'dropped_items'
	| 'runecraft_cost'
	| 'smithing_cost'
	| 'economyStats_dicingBank'
	| 'economyStats_duelTaxBank'
	| 'economyStats_dailiesAmount'
	| 'economyStats_itemSellTaxBank'
	| 'economyStats_bankBgCostBank'
	| 'economyStats_sacrificedBank'
	| 'economyStats_wintertodtCost'
	| 'economyStats_wintertodtLoot'
	| 'economyStats_fightCavesCost'
	| 'economyStats_PVMCost'
	| 'economyStats_thievingCost'
	| 'nightmare_cost'
	| 'create_cost'
	| 'create_loot'
	| 'tob_cost'
	| 'tob_loot'
	| 'degraded_items_cost'
	| 'tks_cost'
	| 'tks_loot'
	| 'gotr_cost'
	| 'gotr_loot'
	| 'nex_cost'
	| 'nex_loot';

export async function updateBankSetting(key: ClientBankKey, bankToAdd: Bank) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${key}`);
	const currentClientSettings = await mahojiClientSettingsFetch({
		[key]: true
	});
	const current = currentClientSettings[key] as ItemBank;
	validateItemBankAndThrow(current);
	const newBank = new Bank().add(current).add(bankToAdd);

	const res = await mahojiClientSettingsUpdate({
		[key]: newBank.bank
	});
	return res;
}

export async function updateLegacyUserBankSetting(userID: string, key: 'tob_cost' | 'tob_loot', bankToAdd: Bank) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${key}`);
	const currentUserSettings = await mahojiUsersSettingsFetch(userID, {
		[key]: true
	});
	const current = currentUserSettings[key] as ItemBank;
	validateItemBankAndThrow(current);
	const newBank = new Bank().add(current).add(bankToAdd);

	const res = await mahojiUserSettingsUpdate(userID, {
		[key]: newBank.bank
	});
	return res;
}
