import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { TradeableItemBankArgumentType } from '../../arguments/tradeableItemBank';
import { BotCommand } from '../../lib/BotCommand';
import { Events } from '../../lib/constants';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addBanks, itemID, roll } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '(items:TradeableBank)',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil']
		});
	}

	async run(msg: KlasaMessage, [[bankToSac, totalPrice]]: [TradeableItemBankArgumentType]) {
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sacrifice ${bankToSac}, this will add ${totalPrice.toLocaleString()} (${Util.toKMB(
					totalPrice
				)}) to your sacrificed amount.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: 10000,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sacrifice of ${bankToSac}.`);
			}
		}

		if (totalPrice > 200_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just sacrificed ${bankToSac}!`
			);
		}

		let str = '';

		const hasSkipper =
			msg.author.equippedPet() === itemID('Skipper') ||
			msg.author.numItemsInBankSync(itemID('Skipper')) > 0;
		if (hasSkipper) {
			totalPrice *= 1.4;
		}

		if (totalPrice >= 30_000_000 && roll(10)) {
			str += `You received a *Hunk of crystal*.`;
			await msg.author.addItemsToBank({ 742: 1 }, true);
		}

		const gotHammy = totalPrice >= 51_530_000 && roll(140);
		if (gotHammy) {
			await msg.author.addItemsToBank({ [itemID('Hammy')]: 1 }, true);
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemsFromBank(bankToSac.bank);

		const currentSacBank = new Bank(msg.author.settings.get(UserSettings.SacrificedBank));
		currentSacBank.add(bankToSac);
		await msg.author.settings.update(UserSettings.SacrificedBank, currentSacBank.values());

		await this.client.settings.update(
			ClientSettings.EconomyStats.SacrificedBank,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank),
				bankToSac.bank
			])
		);

		msg.author.log(`sacrificed ${bankToSac} for ${totalPrice}`);

		const currentIcon = msg.author.settings.get(UserSettings.Minion.Icon);
		for (const icon of minionIcons) {
			if (newValue < icon.valueRequired) continue;
			if (newValue >= icon.valueRequired) {
				if (currentIcon === icon.emoji) break;
				await msg.author.settings.update(UserSettings.Minion.Icon, icon.emoji);
				str += `\n\nYou have now unlocked the **${icon.name}** minion icon!`;
				this.client.emit(
					Events.ServerNotification,
					`**${msg.author.username}** just unlocked the ${icon.emoji} icon for their minion.`
				);
				break;
			}
		}

		if (gotHammy) {
			str += `\n\n<:Hamstare:685036648089780234> A small hamster called Hammy has crawled into your bank and is now staring intensely into your eyes.`;
		}
		if (hasSkipper) {
			str += `\n<:skipper:755853421801766912> Skipper has negotiated with the bank and gotten you +40% extra value from your sacrifice.`;
		}

		return msg.send(
			`You sacrificed ${bankToSac}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
