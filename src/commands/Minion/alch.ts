import { CommandStore, KlasaMessage } from 'klasa';

import { Items } from 'oldschooljs';
import { BotCommand } from '../../lib/BotCommand';
import cleanItemName from '../../lib/util/cleanItemName';
import { toKMB } from 'oldschooljs/dist/util/util';
import { formatDuration, rand } from '../../lib/util';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { Activity, Tasks, Time } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import { Item } from 'oldschooljs/dist/meta/types';
import { GuildSettings } from '../../lib/GuildSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion. Use the command \`${msg.guild?.settings.get(GuildSettings.Prefix)}minion buy\` to get one.`;
		}
		
		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			itemName = quantity;
			quantity = null;
		}

		itemName = itemName.toLowerCase();
		const osItem = Items.get(cleanItemName(itemName)) as Item;
		if(!osItem) throw "That is not a valid item.";
		const highAlchValue = osItem.highalch;


		const natureRune = Items.get(cleanItemName("Nature rune"))!;
		const fireRune = Items.get(cleanItemName("Fire rune"))!;
		

		// Gets the amount of each item the minion has in it's bank
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const numAlchables = userBank[osItem.id];
		const numFireRunes = userBank[fireRune.id];
		const numNatureRunes = userBank[natureRune.id];

		// Alching is a 5-tick/3 second action
		const timePerAlch = Time.Second * 3;	

		// Calculates the max number of alchs based on the max duration, runes, and number of items to be alched
		let maxCasts = Math.min(Math.min(numFireRunes/5, numNatureRunes), numAlchables)
		maxCasts = Math.min(Math.floor(msg.author.maxTripLength / timePerAlch), maxCasts)
		
		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = maxCasts;
		}
		
		if (!highAlchValue && highAlchValue == 0) throw `That's not a valid item you can alch.`;

		const duration = quantity * timePerAlch;

		if (duration > msg.author.maxTripLength || quantity > maxCasts) {
			throw `The max number of alchs you can do for this item is ${maxCasts}.`;
		}
		
		// Ensures the minion has all of the required items for the number of alchs
		const hasItem = await msg.author.hasItem(osItem.id, quantity);
		const hasFireRune = await msg.author.hasItem(fireRune.id, quantity*5);
		const hasNatureRune = await msg.author.hasItem(natureRune.id, quantity);
		if (!hasItem) {
			throw `You dont have ${quantity}x ${osItem.name}.`;
		}
		if(!hasFireRune) {
			throw `You don't have ${quantity*5}x ${fireRune.name}`;
		}
		if(!hasNatureRune) {
			throw `You don't have ${quantity}x ${natureRune.name}`;
		}
		

		const totalValue = highAlchValue * quantity;

		// Confirm the user wants to alch the item(s)
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const alchMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to confirm that you want to High Alch ${quantity}x ${osItem.name} for ${totalValue}gp (${toKMB(
					totalValue
				)}).`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return alchMsg.edit(`Cancelling alching item.`);
			}
		}

		const data: AlchingActivityTaskOptions = {
			itemName: osItem.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: quantity,
			duration: duration,
			totalValue: totalValue,
			type: Activity.Alching,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};
		
		// Remove alched items, as well as runes from bank
		await msg.author.removeItemFromBank(osItem.id, quantity);
		await msg.author.removeItemFromBank(fireRune.id, quantity*5);
		await msg.author.removeItemFromBank(natureRune.id, quantity);

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		let response = `${msg.author.minionName} is now alching ${quantity}x ${
			osItem.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
