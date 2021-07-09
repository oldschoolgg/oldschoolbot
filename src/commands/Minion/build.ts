import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, round, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to train Construction by building things.',
			categoryFlags: ['minion', 'skilling'],
			examples: ['+build crude wooden chair', '+build 20 mahogany table']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, objectName = '']: [null | number | string, string]) {
		if (msg.flagArgs.xphr) {
			let str = 'Approximate XP/Hr\n\n';
			for (let i = 1; i < 100; i += 5) {
				str += `\n---- Level ${i} ----`;
				let results: [string, number][] = [];
				for (const obj of Constructables) {
					if (i < obj.level) continue;
					const xp = Math.floor((Time.Hour / (obj.ticks * 300)) * obj.xp);
					results.push([obj.name, xp]);
				}
				for (const [name, xp] of results.sort((a, b) => a[1] - b[1])) {
					str += `\n${name}: ${xp.toLocaleString()} XP/HR`;
				}
				str += '\n\n\n';
			}
			return msg.channel.send({ files: [new MessageAttachment(Buffer.from(str), 'construction-xpxhr.txt')] });
		}

		if (typeof quantity === 'string') {
			objectName = quantity;
			quantity = null;
		}

		await msg.author.settings.sync(true);
		const object = Constructables.find(
			object => stringMatches(object.name, objectName) || stringMatches(object.name.split(' ')[0], objectName)
		);

		if (!object) {
			return msg.channel.send(
				`Thats not a valid object to build. Valid objects are ${Constructables.map(object => object.name).join(
					', '
				)}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Construction) < object.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${object.level} Construction to create a ${object.name}.`
			);
		}

		let timeToBuildSingleObject = object.ticks * 300;

		const [plank, planksQtyCost] = object.input;

		const userBank = msg.author.bank();
		const planksHas = userBank.amount(plank);

		const maxTripLength = msg.author.maxTripLength(Activity.Construction);

		const quantitySpecified = quantity !== null;
		// If no quantity provided, set it to the max the player can make by either the items in bank or time.
		if (quantity === null) {
			const maxForMaterials = planksHas / planksQtyCost;
			const maxForTime = Math.floor(maxTripLength / timeToBuildSingleObject);
			quantity = Math.floor(Math.min(maxForTime, Math.max(maxForMaterials, 1)));
		}

		if (planksHas < planksQtyCost * quantity) {
			return msg.channel.send(
				`You don't have enough ${itemNameFromID(plank)} to make ${quantity}x ${object.name}.`
			);
		}

		const totalPlanksNeeded = planksQtyCost * quantity;

		const objectsPerInv = 26 / planksQtyCost;
		const invsPerTrip = round(quantity / objectsPerInv, 2);

		const duration = quantity * timeToBuildSingleObject;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)} minutes, try a lower quantity. The highest amount of ${object.name}s you can build is ${Math.floor(
					maxTripLength / timeToBuildSingleObject
				)}.`
			);
		}

		const gpNeeded = Math.floor(10_000 * (invsPerTrip / 8));
		if (msg.author.settings.get(UserSettings.GP) < gpNeeded) {
			return msg.channel.send("You don't have enough GP to pay your Butler.");
		}
		await msg.author.removeGP(gpNeeded);
		await msg.author.removeItemFromBank(plank, totalPlanksNeeded);

		await this.client.settings.update(
			ClientSettings.EconomyStats.ConstructCostBank,
			new Bank(this.client.settings.get(ClientSettings.EconomyStats.ConstructCostBank))
				.add('Coins', gpNeeded)
				.add(plank, totalPlanksNeeded).bank
		);

		await addSubTaskToActivityTask<ConstructionActivityTaskOptions>({
			objectID: object.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Construction,
			quantitySpecified
		});

		const xpHr = `${(((object.xp * quantity) / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr`;

		return msg.channel.send(
			`${msg.author.minionName} is now constructing ${quantity}x ${
				object.name
			}, it'll take around ${formatDuration(duration)} to finish. Removed ${totalPlanksNeeded}x ${itemNameFromID(
				plank
			)} from your bank. **${xpHr}**

You paid ${gpNeeded.toLocaleString()} GP, because you used ${invsPerTrip} inventories of planks.
`
		);
	}
}
