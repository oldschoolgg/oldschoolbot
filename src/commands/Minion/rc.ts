import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import { Activity, Tasks, Time } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const rune = Runecraft.Runes.find(_rune => stringMatches(_rune.name, name));

		if (!rune) {
			throw `Thats not a valid rune to mine. Valid rune are ${Runecraft.Runes.map(
				_rune => _rune.name
			).join(', ')}.`;
		}

		const quantityPerEssence = calcMaxRCQuantity(rune, msg.author);

		if (quantityPerEssence === 0) {
			throw `${msg.author.minionName} needs ${rune.levels[0][0]} Runecraft to create ${rune.name}s.`;
		}

		const numEssenceOwned = await msg.author.numberOfItemInBank(itemID('Pure essence'));

		const maxCanDo = Math.floor(msg.author.maxTripLength / Runecraft.timePerInventory) * 28;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.min(numEssenceOwned, maxCanDo);
		}

		if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
			throw `You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players (\`${msg.cmdPrefix}ge\`).`;
		}

		const numberOfInventories = Math.max(quantity / 28, 1);

		const duration = numberOfInventories * Runecraft.timePerInventory;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				rune.name
			} you can craft is ${Math.floor(maxCanDo)}.`;
		}

		await msg.author.removeItemFromBank(itemID('Pure essence'), quantity);

		const data: RunecraftActivityTaskOptions = {
			runeID: rune.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			essenceQuantity: quantity,
			duration,
			type: Activity.Runecraft,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + Number(Time.Minute)
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now turning ${quantity}x Essence into ${
			rune.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish. You'll get ${quantityPerEssence * quantity}x runes due to the multiplier.`;

		return msg.send(response);
	}
}
