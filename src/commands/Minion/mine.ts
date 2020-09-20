import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import {
	determineScaledOreTime,
	formatDuration,
	itemNameFromID,
	reduceNumByPercent,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const pickaxes = [
	{
		id: itemID('3rd age pickaxe'),
		reductionPercent: 13,
		miningLvl: 61
	},
	{
		id: itemID('Gilded pickaxe'),
		reductionPercent: 11,
		miningLvl: 41
	},
	{
		id: itemID('Infernal pickaxe'),
		reductionPercent: 10,
		miningLvl: 61
	},
	{
		id: itemID('Dragon pickaxe'),
		reductionPercent: 6,
		miningLvl: 61
	}
];

const gloves = [
	{
		id: itemID('Expert mining gloves'),
		reductionPercent: 6
	},
	{
		id: itemID('Superior mining gloves'),
		reductionPercent: 4
	},
	{
		id: itemID('Mining gloves'),
		reductionPercent: 2
	}
];

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

		const ore = Mining.Ores.find(
			ore => stringMatches(ore.name, name) || stringMatches(ore.name.split(' ')[0], name)
		);

		if (!ore) {
			throw `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(
				ore => ore.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Mining) < ore.level) {
			throw `${msg.author.minionName} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		// Calculate the time it takes to mine a single ore of this type, at this persons level.
		let timeToMine = determineScaledOreTime(
			ore!.xp,
			ore.respawnTime,
			msg.author.skillLevel(SkillsEnum.Mining)
		);

		if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven pickaxe'))) {
			timeToMine /= 2;
		}

		// For each pickaxe, if they have it, give them its' bonus and break.
		const boosts = [];
		for (const pickaxe of pickaxes) {
			if (
				msg.author.hasItemEquippedOrInBank(pickaxe.id) &&
				msg.author.skillLevel(SkillsEnum.Mining) >= pickaxe.miningLvl
			) {
				timeToMine = reduceNumByPercent(timeToMine, pickaxe.reductionPercent);
				boosts.push(`${pickaxe.reductionPercent}% for ${itemNameFromID(pickaxe.id)}`);
				break;
			}
		}
		if (msg.author.skillLevel(SkillsEnum.Mining) >= 60) {
			for (const glove of gloves) {
				if (msg.author.hasItemEquippedAnywhere(glove.id)) {
					timeToMine = reduceNumByPercent(timeToMine, glove.reductionPercent);
					boosts.push(`${glove.reductionPercent}% for ${itemNameFromID(glove.id)}`);
					break;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToMine);
		}
		const duration = quantity * timeToMine;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				ore.name
			} you can mine is ${Math.floor(msg.author.maxTripLength / timeToMine)}.`;
		}

		await addSubTaskToActivityTask<MiningActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				oreID: ore.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Mining
			}
		);

		let response = `${msg.author.minionName} is now mining ${quantity}x ${
			ore.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (msg.author.equippedPet() === itemID('Doug')) {
			response += `\n<:doug:748892864813203591> Doug joins you on your mining trip!`;
		}

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
