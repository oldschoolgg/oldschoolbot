import { MessageButton, User } from 'discord.js';
import { noOp, sleep, Time } from 'e';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, Util } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { channelIsSendable } from '../../../lib/util';
import { mahojiParseNumber, updateGPTrackSetting } from '../../mahojiSettings';

async function checkBal(user: MUser, amount: number) {
	return user.GP >= amount;
}

export async function duelCommand(
	user: MUser,
	interaction: SlashCommandInteraction,
	duelUser: MUser,
	duelamount?: string
) {
	await interaction.deferReply();

	const duelSourceUser = user;
	const duelTargetUser = duelUser;

	const amount = mahojiParseNumber({ input: duelamount, min: 1, max: 500_000_000_000 });
	if (!amount) {
		const winner = Math.random() >= 0.5 ? duelSourceUser : duelTargetUser;
		return `${winner} won the duel against ${
			winner.id === duelSourceUser.id ? duelTargetUser : duelSourceUser
		} with ${Math.floor(Math.random() * 30 + 1)} HP remaining.`;
	}

	if (duelSourceUser.isIronman) return "You can't duel someone as an ironman.";
	if (duelTargetUser.isIronman) return "You can't duel someone who is an ironman.";
	if (duelSourceUser.id === duelTargetUser.id) return 'You cant duel yourself.';
	if (!(duelTargetUser instanceof User)) return "You didn't mention a user to duel.";
	if (duelTargetUser.bot) return 'You cant duel a bot.';

	if (!(await checkBal(duelSourceUser, amount))) {
		return 'You dont have have enough GP to duel that much.';
	}

	if (!(await checkBal(duelTargetUser, amount))) {
		return "That person doesn't have enough GP to duel that much.";
	}

	const channel = globalClient.channels.cache.get(interaction.channelID.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	const duelMessage = await channel.send({
		content: `${duelTargetUser}, do you accept the duel for ${Util.toKMB(amount)} GP?`,
		components: [
			[
				new MessageButton({
					label: 'Accept',
					style: 'PRIMARY',
					customID: 'CONFIRM'
				}),
				new MessageButton({
					label: 'Decline',
					style: 'SECONDARY',
					customID: 'CANCEL'
				})
			]
		]
	});

	function cancel() {
		duelMessage.delete().catch(noOp);
		return "Duel cancelled, user didn't accept in time.";
	}

	async function confirm(amount: number) {
		duelMessage.edit({ components: [] }).catch(noOp);
		if (!(await checkBal(duelSourceUser, amount)) || !(await checkBal(duelTargetUser, amount))) {
			duelMessage.delete().catch(noOp);
			return 'User appears to be less wealthy than expected (they lost some money before accepting...).';
		}

		const b = new Bank().add('Coins', amount);
		await duelSourceUser.removeItemsFromBank(b);
		await duelTargetUser.removeItemsFromBank(b);

		await duelMessage
			.edit(`${duelTargetUser.usernameOrMention} accepted the duel. You both enter the duel arena...`)
			.catch(noOp);

		await sleep(2000);
		await duelMessage
			.edit(`${duelSourceUser.usernameOrMention} and ${duelTargetUser.usernameOrMention} begin fighting...`)
			.catch(noOp);

		const [winner, loser] =
			Math.random() > 0.5 ? [duelSourceUser, duelTargetUser] : [duelTargetUser, duelSourceUser];

		await sleep(2000);
		await duelMessage.edit('The fight is almost over...').catch(noOp);
		await sleep(2000);

		const winningAmount = amount * 2;
		const tax = winningAmount - winningAmount * 0.95;

		const dividedAmount = tax / 1_000_000;
		updateGPTrackSetting('duelTaxBank', Math.floor(Math.round(dividedAmount * 100) / 100));

		await winner.update({
			stats_duelWins: {
				increment: 1
			}
		});
		await loser.update({
			stats_duelLosses: {
				increment: 1
			}
		});

		await winner.addItemsToBank({ items: new Bank().add('Coins', winningAmount - tax), collectionLog: false });

		if (amount >= 1_000_000_000) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.MoneyBag} **${winner.usernameOrMention}** just won a **${Util.toKMB(
					winningAmount
				)}** GP duel against ${loser.usernameOrMention}.`
			);
		}

		globalClient.emit(
			Events.EconomyLog,
			`${winner.usernameOrMention} won ${winningAmount} GP in a duel with ${loser.usernameOrMention}.`
		);

		duelMessage.edit(
			`Congratulations ${winner.usernameOrMention}! You won ${Util.toKMB(winningAmount)}, and paid ${Util.toKMB(
				tax
			)} tax.`
		);

		return `Duel finished, ${winner} won.`;
	}

	try {
		const selection = await duelMessage.awaitMessageComponentInteraction({
			filter: i => {
				if (i.user.id !== (duelTargetUser.id ?? interaction.userID).toString()) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 10
		});
		if (selection.customID === 'CANCEL') {
			return cancel();
		}
		if (selection.customID === 'CONFIRM') {
			return await confirm(amount);
		}
	} catch (err) {
		return cancel();
	}
	return cancel();
}
