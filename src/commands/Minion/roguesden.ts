import { reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util/bank';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { RoguesDenMazeTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			aliases: ['rd', 'rogues'],
			requiredPermissionsForBot: ['ADD_REACTIONS', 'ATTACH_FILES'],
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: "Sends your minion to run laps of the Rogues' Den maze. Requires 50 Agility and Thieving.",
			examples: ['+roguesden']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Agility) < 50 || msg.author.skillLevel(SkillsEnum.Thieving) < 50) {
			return msg.channel.send("To attempt the Rogues' Den maze you need 50 Agility and 50 Thieving.");
		}

		const staminasToRemove = new Bank();
		const boosts = [];
		let baseTime = Time.Minute * 9;

		let skillPercentage =
			(msg.author.skillLevel(SkillsEnum.Agility) + msg.author.skillLevel(SkillsEnum.Thieving)) / 20;
		boosts.push(`${skillPercentage}% boost for levels`);

		if (msg.author.skillLevel(SkillsEnum.Thieving) >= 80) {
			skillPercentage += 40;
			boosts.push('40% boost for 80+ Thieving');
		}

		baseTime = reduceNumByPercent(baseTime, skillPercentage);

		let quantity = Math.floor(msg.author.maxTripLength('RoguesDenMaze') / baseTime);

		if (msg.author.hasItemEquippedOrInBank('Stamina potion(4)')) {
			baseTime = reduceNumByPercent(baseTime, 50);

			const potionsInBank = await msg.author.numberOfItemInBank(itemID('Stamina potion(4)'));
			const maxPossibleLaps = Math.floor(msg.author.maxTripLength('RoguesDenMaze') / baseTime);

			// do as many laps as possible with the current stamina potion supply
			quantity = Math.min(potionsInBank * 4, maxPossibleLaps);
			staminasToRemove.add('Stamina potion(4)', Math.max(1, Math.floor(quantity / 4)));
		} else {
			boosts.push('-50% not enough Stamina potions');
		}

		const duration = quantity * baseTime;

		if (staminasToRemove.length > 0) {
			await msg.author.removeItemsFromBank(staminasToRemove.bank);
			await this.client.settings.update(
				ClientSettings.EconomyStats.RoguesDenStaminas,
				addBanks([
					this.client.settings.get(ClientSettings.EconomyStats.RoguesDenStaminas),
					staminasToRemove.bank
				])
			);
		}

		await addSubTaskToActivityTask<RoguesDenMazeTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			minigameID: 'rogues_den',
			type: 'RoguesDenMaze'
		});

		let str = `${
			msg.author.minionName
		} is now off to complete the Rogues' Den maze ${quantity}x times, their trip will take ${formatDuration(
			duration
		)} (${formatDuration(baseTime)} per lap).`;

		if (staminasToRemove.length > 0) {
			str += ` Removed ${staminasToRemove} from your bank.`;
		}

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}
		return msg.channel.send(str);
	}
}
