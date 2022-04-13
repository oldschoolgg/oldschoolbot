import { CommandStore, KlasaMessage } from 'klasa';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { determineMiningTime, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const pickaxes = [
	{
		id: itemID('Crystal pickaxe'),
		ticksBetweenRolls: 2.75,
		miningLvl: 71
	},
	{
		id: itemID('Infernal pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Dragon pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Rune pickaxe'),
		ticksBetweenRolls: 3,
		miningLvl: 41
	},
	{
		id: itemID('Adamant pickaxe'),
		ticksBetweenRolls: 4,
		miningLvl: 31
	},
	{
		id: itemID('Mithril pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 21
	},
	{
		id: itemID('Black pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 11
	},
	{
		id: itemID('Steel pickaxe'),
		ticksBetweenRolls: 6,
		miningLvl: 6
	},
	{
		id: itemID('Iron pickaxe'),
		ticksBetweenRolls: 7,
		miningLvl: 1
	},
	{
		id: itemID('Bronze pickaxe'),
		ticksBetweenRolls: 8,
		miningLvl: 1
	}
];

const gloves = [
	{
		id: itemID('Expert mining gloves'),
		'Silver ore': 50,
		Coal: 40,
		'Gold ore': 33.33,
		'Mithril ore': 25,
		'Adamantite ore': 16.66,
		'Runite ore': 12.5,
		'Amethyst ore': 25
	},
	{
		id: itemID('Superior mining gloves'),
		'Silver ore': 0,
		Coal: 0,
		'Gold ore': 0,
		'Mithril ore': 25,
		'Adamantite ore': 16.66,
		'Runite ore': 12.5,
		Amethyst: 0
	},
	{
		id: itemID('Mining gloves'),
		'Silver ore': 50,
		Coal: 40,
		'Gold ore': 33.33,
		'Mithril ore': 0,
		'Adamantite ore': 0,
		'Runite ore': 0,
		Amethyst: 0
	}
];

const varrockArmours = [
	{
		id: itemID('Varrock armour 4'),
		Clay: 10,
		'Copper ore': 10,
		'Tin ore': 10,
		'Iron ore': 10,
		'Silver ore': 10,
		Coal: 10,
		Sandstone: 10,
		'Gold ore': 10,
		Granite: 10,
		'Mithril ore': 10,
		'Adamantite ore': 10,
		'Runite ore': 10,
		Amethyst: 10
	},
	{
		id: itemID('Varrock armour 3'),
		Clay: 10,
		'Copper ore': 10,
		'Tin ore': 10,
		'Iron ore': 10,
		'Silver ore': 10,
		Coal: 10,
		Sandstone: 10,
		'Gold ore': 10,
		Granite: 10,
		'Mithril ore': 10,
		'Adamantite ore': 10,
		'Runite ore': 0,
		Amethyst: 0
	},
	{
		id: itemID('Varrock armour 2'),
		Clay: 10,
		'Copper ore': 10,
		'Tin ore': 10,
		'Iron ore': 10,
		Silver: 10,
		Coal: 10,
		Sandstone: 10,
		'Gold ore': 10,
		Granite: 10,
		'Mithril ore': 10,
		'Adamantite ore': 0,
		'Runite ore': 0,
		Amethyst: 0
	},
	{
		id: itemID('Varrock armour 1'),
		Clay: 10,
		'Copper ore': 10,
		'Tin ore': 10,
		'Iron ore': 10,
		'Silver ore': 10,
		Coal: 10,
		Sandstone: 0,
		'Gold ore': 0,
		Granite: 0,
		'Mithril ore': 0,
		'Adamantite ore': 0,
		'Runite ore': 0,
		Amethyst: 0
	}
];

const miningCape = {
	id: itemID('Mining cape'),
	Clay: 5,
	'Copper ore': 5,
	'Tin ore': 5,
	'Iron ore': 5,
	'Silver ore': 5,
	Coal: 5,
	Sandstone: 5,
	'Gold ore': 5,
	Granite: 5,
	'Mithril ore': 5,
	'Adamantite ore': 5,
	'Runite ore': 0,
	Amethyst: 0
};

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

		let miningLevel = msg.author.skillLevel(SkillsEnum.Mining);
		if ((ore.minerals || ore.nuggets) && msg.author.skillLevel(SkillsEnum.Mining) >= 60) {
			miningLevel += 7;
		}
		// Checks if user own Celestial ring or Celestial signet
		if (msg.author.hasItemEquippedOrInBank('Celestial ring')) {
			miningLevel += 4;
		}

		let currentPickaxe = null;
		// For each pickaxe, if they have it, give them its' bonus and break.
		const boosts = [];
		for (const pickaxe of pickaxes) {
			if (
				msg.author.hasItemEquippedOrInBank(pickaxe.id) &&
				msg.author.skillLevel(SkillsEnum.Mining) >= pickaxe.miningLvl
			) {
				currentPickaxe = pickaxe;
				boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
				break;
			}
		}

		if (currentPickaxe === null) {
			return msg.channel.send('You need to own a pickaxe suitable for your mining level.');
		}

		let glovesRate = 0;
		if ((ore.minerals || ore.nuggets) && msg.author.skillLevel(SkillsEnum.Mining) >= 60) {
			for (const glove of gloves) {
				if (msg.author.hasItemEquippedAnywhere(glove.id)) {
					for (const [name, value] of Object.entries(glove)) {
						if (name === ore.name) {
							glovesRate = value;
							boosts.push(`Lowered rock depletion rate by **${value}%** for ${itemNameFromID(glove.id)}`);
							break;
						}
					}
				}
			}
		}

		let armourEffect = 0;
		for (const armour of varrockArmours) {
			if (msg.author.hasItemEquippedOrInBank(armour.id)) {
				for (const [name, value] of Object.entries(armour)) {
					if (name === ore.name) {
						armourEffect = value;
						boosts.push(`**${value}%** chance to mine an extra ore using ${itemNameFromID(armour.id)}`);
						break;
					}
				}
			}
			if (armourEffect !== 0) {
				break;
			}
		}

		let miningCapeEffect = 0;
		if (msg.author.hasItemEquippedOrInBank(miningCape.id)) {
			for (const [name, value] of Object.entries(miningCape)) {
				if (name === ore.name) {
					miningCapeEffect = value;
					boosts.push(`**${value}%** chance to mine an extra ore using ${itemNameFromID(miningCape.id)}`);
					break;
				}
			}
		}

		let powerMine = false;
		if (msg.flagArgs.pm) {
			powerMine = true;
		}
		// Calculate the time it takes to mine specific quantity or as many as possible.
		let [timeToMine, newQuantity] = determineMiningTime(
			quantity,
			msg.author,
			ore,
			currentPickaxe.ticksBetweenRolls,
			glovesRate,
			armourEffect,
			miningCapeEffect,
			powerMine,
			miningLevel
		);

		const duration = timeToMine;

		if (ore.id === 1625 && msg.author.hasItemEquippedAnywhere('Amulet of glory')) {
			boosts.push('3x success rate for having an Amulet of glory equipped');
		}

		await addSubTaskToActivityTask<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: newQuantity,
			powerMine,
			duration,
			type: 'Mining'
		});

		let response = `${msg.author.minionName} is now mining ${newQuantity}x ${
			ore.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
