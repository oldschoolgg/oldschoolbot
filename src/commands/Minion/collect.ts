import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { CollectingOptions } from '../../lib/types/minions';
import { addBanks, formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

interface Collectable {
	item: Item;
	skillReqs?: Skills;
	itemCost: Bank;
	quantity: number;
	duration: number;
	qpRequired?: number;
}

export const collectables: Collectable[] = [
	{
		item: getOSItem('Blue dragon scale'),
		quantity: 26,
		itemCost: new Bank({
			'Water rune': 1,
			'Air rune': 3,
			'Law rune': 1
		}),
		skillReqs: {
			agility: 70,
			magic: 37
		},
		duration: Time.Minute * 2
	},
	{
		item: getOSItem('Mort myre fungus'),
		quantity: 100,
		itemCost: new Bank({
			'Prayer potion(4)': 1,
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			prayer: 50
		},
		duration: Time.Minute * 8.3,
		qpRequired: 32
	},
	{
		item: getOSItem("Red spiders' eggs"),
		quantity: 80,
		itemCost: new Bank({
			'Stamina potion(4)': 1
		}),
		duration: Time.Minute * 8.5
	},
	{
		item: getOSItem('Snape grass'),
		quantity: 120,
		itemCost: new Bank({
			'Law rune': 12,
			'Astral rune': 12
		}),
		duration: Time.Minute * 6.5,
		qpRequired: 72
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to collect items.',
			categoryFlags: ['minion'],
			examples: ['+collect snape grass']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, objectName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			objectName = quantity;
			quantity = null;
		}
		const collectable = collectables.find(c => stringMatches(c.item.name, objectName));
		if (!collectable) {
			return msg.channel.send(
				`That's not something your minion can collect, you can collect these things: ${collectables
					.map(i => i.item.name)
					.join(', ')}.`
			);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Collecting);
		const quantitySpecified = quantity !== null;
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / collectable.duration);
		}

		let duration = collectable.duration * quantity;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on a trip longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${collectable.item.name} is ${Math.floor(
					maxTripLength / collectable.duration
				)}.`
			);
		}

		const cost = collectable.itemCost.clone().multiply(quantity);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You don't have the items needed for this trip, you need: ${cost}.`);
		}
		await msg.author.removeItemsFromBank(cost);

		await this.client.settings.update(
			ClientSettings.EconomyStats.CollectingCost,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.CollectingCost), cost.bank])
		);

		await addSubTaskToActivityTask<CollectingOptions>({
			collectableID: collectable.item.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Collecting,
			quantitySpecified
		});

		return msg.channel.send(
			`${msg.author.minionName} is now collecting ${quantity * collectable.quantity}x ${
				collectable.item.name
			}, it'll take around ${formatDuration(duration)} to finish.

Removed ${cost} from your bank.`
		);
	}
}
