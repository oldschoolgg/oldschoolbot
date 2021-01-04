import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import {
	bankHasItem,
	formatDuration,
	itemNameFromID,
	removeItemFromBank,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [creatureName:...string]',
			aliases: ['catch', 'trap'],
			usageDelim: ' ',
			description: `Allows a player to hunt different creatures for hunter.`,
			examples: ['+hunt 5 herbiboar'],
			categoryFlags: ['minion', 'skilling'],
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, creatureName = '']: [null | number | string, string]) {
		if (msg.flagArgs.creatures) {
			return msg.channel.sendFile(
				Buffer.from(
					Hunter.Creatures.map(
						creature =>
							`${creature.name} - lvl required: ${creature.level}`
					).join('\n')
				),
				`Available Creatures.txt`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const userQP = msg.author.settings.get(UserSettings.QP);
		const boosts = [];
		let traps = 1;

		if (typeof quantity === 'string') {
			creatureName = quantity;
			quantity = null;
		}

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias =>
					stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) {
			throw `That's not a valid creature to hunt. Valid creatures are ${Hunter.Creatures.map(
				creature => creature.name
			).join(', ')}. *for more creature info write \`${msg.cmdPrefix}hunt --creatures\`.*`;
		}

		if (msg.author.skillLevel(SkillsEnum.Hunter) < creature.level) {
			throw `${msg.author.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`;
		}

		if (creature.qpRequired && userQP < creature.qpRequired) {
			throw `${msg.author.minionName} needs ${creature.qpRequired} Questpoints to hunt ${creature.name}.`;
		}

		if (creature.itemsRequired) {
			if (creature.multiTraps) {
				traps += Math.floor(msg.author.skillLevel(SkillsEnum.Hunter) / 20) + (creature.wildy ? 1 : 0);
			}
			const requiredItems: [string, number][] = Object.entries(creature.itemsRequired);
			for (const [itemID] of requiredItems) {
				if (!bankHasItem(userBank, parseInt(itemID), traps)) {
					throw `You don't have ${traps}x ${itemNameFromID(parseInt(itemID))}, hunter tools can be bought using \`${msg.cmdPrefix}buy\`.`;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = 1 //Calculate correct quantity
		}
		
		let duration = quantity * 5 * Time.Second; //Add correct duration

		// Reduce time if user is experienced hunting the creature, every two hours become 1% better to a cap of 5%
		const TWO_HOURS = Time.Hour * 2;
		const percentReduced = Math.min(Math.floor(msg.author.settings.get(UserSettings.CreatureScores)[creature.name] ?? 1 / (TWO_HOURS / (creature.catchTime * Time.Second))), 5);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for being experienced hunting this creature.`);

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${creature.name} you can hunt is ${/*addstuff*/0}.`;
		}

		let newBank = { ...userBank };

		if (creature.itemsConsumed) {
			const consumedItems: [string, number][] = Object.entries(creature.itemsConsumed);
			for (const [itemID, qty] of consumedItems) {
				if (!bankHasItem(userBank, parseInt(itemID), qty * quantity)) {
					if (msg.author.numItemsInBankSync(parseInt(itemID)) > qty) {
						quantity = Math.floor(msg.author.numItemsInBankSync(parseInt(itemID)) / qty);
					} else {
						throw `You don't have enough ${itemNameFromID(parseInt(itemID))}s.`;
					}
				}
				newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
			}
		}

		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask<HunterActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				creatureName: creature.name,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Hunter
			}
		);

		let response = `${msg.author.minionName} is now hunting ${quantity}x ${
			creature.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
