import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji, Time } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { defaultPatches, resolvePatchTypeSetting } from '../../lib/minions/farming';
import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import Farming from '../../lib/skilling/skills/farming';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, stringMatches, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['cp'],
			description: `Allows a player to check the growth status of all patches at once.`,
			examples: ['+checkpatch', '+cp'],
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

		const patchArray = Object.values(FarmingPatchTypes);
		for (let i = 0; i < patchArray.length; i++) {
			const patchType = patchArray[i];

			baseStr = `**${toTitleCase(patchType)} patch:** `;

			const getPatchType = resolvePatchTypeSetting(patchType);
			if (!getPatchType) return;
			const patch = msg.author.settings.get(getPatchType) ?? defaultPatches;

			if (patch.lastPlanted) {
				const { lastPlanted } = patch;
				const plant = Farming.Plants.find(plants =>
					plants.aliases.some(
						alias =>
							stringMatches(alias, lastPlanted) ||
							stringMatches(alias.split(' ')[0], lastPlanted)
					)
				);

				if (!plant) {
					this.client.wtf(
						new Error(`${msg.author.sanitizedName}'s patch had no plant found in it.`)
					);
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
			const emptyContentStr = `You have nothing planted in these patches: ${nothingPlanted.join(
				`, `
			)}.`;
			finalStr += emptyEmoji + emptyContentStr;
		}

		return msg.send(finalStr, {
			split: true
		});
	}
}
