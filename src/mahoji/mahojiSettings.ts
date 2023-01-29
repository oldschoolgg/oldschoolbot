import type { Guild, Prisma, User, UserStats } from '@prisma/client';
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

import { CLIENT_ID } from '../config';
import { SILENT_ERROR } from '../lib/constants';
import { evalMathExpression } from '../lib/expressionParser';
import { KillableMonster } from '../lib/minions/types';
import { mahojiUserSettingsUpdate } from '../lib/MUser';
import { prisma } from '../lib/settings/prisma';
import { Rune } from '../lib/skilling/skills/runecraft';
import { hasGracefulEquipped, readableStatName } from '../lib/structures/Gear';
import type { ItemBank } from '../lib/types';
import {
	anglerBoosts,
	channelIsSendable,
	formatItemReqs,
	hasSkillReqs,
	itemNameFromID,
	validateItemBankAndThrow
} from '../lib/util';
import { deferInteraction, interactionReply } from '../lib/util/interactionReply';
import resolveItems from '../lib/util/resolveItems';

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

export async function userStatsBankUpdate(userID: string, key: keyof UserStats, bank: Bank) {
	await userStatsUpdate(userID, u => ({
		[key]: bank.clone().add(u[key] as ItemBank).bank
	}));
}

export async function multipleUserStatsBankUpdate(userID: string, updates: Partial<Record<keyof UserStats, Bank>>) {
	await userStatsUpdate(userID, u => {
		let updateObj: Prisma.UserStatsUpdateInput = {};
		for (const [key, bank] of objectEntries(updates)) {
			updateObj[key] = bank!.clone().add(u[key] as ItemBank).bank;
		}
		return updateObj;
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

export function calcMaxRCQuantity(rune: Rune, user: MUser) {
	const level = user.skillLevel('runecraft');
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
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
