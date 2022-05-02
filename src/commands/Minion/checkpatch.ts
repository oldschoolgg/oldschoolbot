import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import Farming from '../../lib/skilling/skills/farming';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, stringMatches, toTitleCase } from '../../lib/util';
import { farmingPatchNames, getFarmingInfo } from '../../mahoji/commands/farming';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			aliases: ['cp', 'checkpatches'],
			description: 'Allows a player to check the growth status of all patches at once.',
			examples: ['+checkpatch', '+cp', '+checkpatches'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const currentDate = new Date().getTime();

		let baseStr = '';
		let emojiStr = '';
		let contentStr = '';
		let finalStr = '';
		let nothingPlanted = [];

		const { patches } = await getFarmingInfo(BigInt(msg.author.id));
		for (const patchType of farmingPatchNames) {
			const patch = patches[patchType];
			baseStr = `**${toTitleCase(patchType)} patch:** `;

			if (patch.lastPlanted) {
				const { lastPlanted } = patch;
				const plant = Farming.Plants.find(plants => stringMatches(plants.name, lastPlanted));

				if (!plant) {
					this.client.wtf(new Error(`${msg.author.sanitizedName}'s patch had no plant found in it.`));
					return;
				}

				const lastPlantTime: number = patch.plantTime;
				const difference = currentDate - lastPlantTime;
				if (difference < plant.growthTime * Time.Minute) {
					emojiStr = `${Emoji.Timer} `;
					contentStr = `Your ${patch.lastQuantity}x ${
						plant.name
					} will be ready to harvest in ${formatDuration(
						lastPlantTime + plant.growthTime * Time.Minute - currentDate
					)}!\n`;
				} else {
					emojiStr = `${Emoji.Tick} `;
					contentStr = `Your ${patch.lastQuantity}x ${plant.name} is ready to be harvested!\n`;
				}

				finalStr += emojiStr + baseStr + contentStr;
			} else {
				nothingPlanted.push(toTitleCase(patchType));
			}
		}

		if (nothingPlanted.length > 0) {
			const emptyEmoji = `${Emoji.RedX} `;
			const emptyContentStr = `You have nothing planted in these patches: ${nothingPlanted.join(', ')}.`;
			finalStr += emptyEmoji + emptyContentStr;
		}

		return msg.channel.send(finalStr);
	}
}
