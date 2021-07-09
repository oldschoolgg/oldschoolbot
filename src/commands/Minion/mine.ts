import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
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
import resolveItems from '../../lib/util/resolveItems';

const pickaxes = [
	{
		id: itemID('3rd age pickaxe'),
		reductionPercent: 11,
		miningLvl: 61
	},
	{
		id: itemID('Crystal pickaxe'),
		reductionPercent: 11,
		miningLvl: 71
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

const gloryAmulets = resolveItems([
	'Amulet of eternal glory',
	'Amulet of glory (t)',
	'Amulet of glory (t6)',
	'Amulet of glory (t5)',
	'Amulet of glory (t4)',
	'Amulet of glory (t3)',
	'Amulet of glory (t2)',
	'Amulet of glory (t1)',
	'Amulet of glory',
	'Amulet of glory(6)',
	'Amulet of glory(5)',
	'Amulet of glory(4)',
	'Amulet of glory(3)',
	'Amulet of glory(2)',
	'Amulet of glory(1)'
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to go mining.',
			examples: ['+mine copper ore', '+mine amethyst']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const ore = Mining.Ores.find(
			ore => stringMatches(ore.name, name) || stringMatches(ore.name.split(' ')[0], name)
		);

		if (!ore) {
			return msg.channel.send(
				`Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Mining) < ore.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${ore.level} Mining to mine ${ore.name}.`);
		}

		// Calculate the time it takes to mine a single ore of this type, at this persons level.
		let timeToMine = determineScaledOreTime(ore!.xp, ore.respawnTime, msg.author.skillLevel(SkillsEnum.Mining));

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
		// Give gem rocks a speed increase for wearing a glory
		if (ore.id === 1625) {
			for (const amulet of gloryAmulets) {
				if (msg.author.hasItemEquippedAnywhere(amulet)) {
					timeToMine = Math.floor(timeToMine / 2);
					boosts.push(`50% for ${itemNameFromID(amulet)}`);
					break;
				}
			}
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Mining);
		const quantitySpecified = quantity !== null;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToMine);
		}
		const duration = quantity * timeToMine;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${ore.name} you can mine is ${Math.floor(
					maxTripLength / timeToMine
				)}.`
			);
		}

		await addSubTaskToActivityTask<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Mining,
			quantitySpecified
		});

		let response = `${msg.author.minionName} is now mining ${quantity}x ${
			ore.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
