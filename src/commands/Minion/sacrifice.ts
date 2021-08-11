import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { TradeableItemBankArgumentType } from '../../arguments/tradeableItemBank';
import { Events } from '../../lib/constants';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks } from '../../lib/util';

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

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemsFromBank(bankToSac.bank);

		const currentSacBank = new Bank(msg.author.settings.get(UserSettings.SacrificedBank));
		currentSacBank.add(bankToSac);
		await msg.author.settings.update(UserSettings.SacrificedBank, currentSacBank.values());

		await this.client.settings.update(
			ClientSettings.EconomyStats.SacrificedBank,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank), bankToSac.bank])
		);

		msg.author.log(`sacrificed ${bankToSac} for ${totalPrice}`);

		let str = '';
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
		return msg.channel.send(
			`You sacrificed ${bankToSac}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
