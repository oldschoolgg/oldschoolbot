import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Events } from '../../lib/constants';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { roll, updateBankSetting } from '../../lib/util';
import { parseInputCostBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[bank:...str]',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil']
		});
	}

	async run(msg: KlasaMessage, [bankStr = '']: [string | undefined]) {
		const bankToSac = parseInputCostBank({
			inputStr: bankStr,
			usersBank: msg.author.bank(),
			flags: msg.flagArgs,
			excludeItems: msg.author.settings.get(UserSettings.FavoriteItems)
		});

		if (!msg.author.owns(bankToSac)) {
			return msg.channel.send(`You don't own ${bankToSac}.`);
		}

		if (bankToSac.length === 0) {
			return msg.channel.send('No items found.');
		}

		let totalPrice = bankToSac.value();

		await msg.confirm(
			`${
				msg.author
			}, are you sure you want to sacrifice ${bankToSac}? This will add ${totalPrice.toLocaleString()} (${Util.toKMB(
				totalPrice
			)}) to your sacrificed amount.`
		);

		if (totalPrice > 200_000_000) {
			this.client.emit(Events.ServerNotification, `${msg.author.username} just sacrificed ${bankToSac}!`);
		}

		let str = '';

		const hasSkipper = msg.author.usingPet('Skipper') || msg.author.owns('Skipper');
		if (hasSkipper) {
			totalPrice *= 1.4;
		}

		if (totalPrice >= 30_000_000 && roll(10)) {
			str += 'You received a *Hunk of crystal*.';
			await msg.author.addItemsToBank({ 742: 1 }, true);
		}

		let gotHammy = false;
		for (let i = 0; i < Math.floor(totalPrice / 51_530_000); i++) {
			if (roll(140)) {
				gotHammy = true;
				break;
			}
		}
		if (gotHammy) {
			await msg.author.addItemsToBank(new Bank().add('Hammy'), true);
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemsFromBank(bankToSac.bank);

		const currentSacBank = new Bank(msg.author.settings.get(UserSettings.SacrificedBank));
		currentSacBank.add(bankToSac);
		await msg.author.settings.update(UserSettings.SacrificedBank, currentSacBank.bank);

		updateBankSetting(this.client, ClientSettings.EconomyStats.SacrificedBank, bankToSac);

		msg.author.log(`sacrificed ${bankToSac} for ${totalPrice}`);

		const currentIcon = msg.author.settings.get(UserSettings.Minion.Icon);
		// Ignores notifying the user/server if the user is using a custom icon
		if (!currentIcon || minionIcons.find(m => m.emoji === currentIcon)) {
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
		}

		if (gotHammy) {
			str +=
				'\n\n<:Hamstare:685036648089780234> A small hamster called Hammy has crawled into your bank and is now staring intensely into your eyes.';
		}
		if (hasSkipper) {
			str +=
				'\n<:skipper:755853421801766912> Skipper has negotiated with the bank and gotten you +40% extra value from your sacrifice.';
		}

		return msg.channel.send(
			`You sacrificed ${bankToSac}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
