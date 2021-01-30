import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import {
	addBanks,
	bankHasAllItemsFromBank,
	formatDuration,
	removeBankFromBank,
	resolveNameBank
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import resolveItems from '../../lib/util/resolveItems';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

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
			usage: '[quantity:int{1}] <item:...item>',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Allows you to send your minion to alch items from your bank',
			examples: ['+alch 12 dragon scimitar', '+alch pumpkin'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity = null, item]: [number | null, Item[]]) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = item.find(i => userBank[i.id] && i.highalch && i.tradeable);
		if (!osItem) {
			return msg.send(`You don't have any of this item to alch.`);
		}

		// 5 tick action
		const timePerAlch = Time.Second * 3;

		const maxCasts = Math.min(
			Math.floor(msg.author.maxTripLength / timePerAlch),
			userBank[osItem.id]
		);

		if (!quantity) {
			quantity = maxCasts;
		}

		if (quantity * timePerAlch > msg.author.maxTripLength) {
			return msg.send(`The max number of alchs you can do is ${maxCasts}!`);
		}

		const duration = quantity * timePerAlch;
		let fireRuneCost = quantity * 5;

		for (const runeProvider of unlimitedFireRuneProviders) {
			if (msg.author.hasItemEquippedAnywhere(runeProvider)) {
				fireRuneCost = 0;
				break;
			}
		}

		const alchValue = quantity * osItem.highalch;
		const consumedItems = addBanks([
			resolveNameBank({
				...(fireRuneCost > 0 ? { 'Fire rune': fireRuneCost } : {}),
				'Nature rune': quantity
			}),
			{ [osItem.id]: quantity }
		]);

		const consumedItemsString = await createReadableItemListFromBank(
			this.client,
			consumedItems
		);

		if (!bankHasAllItemsFromBank(userBank, consumedItems)) {
			return msg.send(`You don't have the required items, you need ${consumedItemsString}`);
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const alchMessage = await msg.channel.send(
				`${msg.author}, say \`confirm\` to alch ${quantity} ${osItem.name} (${Util.toKMB(
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
					options
				);
			} catch (err) {
				return alchMessage.edit(`Cancelling alch of ${quantity}x ${osItem.name}.`);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			removeBankFromBank(userBank, consumedItems)
		);

		await addSubTaskToActivityTask<AlchingActivityTaskOptions>(this.client, {
			itemID: osItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			alchValue,
			type: Activity.Alching
		});

		msg.author.log(`alched Quantity[${quantity}] ItemID[${osItem.id}] for ${alchValue}`);

		const response = `${msg.author.minionName} is now alching ${quantity}x ${
			osItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
