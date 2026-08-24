import { type APIApplicationCommandOptionChoice, SpecialResponse } from '@oldschoolgg/discord';
import { uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import { economy_transaction_type } from '@/prisma/main/enums.js';
import type { Prisma, User } from '@/prisma/main.js';
import { type BitField, Channel } from '@/lib/constants.js';
import { customItems } from '@/lib/customItems/util.js';
import { allDcSet } from '@/lib/data/Collections.js';
import { StaffGrantRoleSources, type StaffGrants } from '@/lib/settings/misc.js';
import { dmCyrAudit, sendCyrCriticalBotLog } from '@/lib/util/cyrAudit.js';
import { userQueueFn } from '@/lib/util/userQueues.js';

export type StaffBestowRole = keyof typeof StaffGrantRoleSources;
export const StaffBestowPeriods = ['hourly', 'daily', 'weekly', 'monthly'] as const;
export type StaffBestowPeriod = (typeof StaffBestowPeriods)[number];
export type StaffBestowSourceKey = StaffBestowRole | string;

type StaffBestowUser = Pick<User, 'id' | 'bitfield' | 'rp_bestow_bank'>;
const StaffGrantRoleSourceEntries = Object.entries(StaffGrantRoleSources) as [StaffBestowRole, BitField][];
const StaffGrantRoleSourceKeys = new Set(Object.keys(StaffGrantRoleSources));

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

export async function runStaffBestowReplenishment(periods: StaffBestowPeriod[]) {
	if (periods.length === 0) return;

	const schedule = await Cache.getStaffGrantsSchedule();
	const configuredPeriods = periods.filter(period => schedule[period]);
	if (configuredPeriods.length === 0) return;

	const configuredSourceKeys = uniqueArr(configuredPeriods.flatMap(period => Object.keys(schedule[period] ?? {})));
	const configuredUserIDs = configuredSourceKeys.filter(key => !StaffGrantRoleSourceKeys.has(key));
	const configuredRoleBitfields = StaffGrantRoleSourceEntries.filter(([sourceKey]) =>
		configuredSourceKeys.includes(sourceKey)
	).map(([, bitfield]) => bitfield);
	const userWhere: Prisma.UserWhereInput[] = [];
	if (configuredUserIDs.length > 0) {
		userWhere.push({ id: { in: configuredUserIDs } });
	}
	if (configuredRoleBitfields.length > 0) {
		userWhere.push({
			bitfield: {
				hasSome: configuredRoleBitfields
			}
		});
	}
	if (userWhere.length === 0) return;

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
		const userPeriods = configuredPeriods.filter(period => getStaffBestowSourceKey(schedule, user, period));
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
	recipient,
	guildId,
	interaction
}: {
	user: MUser;
	rawReward: string;
	recipient: MUser;
	guildId?: string | null;
	interaction: MInteraction;
}) {
	if (!user.hasMinion) return 'You need a minion to use this command.';
	const schedule = await Cache.getStaffGrantsSchedule();
	if (!StaffBestowPeriods.some(period => getStaffBestowSourceKey(schedule, user, period))) {
		return 'Only staff with a configured bestow schedule can use this command.';
	}
	if (recipient.id === user.id) return "You can't bestow rewards to yourself.";
	if (!recipient.hasMinion) return 'That user needs a minion to receive bestow rewards.';
	if (await recipient.isBlacklisted()) return "Blacklisted players can't receive bestow rewards.";
	if (await recipient.getIsLocked()) return 'That user is busy right now.';

	const itemID = resolveRewardItemID(rawReward);
	if (!itemID) {
		return 'Invalid bestow reward.';
	}
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
			if (rewardsLeft.amount(itemID) < 1) {
				return `You have no ${item.name} bestow rewards left.`;
			}

			rewardsLeft.remove(itemID, 1);
			const loot = new Bank().add(itemID, 1);
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
			//await interaction.deleteReply().catch(noOp);

			return SpecialResponse.RespondedManually;
		});
	});
}
