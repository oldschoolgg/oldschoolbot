import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
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
			return msg.channel.send("You don't have any of this item to alch.");
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) < 55) {
			return msg.channel.send('You need level 55 Magic to cast High Alchemy');
		}

		// 5 tick action
		const timePerAlch = Time.Second * 3;
		const maxTripLength = msg.author.maxTripLength(Activity.Alching);

		const maxCasts = Math.min(Math.floor(maxTripLength / timePerAlch), userBank[osItem.id]);
		const quantitySpecified = quantity !== null;
		if (!quantity) {
			quantity = maxCasts;
		}

		if (quantity * timePerAlch > maxTripLength) {
			return msg.channel.send(`The max number of alchs you can do is ${maxCasts}!`);
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
		const consumedItems = new Bank({
			...(fireRuneCost > 0 ? { 'Fire rune': fireRuneCost } : {}),
			'Nature rune': quantity
		});
		consumedItems.add(osItem.id, quantity);

		if (!msg.author.owns(consumedItems)) {
			return msg.channel.send(`You don't have the required items, you need ${consumedItems}`);
		}

		await msg.confirm(
			`${msg.author}, please confirm you want to alch ${quantity} ${osItem.name} (${Util.toKMB(
				alchValue
			)}). This will take approximately ${formatDuration(duration)}, and consume ${quantity}x Nature runes.`
		);

		await msg.author.removeItemsFromBank(consumedItems);
		await updateBankSetting(this.client, ClientSettings.EconomyStats.MagicCostBank, consumedItems);

		await addSubTaskToActivityTask<AlchingActivityTaskOptions>({
			itemID: osItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			alchValue,
			type: Activity.Alching,
			quantitySpecified
		});

		msg.author.log(`alched Quantity[${quantity}] ItemID[${osItem.id}] for ${alchValue}`);

		const response = `${msg.author.minionName} is now alching ${quantity}x ${
			osItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.channel.send(response);
	}
}
