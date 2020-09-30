import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import hasGracefulEquipped from '../../lib/gear/functions/hasGracefulEquipped';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Cuttables from '../../lib/skilling/skills/construction/cuttables';
import { SkillsEnum } from '../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, toKMB } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [plankName:...string]',
			aliases: ['saw'],
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, plankName = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			plankName = quantity;
			quantity = null;
		}

		const plank = Cuttables.Plankables.find(
			plank =>
				stringMatches(plank.name, plankName) ||
				stringMatches(plank.name.split(' ')[0], plankName)
		);

		if (!plank) {
			throw `Thats not a valid log to cut. Valid planks are **${Cuttables.Plankables.map(
				plank => plank.name
			).join(', ')}**.`;
		}

		const boosts = [];
		let timePerPlank = (Time.Second * 37) / 27;

		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			timePerPlank *= 0.9;
			boosts.push(`10% for Graceful`);
		}
		if (
			msg.author.skillLevel(SkillsEnum.Woodcutting) >= 60 &&
			msg.author.settings.get(UserSettings.QP) >= 50
		) {
			timePerPlank *= 0.9;
			boosts.push(`10% for Woodcutting Guild unlocked`);
		}

		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timePerPlank);
		}

		if ((await msg.author.numItemsInBankSync(plank.inputItem)) < quantity) {
			quantity = await msg.author.numItemsInBankSync(plank.inputItem);
		}

		if (quantity === 0) {
			throw `You don't have any ${itemNameFromID(plank.inputItem)}.`;
		}

		const GP = msg.author.settings.get(UserSettings.GP);
		const cost = plank!.gpCost * quantity;
		if (GP < cost) {
			throw `You need ${toKMB(cost)} GP to create ${quantity} planks.`;
		}

		const duration = quantity * timePerPlank;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
				msg.author.maxTripLength / timePerPlank
			)}.`;
		}

		await msg.author.removeItemFromBank(plank!.inputItem, quantity);
		await msg.author.removeGP(cost);

		await addSubTaskToActivityTask<SawmillActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				type: Activity.Sawmill,
				duration,
				plankID: plank!.outputItem,
				plankQuantity: quantity,
				userID: msg.author.id,
				channelID: msg.channel.id
			}
		);

		let response = `${msg.author.minionName} is now creating ${quantity} ${itemNameFromID(
			plank.outputItem
		)}s. Sawmill has charged you ${toKMB(
			cost
		)} GP. They'll come back in around ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
