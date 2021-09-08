import { roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { itemID, multiplyBank, rand } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MiningActivityTaskOptions) {
		const { oreID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;

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
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${xpRes}`;

		const loot = new Bank();

		const numberOfMinutes = duration / Time.Minute;

		if (roll(10)) {
			if (duration > Time.Minute * 10) {
				loot.bank = multiplyBank(loot.values(), 2);
				loot.add(getRandomMysteryBox(), 1);
			}
		}

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

		if (numberOfMinutes > 10 && ore.nuggets) {
			let numberOfNuggets = rand(0, Math.floor(numberOfMinutes / 4));
			if (user.hasItemEquippedAnywhere('Mining master cape')) {
				numberOfNuggets *= 2;
			}
			loot.add('Golden nugget', numberOfNuggets);
		} else if (numberOfMinutes > 10 && ore.minerals) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				if (user.hasItemEquippedAnywhere('Mining master cape')) {
					numberOfMinerals *= 2;
				}
				loot.add('Unidentified minerals', numberOfMinerals);
			}
		}

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutesInTrip = Math.ceil(duration / Time.Minute);
			for (let i = 0; i < minutesInTrip; i++) {
				if (roll(12_000)) {
					loot.add('Doug');
					str +=
						"\n<:doug:748892864813203591> A pink-colored mole emerges from where you're mining, and decides to join you on your adventures after seeing your groundbreaking new methods of mining.";
					break;
				}
			}
		}

		// Gem rocks roll off the GemRockTable
		if (ore.id === 1625) {
			for (let i = 0; i < quantity; i++) {
				loot.add(Mining.GemRockTable.roll());
			}
		} else if (ore.id === 21_622) {
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
		} else {
			loot.add(ore.id, quantity);
		}

		const hasKlik = user.equippedPet() === itemID('Klik');
		if (hasKlik) {
			const smeltedOre = Smithing.Bars.find(o => o.inputOres[ore.id] && Object.keys(o.inputOres).length === 1);
			if (smeltedOre) {
				loot.remove(ore.id, loot.amount(ore.id));
				loot.add(smeltedOre.id, quantity);
				str +=
					'\n<:klik:749945070932721676> Klik breathes a incredibly hot fire breath, and smelts all your ores!';
			}
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		if (user.hasItemEquippedAnywhere('Mining master cape')) {
			str += '\n2x minerals/nuggets for Mining master cape.';
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${ore.name}[${ore.id}]`);
				return this.client.commands.get('mine')!.run(res, [quantity, ore.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
