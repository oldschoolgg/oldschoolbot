import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to cook food.',
			categoryFlags: ['minion', 'skilling'],
			examples: ['+cook manta ray', '+cook 50 shrimps']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, cookableName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			cookableName = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		const cookable = Cooking.Cookables.find(
			cookable =>
				stringMatches(cookable.name, cookableName) || stringMatches(cookable.name.split(' ')[0], cookableName)
		);

		if (!cookable) {
			return msg.channel.send(
				`Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
					cookable => cookable.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`
			);
		}

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.6;
		}

		const userBank = msg.author.bank();
		const inputCost = new Bank(cookable.inputCookables);

		const maxTripLength = msg.author.maxTripLength(Activity.Cooking);
		const quantitySpecified = quantity !== null;
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToCookSingleCookable);
			const max = userBank.fits(inputCost);
			if (max < quantity && max !== 0) quantity = max;
		}

		const totalCost = inputCost.clone().multiply(quantity);

		if (!userBank.fits(totalCost)) {
			return msg.channel.send(`You don't have enough items. You need: ${inputCost}.`);
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)} minutes, try a lower quantity. The highest amount of ${cookable.name}s you can cook is ${Math.floor(
					maxTripLength / timeToCookSingleCookable
				)}.`
			);
		}

		await msg.author.removeItemsFromBank(totalCost);

		await addSubTaskToActivityTask<CookingActivityTaskOptions>({
			cookableID: cookable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Cooking,
			quantitySpecified
		});

		return msg.channel.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${cookable.name}, it'll take around ${formatDuration(
				duration
			)} to finish.`
		);
	}
}
