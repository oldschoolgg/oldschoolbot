import { cryptoRng } from '@oldschoolgg/rng';
import { Emoji, Events, sleep } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import { BLACKLISTED_USERS } from '@/lib/cache.js';
import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

async function checkBal(user: MUser, amount: number) {
	return user.GP >= amount;
}

async function handleFinishUpdates({
	guildId,
	winner,
	loser,
	amount
}: {
	guildId: string | null;
	amount: number;
	winner: MUser;
	loser: MUser;
}) {
	const taxRate = 0.95;
	const winningAmount = amount * 2;
	const tax = winningAmount - Math.floor(winningAmount * taxRate);
	const dividedAmount = tax / 1_000_000;
	await Promise.all([
		loser.statsUpdate({
			duel_losses: {
				increment: 1
			}
		}),
		winner.statsUpdate({
			duel_wins: {
				increment: 1
			}
		}),
		ClientSettings.updateClientGPTrackSetting(
			'economyStats_duelTaxBank',
			Math.floor(Math.round(dividedAmount * 100) / 100)
		)
	]);

	const amountGPWinnerReceives = winningAmount - tax;

	const loot = new Bank().add('Coins', amountGPWinnerReceives);
	await winner.addItemsToBank({ items: loot, collectionLog: false });

	await prisma.economyTransaction.create({
		data: {
			guild_id: guildId ? BigInt(guildId) : null,
			sender: BigInt(loser.id),
			recipient: BigInt(winner.id),
			items_sent: new Bank().add('Coins').toJSON(),
			type: 'duel'
		}
	});
	return {
		amountGPWinnerReceives,
		taxPaid: tax
	};
}

export async function duelCommand(
	user: MUser,
	interaction: MInteraction,
	duelUser: MUser,
	targetAPIUser: MahojiUserOption,
	duelAmount?: string
) {
	await interaction.defer();

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

	await interaction.confirmation({
		content: `${duelTargetUser}, do you accept the duel for ${toKMB(amount)} GP?`,
		users: [duelTargetUser.id]
	});
	const [sourceUserUsername, targetUserUsername] = await Cache.getBadgedUsernames([
		duelSourceUser.id,
		duelTargetUser.id
	]);

	await duelSourceUser.sync();
	await duelTargetUser.sync();
	if (!(await checkBal(duelSourceUser, amount)) || !(await checkBal(duelTargetUser, amount))) {
		return 'User appears to be less wealthy than expected (they lost some money before accepting...).';
	}

	const cost = new Bank().add('Coins', amount);
	await Promise.all([duelSourceUser.removeItemsFromBank(cost), duelTargetUser.removeItemsFromBank(cost)]);

	try {
		await interaction.reply(`${targetUserUsername} accepted the duel. You both enter the duel arena...`);
		await sleep(2000);

		await interaction.reply(`${sourceUserUsername} and ${targetUserUsername} begin fighting...`);
		await sleep(2000);

		await interaction.reply('The fight is almost over...');
		await sleep(2000);
	} catch (err) {
		Logging.logError({
			err: err,
			message: `Error during duel interaction replies between ${duelSourceUser.id} and ${duelTargetUser.id}, continuing`
		});
	}

	const [winner, loser] = cryptoRng.shuffle([duelSourceUser, duelTargetUser]);
	const { amountGPWinnerReceives, taxPaid } = await handleFinishUpdates({
		winner,
		loser,
		guildId: interaction.guildId ?? null,
		amount
	});

	if (amount >= 1_000_000_000) {
		globalClient.emit(
			Events.ServerNotification,
			`${Emoji.MoneyBag} **${winner.badgedUsername}** just won a **${toKMB(
				amount
			)}** GP duel against ${loser.badgedUsername}.`
		);
	}

	globalClient.emit(
		Events.EconomyLog,
		`${winner.mention} won ${amountGPWinnerReceives} GP in a duel with ${loser.mention}.`
	);

	return `Congratulations ${winner.badgedUsername}! You won ${toKMB(amountGPWinnerReceives)}, and paid ${toKMB(taxPaid)} tax.`;
}
