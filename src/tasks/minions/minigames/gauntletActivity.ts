import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { calcWhatPercent, percentChance } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import type { MinigameName } from '../../../lib/settings/settings';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { gauntlet } from '../../../lib/simulation/gauntlet';
import type { GauntletOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export const gauntletTask: MinionTask = {
	type: 'Gauntlet',
	async run(data: GauntletOptions) {
		const { channelID, quantity, userID, corrupted } = data;
		const user = await mUserFetch(userID);
		const key: MinigameName = corrupted ? 'corrupted_gauntlet' : 'gauntlet';

		const kc = await getMinigameScore(user.id, key);

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

		await incrementMinigameScore(userID, key, quantity - deaths);

		const { previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		const name = `${corrupted ? 'Corrupted' : 'Normal'} Gauntlet`;

		const newKc = await getMinigameScore(user.id, key);

		let str = `${user}, ${user.minionName} finished completing ${quantity}x ${name}. **${chanceOfDeath}% chance of death**, you died in ${deaths}/${quantity} of the attempts.\nYour ${name} KC is now ${newKc}.`;

		if (loot.amount('Youngllef') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
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
