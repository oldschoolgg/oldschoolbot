import { CommandStore, KlasaMessage } from 'klasa';
import { Not } from 'typeorm';

import { Emoji } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FarmingPatchesTable, FarmingPatchStatus } from '../../lib/typeorm/FarmingPatchesTable.entity';
import { formatDuration, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['cp', 'checkpatches'],
			description: 'Allows a player to check the growth status of all patches at once.',
			examples: ['+checkpatch', '+cp', '+checkpatches'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		let finalStr: string[] = [];

		const currentDate = new Date();
		const patchArray = Object.values(FarmingPatchTypes);
		const userPlants = await FarmingPatchesTable.find({
			where: {
				userID: msg.author.id,
				status: Not(FarmingPatchStatus.Harvested)
			}
		});

		for (const plant of userPlants) {
			// Remove from patchArray, the patches that are being used
			patchArray.splice(patchArray.indexOf(plant.patchType as FarmingPatchTypes), 1);
			// If the plant is still growing
			if (currentDate < plant.finishDate) {
				finalStr.push(
					`<:ehpclock:352323705210142721> **${toTitleCase(plant.patchType)}**: ${plant.quantity}x ${
						plant.plant
					} will be ready to harvest in ${formatDuration(
						plant.finishDate.getTime() - currentDate.getTime(),
						true
					)}`
				);
			} else {
				finalStr.push(
					`<:secateurs:868671587614855258> **${toTitleCase(plant.patchType)}**: ${plant.quantity}x ${
						plant.plant
					} is ready.`
				);
			}
		}

		if (patchArray.length > 0)
			finalStr.push(`${Emoji.RedX} You have nothing planted in these patches: ${patchArray.join(', ')}`);

		return msg.channel.send(finalStr.join('\n'));
	}
}
