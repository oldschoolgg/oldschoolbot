import type { MahojiUserOption } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, noOp, sleep } from 'e';
import { Bank, Util } from 'oldschooljs';

import { BLACKLISTED_USERS } from '../../../lib/blacklists';
import { Emoji, Events } from '../../../lib/constants';
import { awaitMessageComponentInteraction, channelIsSendable } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { mahojiParseNumber, updateClientGPTrackSetting, userStatsUpdate } from '../../mahojiSettings';

async function checkBal(user: MUser, amount: number) {
	return user.GP >= amount;
}

export async function duelCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	duelUser: MUser,
	targetAPIUser: MahojiUserOption,
	duelAmount?: string
) {
	await deferInteraction(interaction);

	const duelSourceUser = user;
	const duelTargetUser = duelUser;

	const amount = mahojiParseNumber({ input: duelAmount, min: 1, max: 500_000_000_000 });
	if (!amount) {
		const winner = Math.random() >= 0.5 ? duelSourceUser : duelTargetUser;
		return `${winner} won the duel against ${
			winner.id === duelSourceUser.id ? duelTargetUser : duelSourceUser
		} with ${Math.floor(Math.random() * 30 + 1)} HP remaining.`;
	}

	if (duelSourceUser.isIronman) return "You can't duel someone as an ironman.";
	if (duelTargetUser.isIronman) return "You can't duel someone who is an ironman.";
	if (duelSourceUser.id === duelTargetUser.id) return 'You cant duel yourself.';
	if (BLACKLISTED_USERS.has(duelTargetUser.id)) return 'Target user is blacklisted.';
	if (targetAPIUser.user.bot) return 'You cant duel a bot.';

	if (!(await checkBal(duelSourceUser, amount))) {
		return 'You dont have have enough GP to duel that much.';
	}

	if (!(await checkBal(duelTargetUser, amount))) {
		return "That person doesn't have enough GP to duel that much.";
	}

	const channel = globalClient.channels.cache.get(interaction.channelId);
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	const duelMessage = await channel.send({
		content: `${duelTargetUser}, do you accept the duel for ${Util.toKMB(amount)} GP?`,
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder({
					label: 'Accept',
					style: ButtonStyle.Primary,
					customId: 'CONFIRM'
				}),
				new ButtonBuilder({
					label: 'Decline',
					style: ButtonStyle.Secondary,
					customId: 'CANCEL'
				})
			])
		]
	});

	function cancel() {
		duelMessage.delete().catch(noOp);
		return "Duel cancelled, user didn't accept in time.";
	}

	async function confirm(amount: number) {
		duelMessage.edit({ components: [] }).catch(noOp);
		await duelSourceUser.sync();
		await duelTargetUser.sync();
		if (!(await checkBal(duelSourceUser, amount)) || !(await checkBal(duelTargetUser, amount))) {
			duelMessage.delete().catch(noOp);
			return 'User appears to be less wealthy than expected (they lost some money before accepting...).';
		}

		const b = new Bank().add('Coins', amount);
		await duelSourceUser.removeItemsFromBank(b);
		await duelTargetUser.removeItemsFromBank(b);

		await duelMessage
			.edit(`${duelTargetUser.badgedUsername} accepted the duel. You both enter the duel arena...`)
			.catch(noOp);

		await sleep(2000);
		await duelMessage
			.edit(`${duelSourceUser.badgedUsername} and ${duelTargetUser.badgedUsername} begin fighting...`)
			.catch(noOp);

		const [winner, loser] =
			Math.random() > 0.5 ? [duelSourceUser, duelTargetUser] : [duelTargetUser, duelSourceUser];

		await sleep(2000);
		await duelMessage.edit('The fight is almost over...').catch(noOp);
		await sleep(2000);

		const taxRate = 0.95;
		const winningAmount = amount * 2;
		const tax = winningAmount - Math.floor(winningAmount * taxRate);
		const dividedAmount = tax / 1_000_000;
		await updateClientGPTrackSetting('economyStats_duelTaxBank', Math.floor(Math.round(dividedAmount * 100) / 100));

		await userStatsUpdate(
			winner.id,
			{
				duel_wins: {
					increment: 1
				}
			},
			{}
		);
		await userStatsUpdate(
			loser.id,
			{
				duel_losses: {
					increment: 1
				}
			},
			{}
		);

		const loot = new Bank().add('Coins', winningAmount - tax);
		await winner.addItemsToBank({ items: loot, collectionLog: false });
		await prisma.economyTransaction.create({
			data: {
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : null,
				sender: BigInt(loser.id),
				recipient: BigInt(winner.id),
				items_sent: new Bank().add('Coins', Math.floor(amount * taxRate)).toJSON(),
				type: 'duel'
			}
		});

		if (amount >= 1_000_000_000) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.MoneyBag} **${winner.badgedUsername}** just won a **${Util.toKMB(
					winningAmount
				)}** GP duel against ${loser.badgedUsername}.`
			);
		}

		globalClient.emit(
			Events.EconomyLog,
			`${winner.mention} won ${winningAmount} GP in a duel with ${loser.mention}.`
		);

		duelMessage.edit(
			`Congratulations ${winner.badgedUsername}! You won ${Util.toKMB(winningAmount)}, and paid ${Util.toKMB(
				tax
			)} tax.`
		);

		return `Duel finished, ${winner} won.`;
	}

	try {
		const selection = await awaitMessageComponentInteraction({
			message: duelMessage,
			filter: i => {
				if (i.user.id !== (duelTargetUser.id ?? interaction.user.id).toString()) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 10
		});
		if (selection.customId === 'CANCEL') {
			return cancel();
		}
		if (selection.customId === 'CONFIRM') {
			return await confirm(amount);
		}
	} catch (err) {
		return cancel();
	}
	return cancel();
}
