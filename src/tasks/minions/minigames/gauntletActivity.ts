import { calcWhatPercent, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MinigameKey } from '../../../extendables/User/Minigame';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { gauntlet } from '../../../lib/simulation/gauntlet';
import { GauntletOptions } from '../../../lib/types/minions';
import { addBanks, incrementMinionDailyDuration } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: GauntletOptions) {
		const { channelID, quantity, duration, userID, corrupted } = data;
		const user = await this.client.users.fetch(userID);
		const key: MinigameKey = corrupted ? 'CorruptedGauntlet' : 'Gauntlet';

		incrementMinionDailyDuration(this.client, userID, duration);
		await incrementMinigameScore(userID, key, quantity);
		const kc = await user.getMinigameScore(key);

		let chanceOfDeath = corrupted ? 6 : 3;
		chanceOfDeath += calcWhatPercent(100 - kc, 100) / 2;

		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(
				gauntlet({
					died: percentChance(chanceOfDeath),
					type: corrupted ? 'corrupted' : 'normal'
				})
			);
		}

		const { previousCL } = await user.addItemsToBank(loot.bank, true);

		let str = `${user}, ${user.minionName} finished completing ${quantity}x ${
			corrupted ? 'Corrupted' : 'Normal'
		} Gauntlet. **${chanceOfDeath}% chance of death**`;

		await this.client.settings.update(
			ClientSettings.EconomyStats.GauntletLoot,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.GauntletLoot),
				loot.bank
			])
		);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Gauntlet`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued gauntlet`);
				return this.client.commands.get('gauntlet')!.run(res, []);
			},
			image!,
			data,
			loot.bank
		);
	}
}
