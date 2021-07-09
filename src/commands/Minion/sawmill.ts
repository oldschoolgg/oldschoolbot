import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { Planks } from '../../lib/minions/data/planks';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, formatDuration, itemNameFromID, stringMatches, toKMB } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [plankName:...string]',
			aliases: ['saw'],
			usageDelim: ' ',
			categoryFlags: ['minion'],
			description:
				'Sends your minion to turn logs into planks at the sawmill, boosts are given for graceful and woodcutting guild access. Costs GP.',
			examples: ['+sawmill mahogany']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, plankName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			plankName = quantity;
			quantity = null;
		}

		const plank = Planks.find(
			plank => stringMatches(plank.name, plankName) || stringMatches(plank.name.split(' ')[0], plankName)
		);

		if (!plank) {
			return msg.channel.send(
				`Thats not a valid plank to make. Valid planks are **${Planks.map(plank => plank.name).join(', ')}**.`
			);
		}

		const boosts = [];
		let timePerPlank = (Time.Second * 37) / 27;

		if (msg.author.hasGracefulEquipped()) {
			timePerPlank *= 0.9;
			boosts.push('10% for Graceful');
		}
		if (msg.author.skillLevel(SkillsEnum.Woodcutting) >= 60 && msg.author.settings.get(UserSettings.QP) >= 50) {
			timePerPlank *= 0.9;
			boosts.push('10% for Woodcutting Guild unlocked');
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Sawmill);
		const quantitySpecified = quantity !== null;

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timePerPlank);
		}

		const inputItemOwned = msg.author.numItemsInBankSync(plank.inputItem);
		if (inputItemOwned < quantity) {
			quantity = inputItemOwned;
		}

		if (quantity === 0) {
			return msg.channel.send(`You don't have any ${itemNameFromID(plank.inputItem)}.`);
		}

		const GP = msg.author.settings.get(UserSettings.GP);
		let cost = plank!.gpCost * quantity;

		if (GP < cost) {
			return msg.channel.send(`You need ${toKMB(cost)} GP to create ${quantity} planks.`);
		}

		const duration = quantity * timePerPlank;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
					maxTripLength / timePerPlank
				)}.`
			);
		}

		await msg.author.removeItemFromBank(plank!.inputItem, quantity);
		await msg.author.removeGP(cost);

		await this.client.settings.update(
			ClientSettings.EconomyStats.ConstructCostBank,
			addItemToBank(
				this.client.settings.get(ClientSettings.EconomyStats.ConstructCostBank),
				itemID('Coins'),
				cost
			)
		);

		await addSubTaskToActivityTask<SawmillActivityTaskOptions>({
			type: Activity.Sawmill,
			duration,
			plankID: plank!.outputItem,
			plankQuantity: quantity,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantitySpecified
		});

		let response = `${msg.author.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
			quantity > 1 ? 's' : ''
		}. The Sawmill has charged you ${toKMB(cost)} GP. They'll come back in around ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
