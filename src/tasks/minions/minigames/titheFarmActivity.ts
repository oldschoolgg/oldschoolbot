import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TitheFarmActivityTaskOptions } from '../../../lib/types/minions';
import { bankHasItem, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: TitheFarmActivityTaskOptions) {
		const { userID, channelID } = data;
		const baseHarvest = 85;
		const lootStr: string[] = [];
		const levelStr: string[] = [];

		const user = await this.client.users.fetch(userID);

		const farmingLvl = user.skillLevel(SkillsEnum.Farming);
		const titheFarmsCompleted = user.settings.get(UserSettings.Stats.TitheFarmsCompleted);
		const titheFarmPoints = user.settings.get(UserSettings.Stats.TitheFarmPoints);

		const determineHarvest = baseHarvest + Math.min(15, titheFarmsCompleted);
		const determinePoints = determineHarvest - 74;

		await user.settings.update(UserSettings.Stats.TitheFarmsCompleted, titheFarmsCompleted + 1);
		await user.settings.update(
			UserSettings.Stats.TitheFarmPoints,
			titheFarmPoints + determinePoints
		);

		let fruit = '';
		let fruitXp = 0;
		if (farmingLvl < 54) {
			fruitXp = 6;
			fruit = 'golovanova';
		} else if (farmingLvl < 74) {
			fruitXp = 14;
			fruit = 'bologano';
		} else {
			fruitXp = 23;
			fruit = 'logavano';
		}

		const harvestXp = determineHarvest * fruitXp;
		const depositXp = 74 * 10 * fruitXp + (determineHarvest - 74) * 20 * fruitXp;
		const bonusFruitXp = 250 * fruitXp;
		const farmingXp = harvestXp + depositXp + bonusFruitXp;

		const harvestStr = `${user} ${user.minionName} successfully harvested ${determineHarvest}x ${fruit} fruit and received ${farmingXp} Farming XP.`;
		const completedStr = `You have completed the ${Emoji.MinigameIcon} Tithe Farm ${
			titheFarmsCompleted + 1
		}x times. You now have ${titheFarmPoints + determinePoints} points to spend.`;

		const userBank = user.settings.get(UserSettings.Bank);
		let bonusXpMultiplier = 0;
		let farmersPiecesCheck = 0;
		if (
			bankHasItem(userBank, itemID(`Farmer's strawhat`), 1) ||
			user.hasItemEquippedAnywhere(`Farmer's strawhat`)
		) {
			bonusXpMultiplier += 0.004;
			farmersPiecesCheck += 1;
		}
		if (
			bankHasItem(userBank, itemID(`Farmer's jacket`), 1) ||
			bankHasItem(userBank, itemID(`Farmer's shirt`), 1) ||
			user.hasItemEquippedAnywhere([`Farmer's jacket`, `Farmer's shirt`])
		) {
			bonusXpMultiplier += 0.008;
			farmersPiecesCheck += 1;
		}
		if (
			bankHasItem(userBank, itemID(`Farmer's boro trousers`), 1) ||
			user.hasItemEquippedAnywhere(itemID(`Farmer's boro trousers`))
		) {
			bonusXpMultiplier += 0.006;
			farmersPiecesCheck += 1;
		}
		if (
			bankHasItem(userBank, itemID(`Farmer's boots`), 1) ||
			user.hasItemEquippedAnywhere(itemID(`Farmer's boots`))
		) {
			bonusXpMultiplier += 0.002;
			farmersPiecesCheck += 1;
		}
		if (farmersPiecesCheck === 4) bonusXpMultiplier += 0.005;

		const bonusXp = (harvestXp + depositXp) * bonusXpMultiplier;
		const totalXp = farmingXp + bonusXp;

		let bonusXpStr = '';
		if (bonusXp > 0) {
			bonusXpStr = `You received an additional ${Math.floor(
				bonusXp
			)} Bonus XP from your farmer's outfit pieces.`;
		}

		await user.addXP({
			skillName: SkillsEnum.Farming,
			amount: Math.floor(totalXp)
		});

		const newFarmingLevel = user.skillLevel(SkillsEnum.Farming);

		if (newFarmingLevel > farmingLvl) {
			levelStr.push(`\n\n${user.minionName}'s Farming level is now ${newFarmingLevel}!`);
		}

		const loot = new Bank();

		if (roll((7_494_389 - user.skillLevel(SkillsEnum.Farming) * 25) / determineHarvest)) {
			loot.add('Tangleroot');
			lootStr.push('\n\n```diff');
			lootStr.push(`\n- You have a funny feeling you're being followed...`);
			lootStr.push('```');
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Farming} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Tangleroot by completing the ${
					Emoji.MinigameIcon
				} Tithe Farm on their ${titheFarmsCompleted + 1} run!`
			);

			await user.addItemsToBank(loot, true);
		}

		const returnStr = `${harvestStr} ${bonusXpStr}\n\n${completedStr}${levelStr}${lootStr}\n`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			returnStr,
			res => {
				user.log(`attemped another run of the Tithe Farm.`);
				return this.client.commands.get('tithefarm')!.run(res, []);
			},
			undefined,
			data,
			loot.length > 0 ? loot.bank : null
		);
	}
}
