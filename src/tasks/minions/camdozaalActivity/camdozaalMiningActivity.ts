import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

const gemTable = new LootTable()
	.add('Uncut sapphire', 0, 70)
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Uncut ruby', 1, 8)
	.add('Uncut diamond', 1, 8);

const barroniteTable = new LootTable().add('Barronite shards', [4, 6], 76).add('Barronite deposit', 1, 24);

export const camdozaalMiningTask: MinionTask = {
	type: 'CamdozaalMining',
	async run(data: ActivityTaskOptionsWithQuantity) {
		let { quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const currentMiningLevel = user.skillLevel(SkillsEnum.Mining);

		let barroniteShardMined = 0;
		let barroniteDepositMined = 0;

		// Count mined loot from barronite rocks
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			if (roll(256)) {
				loot.add(gemTable.roll());
			} else {
				const barroniteMined = barroniteTable.roll();

				if (barroniteMined.has('Barronite shards')) {
					barroniteShardMined++;
					loot.add(barroniteMined);
					continue;
				}
				if (barroniteMined.has('Barronite deposit')) {
					barroniteDepositMined++;
					loot.add(barroniteMined);
					continue;
				}
			}
		}

		let miningXpReceived = barroniteShardMined * 16 + barroniteDepositMined * 32;
		let bonusXP = 0;

		// If they have the entire prospector outfit, give an extra 2.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(miningXpReceived * (2.5 / 100));
			miningXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasEquipped(parseInt(itemID))) {
					const amountToAdd = Math.floor(miningXpReceived * (bonus / 100));
					miningXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: miningXpReceived,
			duration,
			source: 'CamdozaalMining'
		});

		let str = `${user}, ${user.minionName} finished mining in Camdozzal! ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Add clue scrolls
		const clueScrollChance = 257_770;
		addSkillingClueToLoot(user, SkillsEnum.Mining, quantity, clueScrollChance, loot);

		// Rock golem roll
		const totalBarroniteMined = barroniteShardMined + barroniteShardMined;
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Mining, 741_600);
		if (roll(petDropRate / totalBarroniteMined)) {
			loot.add('Rock Golem');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a **Rock Golem** while Mining in Camdozaal at level ${currentMiningLevel} Mining!`
			);
		}

		// Give the user items
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		// BankImage
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Barronite rocks`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
