import { roll } from '@oldschoolgg/rng';
import { Emoji, Events } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import Mining from '@/lib/skilling/skills/mining.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const camdozaalMiningTask: MinionTask = {
	type: 'CamdozaalMining',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelID, duration } = data;

		const camdozaalMine = Mining.CamdozaalMine;
		const currentLevel = user.skillsAsLevels.mining;

		// amulet of glory check for mining
		let barroniteGems = 256;
		if (user.hasEquipped('amulet of glory')) {
			barroniteGems = 86;
		}

		// Barronite rock loot table
		const barroniteTable = new LootTable()
			.add('Barronite shards', [4, 6], 76)
			.add('Barronite deposit', 1, 24)
			.tertiary(
				barroniteGems,
				new LootTable()
					.add('Uncut sapphire', 0, 70)
					.add('Uncut sapphire', 1, 32)
					.add('Uncut emerald', 1, 16)
					.add('Uncut ruby', 1, 8)
					.add('Uncut diamond', 1, 8)
			);

		let barroniteShardMined = 0;
		let barroniteDepositMined = 0;

		// Count loot received during trip
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const barroniteMined = barroniteTable.roll();
			if (barroniteMined.has('Barronite shards')) {
				barroniteShardMined++;
				loot.add(barroniteMined);
			} else if (barroniteMined.has('Barronite deposit')) {
				barroniteDepositMined++;
				loot.add(barroniteMined);
			}
		}

		// Add up the xp from the trip
		let miningXpReceived =
			barroniteShardMined * Mining.CamdozaalMine.xp + barroniteDepositMined * Mining.CamdozaalMine.xp * 2;
		let bonusXP = 0;

		// If user has the entire prospector outfit, give an extra 2.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(miningXpReceived * (2.5 / 100));
			miningXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(miningXpReceived * (bonus / 100));
					miningXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: 'mining',
			amount: miningXpReceived,
			duration,
			source: 'CamdozaalMining'
		});

		// Trip finish message
		let str = `${user}, ${user.minionName} finished mining in Camdozaal! ${xpRes}`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Add clue scrolls
		const clueScrollChance = Mining.CamdozaalMine.clueScrollChance!;
		addSkillingClueToLoot(user, 'fishing', quantity, clueScrollChance, loot);

		// Rock golem roll
		const { petDropRate } = skillingPetDropRate(user, 'mining', camdozaalMine.petChance!);
		if (roll(petDropRate / quantity)) {
			loot.add('Rock golem');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Rock golem while mining in Camdozaal at level ${currentLevel} Mining!`
			);
		}

		// Give the user the items from the trip
		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		// BankImage to show the user their loot
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Barronite rocks`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
