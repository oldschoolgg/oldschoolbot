import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { bankHasItem, formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
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

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		if (name.endsWith('s') || name.endsWith('S')) name = name.slice(0, name.length - 1);

		const rune = Runecraft.Runes.find(
			_rune =>
				stringMatches(_rune.name, name) || stringMatches(_rune.name.split(' ')[0], name)
		);

		if (!rune) {
			return msg.send(
				`Thats not a valid rune. Valid rune are ${Runecraft.Runes.map(
					_rune => _rune.name
				).join(', ')}.`
			);
		}

		const quantityPerEssence = calcMaxRCQuantity(rune, msg.author);

		if (quantityPerEssence === 0) {
			return msg.send(
				`${msg.author.minionName} needs ${rune.levels[0][0]} Runecraft to create ${rune.name}s.`
			);
		}

		if (rune.qpRequired && msg.author.settings.get(UserSettings.QP) < rune.qpRequired) {
			return msg.send(`You need ${rune.qpRequired} QP to craft this rune.`);
		}

		const numEssenceOwned = await msg.author.numberOfItemInBank(itemID('Pure essence'));

		let { tripLength } = rune;
		const boosts = [];
		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			tripLength -= rune.tripLength * 0.1;
			boosts.push(`10% for Graceful`);
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) >= 90) {
			tripLength -= rune.tripLength * 0.1;
			boosts.push(`10% for 90+ Agility`);
		} else if (msg.author.skillLevel(SkillsEnum.Agility) >= 60) {
			tripLength -= rune.tripLength * 0.05;
			boosts.push(`5% for 60+ Agility`);
		}

		let inventorySize = 28;

		// For each pouch the user has, increase their inventory size.
		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const pouch of Runecraft.pouches) {
			if (msg.author.skillLevel(SkillsEnum.Runecraft) < pouch.level) break;
			if (bankHasItem(bank, pouch.id)) {
				inventorySize += pouch.capacity - 1;
			}
		}

		if (inventorySize > 28) {
			boosts.push(`+${inventorySize - 28} inv spaces from pouches`);
		}

		const maxCanDo = Math.floor(msg.author.maxTripLength / tripLength) * inventorySize;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.min(numEssenceOwned, maxCanDo);
		}

		if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
			return msg.send(
				`You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players (\`${msg.cmdPrefix}ge\`).`
			);
		}

		const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
		const duration = numberOfInventories * tripLength;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					rune.name
				} you can craft is ${Math.floor(maxCanDo)}.`
			);
		}

		await msg.author.removeItemFromBank(itemID('Pure essence'), quantity);

		await addSubTaskToActivityTask<RunecraftActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				runeID: rune.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				essenceQuantity: quantity,
				duration,
				type: Activity.Runecraft
			}
		);

		const response = `${msg.author.minionName} is now turning ${quantity}x Essence into ${
			rune.name
		}, it'll take around ${formatDuration(
			duration
		)} to finish, this will take ${numberOfInventories}x trips to the altar. You'll get ${
			quantityPerEssence * quantity
		}x runes due to the multiplier.\n\n**Boosts:** ${boosts.join(', ')}`;

		return msg.send(response);
	}
}
