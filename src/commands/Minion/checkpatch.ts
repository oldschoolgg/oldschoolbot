import { objectEntries } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Not } from 'typeorm';

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

		const currentDate = new Date();
		const patchArray = Object.values(FarmingPatchTypes);
		const userPlants = await FarmingPatchesTable.find({
			where: {
				userID: msg.author.id,
				status: Not(FarmingPatchStatus.Harvested)
			}
		});

		const ready: Record<string, string[]> = {};
		const notReady: Record<string, string[]> = {};

		for (const plant of userPlants) {
			// Remove from patchArray, the patches that are being used
			patchArray.splice(patchArray.indexOf(plant.patchType as FarmingPatchTypes), 1);
			// If the plant is still growing
			if (currentDate < plant.finishDate) {
				if (!notReady[toTitleCase(plant.patchType)]) notReady[toTitleCase(plant.patchType)] = [];
				notReady[toTitleCase(plant.patchType)].push(
					`${plant.plant} (${formatDuration(plant.finishDate.getTime() - currentDate.getTime(), true)})`
				);
			} else {
				if (!ready[toTitleCase(plant.patchType)]) ready[toTitleCase(plant.patchType)] = [];
				ready[toTitleCase(plant.patchType)].push(`${plant.plant}`);
			}
		}

		return msg.channel.send(
			`Your Farming Patch Status\n\n<:secateurs:868671587614855258> **Ready to harvest**\n${objectEntries(ready)
				.filter(v => v[1].length > 0)
				.map(r => `**${r[0]}:** ${r[1].join(', ')}`)
				.join('\n')}\n\n<:ehpclock:352323705210142721> **Growing**\n${objectEntries(notReady)
				.filter(v => v[1].length > 0)
				.map(r => `**${r[0]}:** ${r[1].join(', ')}`)
				.join('\n')}\n\nNothing planted in: ${patchArray.length > 0 ? patchArray.join(', ') : '-'}`
		);
	}
}
