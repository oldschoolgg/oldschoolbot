import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import Items from 'oldschooljs/dist/structures/Items';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

const unlimitedFireRuneProviders = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Mystic fire staff',
	'Lava battlestaff',
	'Mystic lava staff',
	'Steam battlestaff',
	'Mystic steam staff',
	'Smoke battlestaff',
	'Mystic smoke staff',
	'Tome of fire'
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '(items:...TradeableBank)',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Allows you to send your minion to alch items from your bank',
			examples: ['+alch 12 dragon scimitar', '+alch pumpkin'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [[bankSelected]]: [[Bank]]) {
		if (bankSelected === undefined) {
			throw 'You must specify item[s] to alch.';
		}

		if (!msg.author.bank().fits(bankSelected)) {
			throw "You don't have all of those items.";
		}

		// 5 tick action
		const timePerAlch = Time.Second * 3;
		const maxTripLength = msg.author.maxTripLength(Activity.Alching);

		let maxRemaining = Math.floor(maxTripLength / timePerAlch);

		let quantity = 0;
		let alchValue = 0;

		let bankToAlch = new Bank();

		for (const [itemID, qty] of Object.entries(bankSelected.bank)) {
			const item = Items.get(parseInt(itemID));
			if (!(item!.highalch && item!.tradeable)) {
				if (Object.keys(msg.flagArgs).length > 0) {
					continue;
				} else {
					throw 'Not all selected items are alchable.';
				}
			}

			// Subtract quantities used until we reach max.
			let qtyUsable = qty > maxRemaining ? maxRemaining : qty;

			maxRemaining -= qtyUsable;
			if (maxRemaining < 0) {
				maxRemaining = 0;
			}
			if (qtyUsable <= 0) {
				continue;
			}
			bankToAlch.add(item!.id, qtyUsable);
			quantity += qtyUsable;
			alchValue += qtyUsable * item!.highalch;
		}

		if (quantity === 0) {
			return msg.send(`No items selected to alch!`);
		}
		const maxCasts = Math.min(Math.floor(maxTripLength / timePerAlch), quantity);

		if (msg.author.skillLevel(SkillsEnum.Magic) < 55) {
			return msg.send(`You need level 55 Magic to cast High Alchemy`);
		}

		if (quantity * timePerAlch > maxTripLength) {
			return msg.send(
				`The max number of alchs you can do is ${maxCasts}!\nYou've chosen: ${bankToAlch}`
			);
		}

		const duration = quantity * timePerAlch;
		let fireRuneCost = quantity * 5;

		for (const runeProvider of unlimitedFireRuneProviders) {
			if (msg.author.hasItemEquippedAnywhere(runeProvider)) {
				fireRuneCost = 0;
				break;
			}
		}

		const consumedItems = new Bank({
			...(fireRuneCost > 0 ? { 'Fire rune': fireRuneCost } : {}),
			'Nature rune': quantity
		});
		consumedItems.add(bankToAlch);

		if (!msg.author.owns(consumedItems)) {
			return msg.send(`You don't have the required items, you need ${consumedItems}`);
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const alchMessage = await msg.channel.send(
				`${msg.author}, say \`confirm\` to alch ${bankToAlch.toString()} (${Util.toKMB(
					alchValue
				)}). This will take approximately ${formatDuration(
					duration
				)}, and consume ${quantity}x Nature runes.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: 10_000,
						errors: ['time']
					}
				);
			} catch (err) {
				return alchMessage.edit(`Cancelling alch of ${bankToAlch.toString()}.`);
			}
		}

		await msg.author.removeItemsFromBank(consumedItems);
		await updateBankSetting(
			this.client,
			ClientSettings.EconomyStats.MagicCostBank,
			consumedItems
		);

		await addSubTaskToActivityTask<AlchingActivityTaskOptions>(this.client, {
			alchBank: bankToAlch,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			alchValue,
			type: Activity.Alching
		});

		msg.author.log(`alched ${bankToAlch.toString()} for ${alchValue}`);

		const response = `${
			msg.author.minionName
		} is now alching  ${bankToAlch.toString()}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		return msg.send(response);
	}
}
