import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Events } from '../../lib/constants';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateBankSetting } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<amount:int{1}>',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices GP from your bank.',
			examples: ['+sacrificegp 10m']
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sacrifice ${amount} GP, this will add ${amount.toLocaleString()} (${Util.toKMB(
					amount
				)}) to your sacrificed amount.`
			);

			try {
				await msg.channel.awaitMessages({
					max: 1,
					time: 10000,
					errors: ['time'],
					filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
				});
			} catch (err) {
				return sellMsg.edit(`Cancelling sacrifice of ${amount} GP.`);
			}
		}

		if (amount > 200_000_000) {
			this.client.emit(Events.ServerNotification, `${msg.author.username} just sacrificed ${amount} GP!`);
		}

		const currentBal = msg.author.settings.get(UserSettings.GP);
		if (currentBal < amount) {
			return msg.channel.send(`You don't have ${amount} GP.`);
		}

		const bankToSac = new Bank().add('Coins', amount);

		await msg.author.removeItemsFromBank(bankToSac);
		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + amount;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);

		const currentSacBank = new Bank(msg.author.settings.get(UserSettings.SacrificedBank));
		await msg.author.settings.update(UserSettings.SacrificedBank, currentSacBank.add(bankToSac).bank);

		updateBankSetting(this.client, ClientSettings.EconomyStats.SacrificedBank, bankToSac);

		msg.author.log(`sacrificed ${bankToSac} for ${amount}`);

		let str = '';
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

		return msg.channel.send(
			`You sacrificed ${bankToSac}, with a value of ${amount.toLocaleString()} GP. Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
