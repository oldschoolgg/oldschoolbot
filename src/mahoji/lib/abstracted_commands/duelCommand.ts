import { User } from "discord.js";
import { noOp, sleep } from "e";
import { KlasaUser } from "klasa";
import { Bank, Util } from "oldschooljs";
import { client } from "../../..";
import { Emoji, Events } from "../../../lib/constants";
import { ClientSettings } from "../../../lib/settings/types/ClientSettings";
import { UserSettings } from "../../../lib/settings/types/UserSettings";
import { mahojiParseNumber } from "../../mahojiSettings";

export async function duelCommand(KlasaUser: KlasaUser, duelamount?: string) {
    const options = {
        max: 1,
        time: 15_000,
        errors: ['time']
    };

    const user = await client.fetchUser(KlasaUser.id.toString());
	const recipient = await client.fetchUser(KlasaUser.id);
   
    const amount = mahojiParseNumber({ input: duelamount, min: 1, max: 500_000_000_000 });
    if (!duelamount) {
		return `${Math.random() >= 0.5 ? KlasaUser.username : KlasaUser.username} won the duel with ${Math.floor(
            Math.random() * 30 + 1
        )} HP remaining.`;
	}

	if (!amount) {
		return `${Math.random() >= 0.5 ? KlasaUser.username : KlasaUser.username} won the duel with ${Math.floor(
            Math.random() * 30 + 1
        )} HP remaining.`;
	}

   const checkBal(user: KlasaUser, amount: number) {
		await user.settings.sync(true);
		return user.settings.get(UserSettings.GP) >= amount;}

        if (recipient.isIronman) return "You can't duel someone as an ironman.";
		if (user.isIronman) return "You can't duel someone as an ironman.";
		if (!(user instanceof User)) return "You didn't mention a user to duel.";
		if (user.id === KlasaUser.id) return 'You cant duel yourself.';
		if (recipient.bot) return 'You cant duel a bot.';
		if (recipient.isBusy) return 'That user is busy right now.';
        if (user.minionIsBusy) return `${user.minionName} is busy.`;

        if (!(await checkBal(KlasaUser, amount))) {
			return 'You dont have have enough GP to duel that much.';
		}

		if (!(await checkBal(user, amount))) {
			return "That person doesn't have enough GP to duel that much.";
		}

		const duelMsg = await `${user.username}, say \`fight\` if you accept the duel for ${Util.toKMB(amount)} GP.`;
        try {
			await msg.channel.awaitMessages({
				...options,
				filter: _msg => _msg.user.id === user.id && _msg.content.toLowerCase() === 'fight'
			});
		} catch (err) {
			return duelMsg.edit("The user didn't accept the duel.");
		}

		if (!(await checkBal(KlasaUser, amount)) || !(await checkBal(user, amount))) {
			return (Emoji.Bpaptu);
		}

		const b = new Bank().add('Coins', amount);
		await KlasaUser.removeItemsFromBank(b);
		await user.removeItemsFromBank(b);

		await duelMsg.edit(`${user.username} accepted the duel. You both enter the duel arena...`).catch(noOp);

		await sleep(2000);
		await duelMsg.edit(`${user.username} and ${KlasaUser.username} begin fighting...`).catch(noOp);

		const [winner, loser] = Math.random() > 0.5 ? [user, KlasaUser] : [KlasaUser, user];

		await sleep(2000);
		await duelMsg.edit('The fight is almost over...').catch(noOp);
		await sleep(2000);

		const winningAmount = amount * 2;
		const tax = winningAmount - winningAmount * 0.95;

		const dicingBank = client.settings.get(ClientSettings.EconomyStats.DuelTaxBank);
		const dividedAmount = tax / 1_000_000;
		client.settings.update(
			ClientSettings.EconomyStats.DuelTaxBank,
			Math.floor(dicingBank + Math.round(dividedAmount * 100) / 100)
		);

		const winsOfWinner = winner.settings.get(UserSettings.Stats.DuelWins);
		winner.settings.update(UserSettings.Stats.DuelWins, winsOfWinner + 1);

		const lossesOfLoser = loser.settings.get(UserSettings.Stats.DuelLosses);
		loser.settings.update(UserSettings.Stats.DuelLosses, lossesOfLoser + 1);

		await winner.addItemsToBank({ items: new Bank().add('Coins', winningAmount - tax), collectionLog: false });

		if (amount >= 1_000_000_000) {
			client.emit(
				Events.ServerNotification,
				`${Emoji.MoneyBag} **${winner.username}** just won a **${Util.toKMB(winningAmount)}** GP duel against ${
					loser.username
				}.`
			);
		}

		client.emit(
			Events.EconomyLog,
			`${winner.sanitizedName} won ${winningAmount} GP in a duel with ${loser.sanitizedName}.`
		);

		return `Congratulations ${winner.username}! You won ${Util.toKMB(winningAmount)}, and paid ${Util.toKMB(tax)} tax.`;
	}