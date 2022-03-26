import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { cats } from '../../lib/growablePets';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateBankSetting } from '../../lib/util';
import { parseInputCostBank } from '../../lib/util/parseStringBank';

async function trackSacBank(user: KlasaUser, bank: Bank) {
	const currentSacBank = new Bank(user.settings.get(UserSettings.SacrificedBank));
	currentSacBank.add(bank);
	updateBankSetting(user.client as KlasaClient, ClientSettings.EconomyStats.SacrificedBank, bank);
	await user.settings.update(UserSettings.SacrificedBank, currentSacBank.bank);
	return new Bank(user.settings.get(UserSettings.SacrificedBank));
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[bank:...str]',
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil']
		});
	}

	async run(msg: KlasaMessage, [bankStr = '']: [string | undefined]) {
		const bankToSac = parseInputCostBank({
			inputStr: bankStr,
			usersBank: msg.author.bank({ withGP: true }),
			flags: msg.flagArgs,
			excludeItems: msg.author.settings.get(UserSettings.FavoriteItems),
			user: msg.author
		});

		const sacVal = msg.author.settings.get(UserSettings.SacrificedValue);

		if (!msg.author.owns(bankToSac)) {
			return msg.channel.send(`You don't own ${bankToSac}.`);
		}

		if (bankToSac.length === 0) {
			return msg.channel.send(
				`No items were provided.\nYour current sacrificed value is: ${sacVal.toLocaleString()} (${Util.toKMB(
					sacVal
				)})`
			);
		}

		// Handle sacrificing cats
		if (cats.some(cat => bankToSac.has(cat))) {
			if (bankToSac.length !== 1) return msg.channel.send("Cat's don't like being sacrificed with other things!");
			const [item, quantity] = bankToSac.items()[0];
			const deathRunes = quantity * 200;

			await msg.confirm(
				`${msg.author.username}.. are you sure you want to sacrifice your ${item.name}${
					bankToSac.length > 1 ? 's' : ''
				} for ${deathRunes} death runes? *Note: These are cute, fluffy little cats.*`
			);

			const loot = new Bank().add('Death rune', deathRunes);
			await msg.author.removeItemsFromBank(bankToSac);
			await msg.author.addItemsToBank({ items: loot, collectionLog: false });
			const sacBank = await trackSacBank(msg.author, bankToSac);
			let totalCatsSacrificed = 0;
			for (const cat of cats) {
				totalCatsSacrificed += sacBank.amount(cat);
			}

			return msg.channel.send(
				`${msg.author.username}, you sacrificed ${bankToSac} and received ${loot}. You've sacrificed ${totalCatsSacrificed} cats.`
			);
		}

		const totalPrice = bankToSac.value();

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

		const newValue = sacVal + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemsFromBank(bankToSac.bank);

		await trackSacBank(msg.author, bankToSac);

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
