import { type APIApplicationCommandOptionChoice, SpecialResponse } from '@oldschoolgg/discord';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Bank, type ItemBank, Items } from 'oldschooljs';
import { z } from 'zod';

import { economy_transaction_type } from '@/prisma/main/enums.js';
import type { Prisma, User } from '@/prisma/main.js';
import { BitField, Channel } from '@/lib/constants.js';
import { customItems } from '@/lib/customItems/util.js';
import { allDcSet } from '@/lib/data/Collections.js';
import { ZItemBank } from '@/lib/structures/Bank.js';
import { dmCyrAudit, sendCyrCriticalBotLog } from '@/lib/util/cyrAudit.js';
import { userQueueFn } from '@/lib/util/userQueues.js';

export type StaffBestowRole = keyof typeof StaffGrantRoleSources;
export const StaffBestowPeriods = ['hourly', 'daily', 'weekly', 'monthly'] as const;
export type StaffBestowPeriod = (typeof StaffBestowPeriods)[number];
export type StaffBestowSourceKey = StaffBestowRole | string;

export const StaffGrantRoleSources = {
	mod: BitField.Moderator,
	contrib: BitField.Contributor,
	wiki: BitField.WikiContributor
} as const;

type StaffBestowUser = Pick<User, 'id' | 'bitfield' | 'rp_bestow_bank'>;
const StaffGrantRoleSourceEntries = Object.entries(StaffGrantRoleSources) as [StaffBestowRole, BitField][];
const StaffGrantRoleSourceKeys = new Set(Object.keys(StaffGrantRoleSources));
export const StaffBestowBits: BitField[] = Object.values(StaffGrantRoleSources);
export const MAX_STAFF_BESTOW_QUANTITY = 10_000;

const StaffBestowSourceKey = z
	.string()
	.refine(key => StaffGrantRoleSourceKeys.has(key) || isValidDiscordSnowflake(key), {
		message: 'Staff bestow schedule key must be "wiki", "mod", "contrib", or a Discord user ID.'
	});

export const ZStaffGrants = z
	.object({
		hourly: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		daily: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		weekly: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		monthly: z.record(StaffBestowSourceKey, ZItemBank).optional()
	})
	.strict();

export const ZExtraSettings = z
	.object({
		tradeEnableEmbed: z.boolean().default(false),
		tradeMaxPull: z.number().int().positive().default(70),
		tradeTimeout: z.number().int().positive().default(15),
		tradeEmbedTimeout: z.number().int().positive().default(25)
	})
	.strict();

export type StaffGrants = z.infer<typeof ZStaffGrants>;
export type IExtraSettings = z.infer<typeof ZExtraSettings>;

export function canUserBestow(user: MUser) {
	return user.bitfield.some(bit => StaffBestowBits.includes(bit));
}
export function getStaffBestowRole(user: MUser | StaffBestowUser): StaffBestowRole | null {
	for (const [sourceKey, bitfield] of StaffGrantRoleSourceEntries) {
		if (user.bitfield.includes(bitfield)) return sourceKey;
	}
	return null;
}

function getBestowBankJSON(user: MUser | Pick<User, 'rp_bestow_bank'>): ItemBank {
	return (('user' in user ? user.user.rp_bestow_bank : user.rp_bestow_bank) ?? {}) as ItemBank;
}

function getStaffBestowSourceKey(
	schedule: StaffGrants,
	user: MUser | StaffBestowUser,
	period: StaffBestowPeriod
): StaffBestowSourceKey | null {
	const periodLimits = schedule[period];
	if (!periodLimits) return null;
	if (periodLimits[user.id]) return user.id;
	const role = getStaffBestowRole(user);
	return role && periodLimits[role] ? role : null;
}

function topUpToLimit(current: Bank, limit: ItemBank): Bank {
	const added = new Bank();
	const periodLimit = new Bank(limit);
	for (const [item, maxQuantity] of periodLimit.items()) {
		const currentQuantity = current.amount(item.id);
		if (currentQuantity >= maxQuantity) continue;
		const quantityToAdd = maxQuantity - currentQuantity;
		current.add(item.id, quantityToAdd);
		added.add(item.id, quantityToAdd);
	}
	return added;
}

function replenishStaffBestowBank({
	current,
	schedule,
	user,
	periods
}: {
	current: Bank;
	schedule: StaffGrants;
	user: MUser | StaffBestowUser;
	periods: StaffBestowPeriod[];
}) {
	const added = new Bank();

	for (const period of periods) {
		const sourceKey = getStaffBestowSourceKey(schedule, user, period);
		if (!sourceKey) continue;
		const limit = schedule[period]?.[sourceKey];
		if (limit) added.add(topUpToLimit(current, limit));
	}

	return added;
}

function getStaffBestowPeriodUserWhere(schedule: StaffGrants, period: StaffBestowPeriod): Prisma.UserWhereInput[] {
	const periodLimits = schedule[period];
	if (!periodLimits) return [];

	const sourceKeys = Object.keys(periodLimits);
	const userIDs = sourceKeys.filter(key => !StaffGrantRoleSourceKeys.has(key));
	const roleBitfields = StaffGrantRoleSourceEntries.filter(([sourceKey]) => sourceKeys.includes(sourceKey)).map(
		([, bitfield]) => bitfield
	);
	const userWhere: Prisma.UserWhereInput[] = [];

	if (userIDs.length > 0) {
		userWhere.push({ id: { in: userIDs } });
	}
	if (roleBitfields.length > 0) {
		userWhere.push({
			bitfield: {
				hasSome: roleBitfields
			}
		});
	}

	return userWhere;
}

export async function runStaffBestowReplenishment(periods: StaffBestowPeriod[]) {
	if (periods.length === 0) return;

	const schedule = await Cache.getStaffGrantsSchedule();
	const configuredPeriods = periods.filter(period => schedule[period]);
	if (configuredPeriods.length === 0) return;

	const usersByID = new Map<string, { user: StaffBestowUser; periods: StaffBestowPeriod[] }>();
	for (const period of configuredPeriods) {
		const userWhere = getStaffBestowPeriodUserWhere(schedule, period);
		if (userWhere.length === 0) continue;

		const users = await prisma.user.findMany({
			where: {
				OR: userWhere
			},
			select: {
				id: true,
				bitfield: true,
				rp_bestow_bank: true
			}
		});

		for (const user of users) {
			if (!getStaffBestowSourceKey(schedule, user, period)) continue;
			const existing = usersByID.get(user.id);
			if (existing) {
				existing.periods.push(period);
			} else {
				usersByID.set(user.id, { user, periods: [period] });
			}
		}
	}

	for (const { user, periods: userPeriods } of usersByID.values()) {
		if (userPeriods.length === 0) continue;

		await userQueueFn(user.id, async () => {
			const freshUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					bitfield: true,
					rp_bestow_bank: true
				}
			});
			if (!freshUser) return;

			const rewardBank = new Bank(getBestowBankJSON(freshUser));
			const added = replenishStaffBestowBank({
				current: rewardBank,
				schedule,
				user: freshUser,
				periods: userPeriods
			});
			if (added.length === 0) return;

			await prisma.user.update({
				where: { id: user.id },
				data: {
					rp_bestow_bank: rewardBank.toJSON()
				},
				select: { id: true }
			});
		});
	}
}

export async function autocompleteStaffBestowRewards({
	user,
	value
}: {
	user: MUser;
	value: string;
}): Promise<APIApplicationCommandOptionChoice<string>[]> {
	const schedule = await Cache.getStaffGrantsSchedule();
	if (!StaffBestowPeriods.some(period => getStaffBestowSourceKey(schedule, user, period))) return [];
	const rewardBank = new Bank(getBestowBankJSON(user));
	const query = value.toLowerCase();

	return rewardBank
		.items()
		.map(([item, quantity]) => ({ item, quantity }))
		.filter(({ item }) => !query || item.name.toLowerCase().includes(query) || item.id.toString() === query)
		.sort((a, b) => a.item.name.localeCompare(b.item.name))
		.slice(0, 25)
		.map(({ item, quantity }) => ({ name: `${item.name} (${quantity}x)`, value: item.id.toString() }));
}

function resolveRewardItemID(rawReward: string): number | null {
	const numericID = Number(rawReward);
	if (Number.isInteger(numericID) && Items.has(numericID)) return numericID;
	const item = Items.getItem(rawReward);
	return item?.id ?? null;
}

export async function sendStaffBestowReward({
	user,
	rawReward,
	quantity = 1,
	recipient,
	guildId,
	interaction
}: {
	user: MUser;
	rawReward: string;
	quantity?: number;
	recipient: MUser;
	guildId?: string | null;
	interaction: MInteraction;
}) {
	if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_STAFF_BESTOW_QUANTITY) {
		return {
			content: `Quantity must be between 1 and ${MAX_STAFF_BESTOW_QUANTITY.toLocaleString()}.`,
			ephemeral: true
		};
	}
	if (recipient.id === user.id) {
		return { content: "You can't bestow rewards to yourself.", ephemeral: true };
	}

	if (!recipient.hasMinion) return 'That user needs a minion to receive bestow rewards.';
	if (await recipient.isBlacklisted()) {
		return {
			content: "That user is blacklisted and can't receive bestow rewards.",
			ephemeral: true
		};
	}
	if (await recipient.getIsLocked()) return { content: 'That user is busy right now.', ephemeral: true };

	const itemID = resolveRewardItemID(rawReward);
	if (!itemID) {
		return 'Invalid bestow reward.';
	}
	await interaction.defer();
	if (allDcSet.has(itemID) && customItems.includes(itemID)) {
		const item = Items.getOrThrow(itemID);
		const body = `${user.logName} attempted to bestow discontinued item ${item.name} (${item.id}) to ${recipient.logName}. Raw reward: ${rawReward}`;
		await Promise.all([
			dmCyrAudit(`# **Discontinued Item Attempt**\n${body}`),
			sendCyrCriticalBotLog('Discontinued Item Attempt', body)
		]);
		return 'Discontinued items may not be used here. This event has been logged.';
	}

	return userQueueFn(user.id, async () => {
		return userQueueFn(recipient.id, async () => {
			await Promise.all([user.sync(), recipient.sync()]);
			const rewardsLeft = new Bank(getBestowBankJSON(user));
			const item = Items.getOrThrow(itemID);
			const availableQuantity = rewardsLeft.amount(itemID);
			if (availableQuantity < quantity) {
				await interaction.followUp({
					content: `You don't have ${quantity.toLocaleString()}x ${item.name} to give. You only have ${availableQuantity.toLocaleString()}x.`,
					ephemeral: true
				});
				return SpecialResponse.RespondedManually;
			}

			rewardsLeft.remove(itemID, quantity);
			const loot = new Bank().add(itemID, quantity);
			const recipientBank = recipient.bank.clone();
			let recipientGP = recipient.GP;
			const bankLoot = loot.clone();
			const gpToAdd = bankLoot.amount('Coins');
			if (gpToAdd > 0) {
				recipientGP += gpToAdd;
				bankLoot.remove('Coins', gpToAdd);
			}
			recipientBank.add(bankLoot);

			await prisma.$transaction([
				prisma.user.update({
					where: { id: user.id },
					data: {
						rp_bestow_bank: rewardsLeft.toJSON()
					},
					select: { id: true }
				}),
				prisma.user.update({
					where: { id: recipient.id },
					data: {
						bank: recipientBank.toJSON(),
						GP: recipientGP
					},
					select: { id: true }
				}),
				prisma.economyTransaction.create({
					data: {
						guild_id: guildId ? BigInt(guildId) : undefined,
						sender: BigInt(user.id),
						recipient: BigInt(recipient.id),
						items_sent: loot.toJSON(),
						items_received: undefined,
						type: economy_transaction_type.bestow
					},
					select: { id: true }
				})
			]);

			await Promise.all([user.sync(), recipient.sync()]);

			const remaining = rewardsLeft.amount(itemID);
			await globalClient.sendMessage(Channel.BotLogs, {
				content: `${user.logName} bestowed reward \`${loot}\` to ${recipient.logName}. ${remaining}x ${item.name} remaining.`
			});
			await interaction.followUp({
				content: `${user.usernameOrMention} bestowed 🛍️ ${loot} to ${recipient.mention}... It has been added to your bank. 🎉`,
				allowedMentions: { users: [recipient.id] }
			});
			await interaction.followUp({
				content: `Your remaining bestow bank: ${rewardsLeft.toString()}`,
				ephemeral: true
			});

			return SpecialResponse.RespondedManually;
		});
	});
}
