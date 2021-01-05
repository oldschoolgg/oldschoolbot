import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events, Time } from '../../lib/constants';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import { getRandomMysteryBox } from '../../lib/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Cookables } from '../../lib/skilling/skills/cooking';
import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import { anglerBoostPercent, calcPercentOfNum, multiplyBank, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: FishingActivityTaskOptions) {
		let { fishID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		const currentAgilityLevel = user.skillLevel(SkillsEnum.Agility);

		const fish = Fishing.Fishes.find(fish => fish.id === fishID);
		if (!fish) return;

		let xpReceived = 0;
		let leapingSturgeon = 0;
		let leapingSalmon = 0;
		let leapingTrout = 0;
		let agilityXpReceived = 0;
		if (fish.name === 'Barbarian fishing') {
			for (let i = 0; i < quantity; i++) {
				if (
					roll(255 / (8 + Math.floor(0.5714 * user.skillLevel(SkillsEnum.Fishing)))) &&
					user.skillLevel(SkillsEnum.Fishing) >= 70 &&
					user.skillLevel(SkillsEnum.Agility) >= 45
				) {
					xpReceived += 80;
					agilityXpReceived += 7;
					leapingSturgeon += 1;
				} else if (
					roll(255 / (16 + Math.floor(0.8616 * user.skillLevel(SkillsEnum.Fishing)))) &&
					user.skillLevel(SkillsEnum.Fishing) >= 58 &&
					user.skillLevel(SkillsEnum.Agility) >= 30
				) {
					xpReceived += 70;
					leapingSalmon += 1;
					agilityXpReceived += 6;
				} else if (
					roll(255 / (32 + Math.floor(1.632 * user.skillLevel(SkillsEnum.Fishing))))
				) {
					xpReceived += 50;
					leapingTrout += 1;
					agilityXpReceived += 5;
				}
			}
		} else {
			xpReceived = quantity * fish.xp;
		}
		let bonusXP = 0;

		// If they have the entire angler outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Fishing.anglerItems).map(i => parseInt(i)),
				user.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Fishing, xpReceived);
		await user.addXP(SkillsEnum.Agility, agilityXpReceived);

		const newLevel = user.skillLevel(SkillsEnum.Fishing);
		const newAgilityLevel = user.skillLevel(SkillsEnum.Agility);

		let str = `${user}, ${user.minionName} finished fishing ${quantity} ${
			fish.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}

		if (fish.id === itemID('Raw karambwanji')) {
			quantity *= 1 + Math.floor(user.skillLevel(SkillsEnum.Fishing) / 5);
		}
		let loot = new Bank({
			[fish.id]: quantity
		});

		if (user.equippedPet() === itemID('Klik')) {
			const cookedFish = Cookables.find(c => Boolean(c.inputCookables[fish.id]));
			if (cookedFish) {
				loot.remove(fish.id, quantity);
				loot.add(cookedFish.id, quantity);
				str += `\n<:klik:749945070932721676> Klik breathes a incredibly hot fire breath, and cooks all your fish!`;
			}
		}

		if (duration > Time.Minute * 20 && roll(10)) {
			loot.bank = multiplyBank(loot.bank, 2);
			loot.add(getRandomMysteryBox());
		}

		if (fish.clueScrollChance) {
			loot.bank = addSkillingClueToLoot(
				user,
				SkillsEnum.Fishing,
				quantity,
				fish.clueScrollChance,
				loot.bank
			);
		}

		// Add barbarian fish to loot
		if (fish.name === 'Barbarian fishing') {
			loot.bank[fish.id] = 0;
			loot.add('Leaping sturgeon', leapingSturgeon);
			loot.add('Leaping salmon', leapingSalmon);
			loot.add('Leaping trout', leapingTrout);
		}

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			bonusXP += Math.ceil(calcPercentOfNum(xpBonusPercent, xpReceived));
		}

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Roll for pet
		if (
			fish.petChance &&
			roll((fish.petChance - user.skillLevel(SkillsEnum.Fishing) * 25) / quantity)
		) {
			loot.add('Heron');
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.username}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${currentLevel} Fishing!`
			);
		}

		if (fish.bigFishRate && fish.bigFish) {
			for (let i = 0; i < quantity; i++) {
				if (roll(fish.bigFishRate)) {
					loot.add(fish.bigFish);
				}
			}
		}

		const minutesInTrip = Math.ceil(duration / 1000 / 60);
		for (let i = 0; i < minutesInTrip; i++) {
			if (roll(3000)) {
				loot.add('Shelldon');
				str += `\n<:shelldon:748496988407988244> A crab steals your fish just as you catch it! After some talking, the crab, called Sheldon, decides to join you on your fishing adventures. You can equip Shelldon and he will help you fish!`;
				break;
			}
		}

		await user.addItemsToBank(loot.bank, true);

		str += `\n\nYou received: ${loot}.`;
		if (fish.name === 'Barbarian fishing') {
			str = `${user}, ${user.minionName} finished fishing ${quantity} ${
				fish.name
			}, you also received ${xpReceived.toLocaleString()} fishing XP and ${agilityXpReceived.toLocaleString()} Agility XP.
\n\nYou received: ${leapingSturgeon}x Leaping sturgeon, ${leapingSalmon}x Leaping salmon, and ${leapingTrout}x Leaping trout.`;
			if (newLevel > currentLevel) {
				str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
			}
			if (newAgilityLevel > currentAgilityLevel) {
				str += `\n\n${user.minionName}'s Agility level is now ${newAgilityLevel}!`;
			}
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${fish.name}[${fish.id}]`);
				return this.client.commands.get('fish')!.run(res, [quantity, fish.name]);
			},
			undefined,
			data
		);
	}
}
