import { Time, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ClueTiers } from '../../lib/clues/clueTiers';
import type { ClueActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { userStatsBankUpdate } from '../../mahoji/mahojiSettings';

const possibleFound = new LootTable()
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (medium)')
	.add('Reward casket (medium)')
	.add('Reward casket (hard)')
	.add('Reward casket (elite)')
	.add('Reward casket (master)')
	.add('Tradeable Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export const clueTask: MinionTask = {
	type: 'ClueCompletion',
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity, duration } = data;
		const clueTier = ClueTiers.find(mon => mon.id === clueID)!;
		const user = await mUserFetch(userID);

		let str = `${user.mention}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues. ${
			user.minionName
		} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`/open name:${clueTier.name}\``;

		const loot = new Bank().add(clueTier.id, quantity);

		if (user.usingPet('Zippy') && duration > Time.Minute * 5) {
			const bonusLoot = new Bank();
			const numberOfMinutes = Math.floor(duration / Time.Minute);

			for (let i = 0; i < numberOfMinutes / randInt(5, 10); i++) {
				const item = possibleFound.roll().items()[0][0].id;
				bonusLoot.add(item);
			}
			if (bonusLoot.length > 0) {
				await updateBankSetting('zippy_loot', bonusLoot);
				await userStatsBankUpdate(user.id, 'loot_from_zippy_bank', bonusLoot);
			}

			loot.add(bonusLoot);

			if (roll(15)) {
				await updateBankSetting('zippy_loot', loot);
				await userStatsBankUpdate(user.id, 'loot_from_zippy_bank', loot);
				loot.multiply(2);
				str += '\nZippy has **doubled** your loot.';
			}

			str += `\n\nZippy has found these items for you: ${new Bank(bonusLoot)}`;
		}
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
