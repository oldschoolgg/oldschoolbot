import { randFloat } from 'e';
import { KlasaMessage, Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';
import { PrayerPageTable } from 'oldschooljs/dist/simulation/clues/General';

import ODSCommand from '../../../commands/Minion/ods';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ExoticSeedsTable } from '../../../lib/simulation/sharedTables';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 100)
	.add('Untradeable mystery box', 1, 40)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');
const BaseTable = new LootTable()
	.add(ExoticSeedsTable, 1, 5)
	.add(PrayerPageTable)
	.add('Magic beans')
	.add(boxTable)
	.add('Magical artifact');
const OuraniaTipTable = new LootTable().tertiary(9, BaseTable);

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinigameScore(userID, 'OuraniaDeliveryService', quantity);

		const user = await this.client.fetchUser(userID);
		const level = user.skillLevel(SkillsEnum.Magic);
		let tokens = Math.floor((quantity / 2) * 3.235 * (level / 25 + 1));
		if (user.equippedPet() === itemID('Flappy')) {
			tokens *= 2;
		}

		await user.settings.update(UserSettings.OuraniaTokens, user.settings.get(UserSettings.OuraniaTokens) + tokens);

		let totalXP = level * (quantity * randFloat(39, 41));
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXP,
			duration
		});

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Ourania deliveries, you received ${tokens} tokens. ${xpRes}`;

		let loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(OuraniaTipTable.roll());
		}
		if (loot.length > 0) {
			if (user.usingPet('Flappy')) {
				loot.multiply(2);
			}
			await user.addItemsToBank(loot, true);
			updateBankSetting(this.client, ClientSettings.EconomyStats.ODSLoot, loot);
			str += `\n\nYou received some tips from Wizards in your delivery route: ${loot}.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued ods');
				return (this.client.commands.get('ods') as ODSCommand)!.start(res) as Promise<KlasaMessage>;
			},
			undefined,
			data,
			null
		);
	}
}
