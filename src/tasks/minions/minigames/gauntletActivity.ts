import { calcWhatPercent, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { incrementMinigameScore, MinigameName } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { gauntlet } from '../../../lib/simulation/gauntlet';
import { GauntletOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export default class extends Task {
	async run(data: GauntletOptions) {
		const { channelID, quantity, userID, corrupted } = data;
		const user = await mUserFetch(userID);
		const key: MinigameName = corrupted ? 'corrupted_gauntlet' : 'gauntlet';

		const kc = await user.getMinigameScore(key);

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
		if (corrupted && !user.hasItemEquippedOrInBank('Gauntlet cape') && deaths < quantity) {
			loot.add('Gauntlet cape');
		}

		await incrementMinigameScore(userID, key, quantity - deaths);

		const { previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		const name = `${corrupted ? 'Corrupted' : 'Normal'} Gauntlet`;

		const newKc = await user.getMinigameScore(key);

		let str = `${user}, ${user.minionName} finished completing ${quantity}x ${name}. **${chanceOfDeath}% chance of death**, you died in ${deaths}/${quantity} of the attempts.\nYour ${name} KC is now ${newKc}.`;

		if (loot.amount('Youngllef') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received a **Youngllef** <:Youngllef:604670894798798858> while doing the ${name} for the ${formatOrdinal(
					newKc
				)} time!`
			);
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.GauntletLoot, loot);

		const image = await makeBankImage({
			bank: loot,
			title: `Loot From ${quantity - deaths}x ${name}`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { gauntlet: { start: { corrupted } } }, true],
			image.file.buffer,
			data,
			loot
		);
	}
}
