import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, multiplyBank, removeBankFromBank, resolveNameBank } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';
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
			oneAtTime: true
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, item]: [number, Item[]]) {
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = item.find(i => userBank[i.id] && i.highalch && i.tradeable);
		if (!osItem) {
			return msg.send(`You don't have any of this item to alch.`);
		}

		// 5 tick action
		const timePerAlch = Time.Second * 3;
		let fireRuneCost = 5;

		for (const runeProvider of unlimitedFireRuneProviders) {
			if (msg.author.hasItemEquippedAnywhere(runeProvider)) {
				fireRuneCost = 0;
				break;
			}
		}

		const requiredItems = resolveNameBank({
			...(fireRuneCost ? { 'Fire rune': fireRuneCost } : {}),
			'Nature rune': 1,
			[osItem.name]: 1
		});

		quantity = checkActivityQuantity(msg.author, quantity, timePerAlch, requiredItems);
		const duration = quantity * timePerAlch;
		const alchValue = quantity * osItem.highalch;
		const consumedItems = multiplyBank(requiredItems, quantity);
		const consumedItemsList = await createReadableItemListFromBank(this.client, consumedItems);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const alchMessage = await msg.channel.send(
				`${msg.author}, say \`confirm\` to alch ${quantity} ${osItem.name} (${Util.toKMB(
					alchValue
				)}). This will take approximately ${formatDuration(
					duration
				)}, and consume ${consumedItemsList}.`
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

		await addSubTaskToActivityTask<AlchingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				itemID: osItem.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				alchValue,
				type: Activity.Alching
			}
		);

		msg.author.log(`alched Quantity[${quantity}] ItemID[${osItem.id}] for ${alchValue}`);

		const response = `${msg.author.minionName} is now alching ${quantity}x ${
			osItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
