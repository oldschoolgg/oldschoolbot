import { reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { determineScaledOreTime, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const pickaxes = [
	{
		id: itemID('Crystal pickaxe'),
		reductionPercent: 11,
		miningLvl: 71
	},
	{
		id: itemID('Infernal pickaxe'),
		reductionPercent: 6,
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
			usage: '[quantity:int{1}] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to go mining.',
			examples: ['+mine copper ore', '+mine amethyst']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity = null, name = '']: [null | number, string]) {
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
		if (ore.id === 1625 && msg.author.hasItemEquippedAnywhere('Amulet of glory')) {
			timeToMine = Math.floor(timeToMine / 2);
			boosts.push('50% for having an Amulet of glory equipped');
		}

		const maxTripLength = msg.author.maxTripLength('Mining');

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
			type: 'Mining'
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
