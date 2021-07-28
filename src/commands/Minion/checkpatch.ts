import { objectEntries } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Not } from 'typeorm';

import { Emoji } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import Farming from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
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
			const index = patchArray.indexOf(plant.patchType as FarmingPatchTypes);
			if (index !== -1) patchArray.splice(patchArray.indexOf(plant.patchType as FarmingPatchTypes), 1);
			// If the plant is still growing
			if (currentDate < plant.finishDate) {
				if (!notReady[toTitleCase(plant.patchType)]) notReady[toTitleCase(plant.patchType)] = [];
				notReady[toTitleCase(plant.patchType)].push(
					`${plant.quantity}x ${plant.plant} (${formatDuration(
						plant.finishDate.getTime() - currentDate.getTime(),
						true
					)})`
				);
			} else {
				if (!ready[toTitleCase(plant.patchType)]) ready[toTitleCase(plant.patchType)] = [];
				ready[toTitleCase(plant.patchType)].push(`${plant.quantity}x ${plant.plant}`);
			}
		}

		// Only show patches that the user can plant something in the 'Nothing planted in'
		const userFarmingLevel = msg.author.skillLevel(SkillsEnum.Farming);
		for (let i = 0; i < patchArray.length; i++) {
			if (!Farming.Plants.find(f => f.level <= userFarmingLevel && f.seedType === patchArray[i]))
				patchArray.splice(i, 1);
		}

		const hasGrowing = objectEntries(notReady).flat(2).length > 0;
		const hasReady = objectEntries(ready).flat(2).length > 0;

		let message = 'Your Farming Patch Status\n\n';
		if (hasReady) {
			message += '<:secateurs:868671587614855258> **Ready**:\n';
			message += objectEntries(ready)
				.filter(v => v[1].length > 0)
				.map(r => `**${r[0]}:** ${r[1].join(', ')}`)
				.join('\n');
		}
		if (hasGrowing) {
			message += '<:ehpclock:352323705210142721> **Growing**:\n';
			message +=
				(hasReady ? '\n\n' : '') +
				objectEntries(notReady)
					.filter(v => v[1].length > 0)
					.map(r => `**${r[0]}:** ${r[1].join(', ')}`)
					.join('\n');
		}

		message += `\n\n${Emoji.RedX} **Nothing planted in**:\n${
			patchArray.length > 0 ? patchArray.map(toTitleCase).join(', ') : '-'
		}`;

		return msg.channel.send(message);
	}
}
