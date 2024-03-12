import { percentChance } from 'e';
import { Bank } from 'oldschooljs';

import { trackLoot } from '../../../lib/lootTrack';
import Hunter from '../../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../../lib/skilling/types';
import { CrystalImplingActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../../mahoji/mahojiSettings';

export const crystalImplingTask: MinionTask = {
	type: 'CrystalImpling',
	async run(data: CrystalImplingActivityTaskOptions) {
		const { quantity, userID, duration, channelID, usingStaminaPotion } = data;
		const user = await mUserFetch(userID);

		const creature = Hunter.Creatures.find(c => c.name === 'Crystal impling');
		if (!creature) return;

		let creatureTable = creature.table;
		let successfulQuantity = 0;

		const maxImplingsPer60 = 21;
		const maxImplings = Math.round((maxImplingsPer60 / 60) * duration) + 1;

		let catchChance = 20;

		if (userHasGracefulEquipped(user)) {
			catchChance *= 1.05;
		}

		if (usingStaminaPotion) {
			catchChance *= 1.2;
		}

		catchChance = Math.round(catchChance);

		for (let i = 0; i < quantity; i++) {
			if (percentChance(catchChance)) {
				successfulQuantity++;
			}
		}

		successfulQuantity = Math.min(successfulQuantity, maxImplings);

		let xpStr = '';
		let xpReceived = creature.hunterXP * successfulQuantity;

		const loot = new Bank();

		for (let i = 0; i < successfulQuantity; i++) {
			loot.add(creatureTable.roll());
		}
		await user.incrementCreatureScore(creature.id, Math.floor(successfulQuantity));
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		xpStr += await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished hunting ${creature.name} for ${quantity}x minutes. You managed to catch ${successfulQuantity} implings. ${xpStr}`;

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded,
						title: `Loot From ${successfulQuantity} ${creature.name}:`,
						user,
						previousCL
				  });

		await trackLoot({
			id: creature.name,
			changeType: 'loot',
			duration,
			kc: successfulQuantity,
			totalLoot: itemsAdded,
			type: 'Skilling',
			users: [
				{
					id: user.id,
					duration,
					loot: itemsAdded
				}
			]
		});

		updateBankSetting('hunter_loot', itemsAdded);

		return handleTripFinish(user, channelID, str, image?.file.attachment, data, itemsAdded);
	}
};
