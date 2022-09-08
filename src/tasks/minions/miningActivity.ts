import { roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MiningActivityTaskOptions) {
		const { oreID, userID, channelID, duration, powermine } = data;
		let { quantity } = data;
		const user = await this.client.fetchUser(userID);

		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;
		let cleaningXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			user.getGear('skilling').hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}
		const currentLevel = user.skillLevel(SkillsEnum.Mining);

		const loot = new Bank();

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.minerals && user.skillLevel(SkillsEnum.Mining) >= 60) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot.add('Unidentified minerals', numberOfMinerals);
			}
		}

		let daeyaltQty = 0;

		if (!powermine) {
			// Gem rocks roll off the GemRockTable
			if (ore.name === 'Gem rock') {
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.GemRockTable.roll());
				}
			} else if (ore.name === 'Volcanic ash') {
				// Volcanic ash
				const userLevel = user.skillLevel(SkillsEnum.Mining);
				const tiers = [
					[22, 1],
					[37, 2],
					[52, 3],
					[67, 4],
					[82, 5],
					[97, 6]
				];
				for (const [lvl, multiplier] of tiers.reverse()) {
					if (userLevel >= lvl) {
						loot.add(ore.id, quantity * multiplier);
						break;
					}
				}
			} else if (ore.name === 'Sandstone') {
				// Sandstone roll off the SandstoneRockTable
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.SandstoneRockTable.roll());
				}
			} else if (ore.name === 'Granite') {
				// Granite roll off the GraniteRockTable
				for (let i = 0; i < quantity; i++) {
					loot.add(Mining.GraniteRockTable.roll());
				}
			} else if (ore.name === 'Daeyalt essence rock') {
				for (let i = 0; i < quantity; i++) {
					daeyaltQty += rand(2, 3);
				}
				loot.add(ore.id, daeyaltQty);
			} else if (ore.name === 'Motherlode mine') {
				const nuggetWeight = 273;
				let runiteWeight = currentLevel >= 85 ? Math.round(100 * (0.080_71 * currentLevel - 5.721)) : 0;
				let adamantiteWeight = currentLevel >= 70 ? Math.round(100 * (0.5187 * currentLevel - 32.39)) : 0;
				let mithrilWeight = currentLevel >= 55 ? Math.round(100 * (0.2521 * currentLevel + 2.705)) : 0;
				let goldWeight = currentLevel >= 40 ? Math.round(100 * (0.2211 * currentLevel + 2.807)) : 0;

				// Check for falador elite diary for increased ore rates
				const [hasEliteDiary] = await userhasDiaryTier(user, FaladorDiary.elite);
				if (hasEliteDiary) {
					if (currentLevel >= 85) runiteWeight += 100;
					if (currentLevel >= 70) adamantiteWeight += 100;
					mithrilWeight += 100;
					goldWeight += 100;
				}

				const coalWeight =
					10_000 - (nuggetWeight + runiteWeight + adamantiteWeight + mithrilWeight + goldWeight);

				const table = new LootTable()
					.add('Golden nugget', 1, nuggetWeight)
					.add('Runite ore', 1, runiteWeight)
					.add('Adamantite ore', 1, adamantiteWeight)
					.add('Mithril ore', 1, mithrilWeight)
					.add('Gold ore', 1, goldWeight)
					.add('Coal', 1, coalWeight);

				loot.add(table.roll(quantity));
				if (loot.has('Runite ore')) {
					cleaningXP += 75 * loot.amount('Runite ore');
				}
				if (loot.has('Adamantite ore')) {
					cleaningXP += 45 * loot.amount('Adamantite ore');
				}
				if (loot.has('Mithril ore')) {
					cleaningXP += 30 * loot.amount('Mithril ore');
				}
				if (loot.has('Gold ore')) {
					cleaningXP += 15 * loot.amount('Gold ore');
				}
				xpReceived += cleaningXP;
			} else {
				loot.add(ore.id, quantity);
			}
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${xpRes}`;

		// Add clue scrolls
		if (ore.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Mining, quantity, ore.clueScrollChance, loot);
		}

		// Roll for pet
		if (ore.petChance && roll((ore.petChance - currentLevel * 25) / quantity)) {
			loot.add('Rock golem');
			str += "\nYou have a funny feeling you're being followed...";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
			);
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const theQuantity = duration > 0.9 * calcMaxTripLength(user, 'Mining') ? undefined : quantity;
		handleTripFinish(
			user,
			channelID,
			str,
			[
				'mine',
				{
					name: ore.name,
					quantity: theQuantity,
					powermine
				},
				true
			],
			undefined,
			data,
			loot
		);
	}
}
