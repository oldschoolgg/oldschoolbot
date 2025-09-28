import { calcWhatPercent, Events, formatOrdinal, percentChance } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { MinigameName } from '@/lib/settings/minigames.js';
import { gauntlet } from '@/lib/simulation/gauntlet.js';
import type { GauntletOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';

export const gauntletTask: MinionTask = {
	type: 'Gauntlet',
	isNew: true,
	async run(data: GauntletOptions, { user, handleTripFinish }) {
		const { channelID, quantity, corrupted } = data;
		const key: MinigameName = corrupted ? 'corrupted_gauntlet' : 'gauntlet';

		const kc = await user.fetchMinigameScore(key);

		let chanceOfDeath = corrupted ? 6 : 3;
		chanceOfDeath += Math.max(0, calcWhatPercent(50 - kc, 50) / 2);

		const loot = new Bank();

		let deaths = 0;
		for (let i = 0; i < quantity; i++) {
			const died = percentChance(chanceOfDeath);
			if (died) {
				deaths++;
			}
			loot.add(
				gauntlet({
					died,
					type: corrupted ? 'corrupted' : 'normal'
				})
			);
		}
		if (corrupted && !user.hasEquippedOrInBank('Gauntlet cape') && deaths < quantity) {
			loot.add('Gauntlet cape');
		}

		await user.incrementMinigameScore(key, quantity - deaths);

		const { previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		const name = `${corrupted ? 'Corrupted' : 'Normal'} Gauntlet`;

		const newKc = await user.fetchMinigameScore(key);

		const str = `${user}, ${user.minionName} finished completing ${quantity}x ${name}. **${chanceOfDeath}% chance of death**, you died in ${deaths}/${quantity} of the attempts.\nYour ${name} KC is now ${newKc}.`;

		if (loot.amount('Youngllef') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a **Youngllef** <:Youngllef:604670894798798858> while doing the ${name} for the ${formatOrdinal(
					newKc
				)} time!`
			);
		}

		updateBankSetting('gauntlet_loot', loot);

		const image = await makeBankImage({
			bank: loot,
			title: `Loot From ${quantity - deaths}x ${name}`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
