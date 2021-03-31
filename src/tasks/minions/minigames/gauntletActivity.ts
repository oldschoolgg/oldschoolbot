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
		const kc = await user.getMinigameScore(key);

		let chanceOfDeath = corrupted ? 6 : 3;
		chanceOfDeath += Math.max(0, calcWhatPercent(100 - kc, 100) / 2);

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
		if (corrupted && !user.hasItemEquippedOrInBank('Gauntlet cape')) {
			loot.add('Gauntlet cape');
		}

		await incrementMinigameScore(userID, key, quantity - deaths);

		const { previousCL } = await user.addItemsToBank(loot.bank, true);
		const name = `${corrupted ? 'Corrupted' : 'Normal'} Gauntlet`;

		const newKc = await user.getMinigameScore(key);

		let str = `${user}, ${user.minionName} finished completing ${quantity}x ${name}. **${chanceOfDeath}% chance of death**, you died in ${deaths}/${quantity} of the attempts.\nYour ${name} KC is now ${newKc}.`;

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
				`Loot From ${quantity}x ${name}`,
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
				return this.client.commands
					.get('gauntlet')!
					.run(res, [corrupted ? 'corrupted' : 'normal', quantity]);
			},
			image!,
			data,
			loot.bank
		);
	}
}
