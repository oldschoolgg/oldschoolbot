import { deepClone, objectEntries } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Not } from 'typeorm';

import { Emoji } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingPatchTypes } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcNumOfPatches } from '../../lib/skilling/functions/calcsFarming';
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
		const farmingSettings = {
			...deepClone(await msg.author.settings.get(UserSettings.Minion.FarmingSettings))
		};
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
		const missingPatches: string[] = [];
		arrayLoop: for (let i = 0; i < patchArray.length; i++) {
			for (const seed of Farming.Plants.filter(f => f.seedType === patchArray[i])) {
				const max = calcNumOfPatches(seed, msg.author, msg.author.settings.get(UserSettings.QP));
				if (
					max > 0 &&
					seed.level <= userFarmingLevel &&
					!farmingSettings.blockedPatches?.includes(patchArray[i])
				) {
					missingPatches.push(patchArray[i]);
					continue arrayLoop;
				}
			}
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
			message += `${hasReady ? '\n\n' : ''}<:ehpclock:352323705210142721> **Growing**:\n`;
			message += objectEntries(notReady)
				.filter(v => v[1].length > 0)
				.map(r => `**${r[0]}:** ${r[1].join(', ')}`)
				.join('\n');
		}

		if (missingPatches.length > 0)
			message += `\n\n${Emoji.RedX} **Nothing planted in**:\n${missingPatches.map(toTitleCase).join(', ')}`;

		return msg.channel.send(message);
	}
}
