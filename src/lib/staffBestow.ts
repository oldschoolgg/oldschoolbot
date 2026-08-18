import { SpecialResponse, type APIApplicationCommandOptionChoice } from '@oldschoolgg/discord';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import { economy_transaction_type } from '@/prisma/main/enums.js';
import type { User } from '@/prisma/main.js';
import { BitField, Channel } from '@/lib/constants.js';
import { customItems } from '@/lib/customItems/util.js';
import { allDcSet } from '@/lib/data/Collections.js';
import type { StaffBestowSchedule } from '@/lib/settings/misc.js';
import { dmCyrAudit, sendCyrCriticalBotLog } from '@/lib/util/cyrAudit.js';
import { userQueueFn } from '@/lib/util/userQueues.js';

export type StaffBestowRole = 'mod' | 'contrib';
export const StaffBestowPeriods = ['hourly', 'daily', 'weekly', 'monthly'] as const;
export type StaffBestowPeriod = (typeof StaffBestowPeriods)[number];
export type StaffBestowSourceKey = StaffBestowRole | string;

type StaffBestowUser = Pick<User, 'id' | 'bitfield' | 'rp_rewards_left'>;

export function getStaffBestowRole(user: MUser | StaffBestowUser): StaffBestowRole | null {
	if (user.bitfield.includes(BitField.Moderator)) return 'mod';
	if (user.bitfield.includes(BitField.Contributor)) return 'contrib';
	return null;
}

function getStaffBestowSourceKey(schedule: StaffBestowSchedule, user: MUser | StaffBestowUser): StaffBestowSourceKey | null {
	if (schedule[user.id]) return user.id;
	const role = getStaffBestowRole(user);
	return role && schedule[role] ? role : null;
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
	limits,
	periods
}: {
	current: Bank;
	limits: StaffBestowSchedule[string];
	periods: StaffBestowPeriod[];
}) {
	const added = new Bank();

	for (const period of periods) {
		added.add(topUpToLimit(current, limits[period]));
	}

	return added;
}

export async function replenishStaffBestowUserBank(user: MUser, periods: StaffBestowPeriod[]) {
	const schedule = await Cache.getStaffBestowSchedule();
	const sourceKey = getStaffBestowSourceKey(schedule, user);
	if (!sourceKey) return { added: new Bank(), rewardBank: new Bank() };

	return userQueueFn(user.id, async () => {
		await user.sync();
		const rewardBank = new Bank(user.user.rp_rewards_left as ItemBank);
		const added = replenishStaffBestowBank({
			current: rewardBank,
			limits: schedule[sourceKey],
			periods
		});

		if (added.length > 0) {
			await user.update({
				rp_rewards_left: rewardBank.toJSON()
			});
		}

		return {
			added,
			rewardBank
		};
	});
}

export async function runStaffBestowReplenishment(periods: StaffBestowPeriod[]) {
	if (periods.length === 0) return;

	const schedule = await Cache.getStaffBestowSchedule();
	const configuredUserIDs = Object.keys(schedule).filter(key => key !== 'mod' && key !== 'contrib');
	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ id: { in: configuredUserIDs } },
				{
					bitfield: {
						hasSome: [BitField.Moderator, BitField.Contributor]
					}
				}
			]
		},
		select: {
			id: true,
			bitfield: true,
			rp_rewards_left: true
		}
	});

	for (const user of users) {
		const sourceKey = getStaffBestowSourceKey(schedule, user);
		if (!sourceKey) continue;

		await userQueueFn(user.id, async () => {
			const freshUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					rp_rewards_left: true
				}
			});
			if (!freshUser) return;

			const rewardBank = new Bank(freshUser.rp_rewards_left as ItemBank);
			const added = replenishStaffBestowBank({
				current: rewardBank,
				limits: schedule[sourceKey],
				periods
			});
			if (added.length === 0) return;

			await prisma.user.update({
				where: { id: user.id },
				data: {
					rp_rewards_left: rewardBank.toJSON()
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
	const schedule = await Cache.getStaffBestowSchedule();
	if (!getStaffBestowSourceKey(schedule, user)) return [];
	const rewardBank = new Bank(user.user.rp_rewards_left as ItemBank);
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
	const schedule = await Cache.getStaffBestowSchedule();
	if (!getStaffBestowSourceKey(schedule, user)) {
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
			const rewardsLeft = new Bank(user.user.rp_rewards_left as ItemBank);
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
					where: {id: user.id},
					data: {
						rp_rewards_left: rewardsLeft.toJSON()
					},
					select: {id: true}
				}),
				prisma.user.update({
					where: {id: recipient.id},
					data: {
						bank: recipientBank.toJSON(),
						GP: recipientGP,
					},
					select: {id: true}
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
					select: {id: true}
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
