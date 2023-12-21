import { increaseNumByPercent, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { upgradedDragonstoneOutfit } from '../../lib/data/CollectionsExport';
import { globalDroprates } from '../../lib/data/globalDroprates';
import { InventionID } from '../../lib/invention/inventions';
import { stoneSpirits } from '../../lib/minions/data/stoneSpirits';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';
import { mahojiUsersSettingsFetch, userStatsBankUpdate } from '../../mahoji/mahojiSettings';

export const miningTask: MinionTask = {
	type: 'Mining',
	async run(data: MiningActivityTaskOptions) {
		const { oreID, userID, channelID, duration, powermine } = data;
		let { quantity } = data;
		const user = await mUserFetch(userID);
		const ore = Mining.Ores.find(ore => ore.id === oreID)!;
		const isMasterMiner = user.hasEquipped('Mining master cape');

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;

		// Mining master cape boost
		if (isMasterMiner) {
			xpReceived *= 2;
			quantity *= 2;
		}

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
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
				if (user.hasEquipped(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}
		const currentLevel = user.skillLevel(SkillsEnum.Mining);
		let xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${xpRes}`;

		const loot = new Bank();

		const numberOfMinutes = duration / Time.Minute;

		// Add clue scrolls
		if (ore.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Mining, quantity, ore.clueScrollChance, loot);
		}

		// Roll for pet
		if (ore.petChance) {
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Mining, ore.petChance);
			if (roll(petDropRate / quantity)) {
				loot.add('Rock golem');
				str += "\nYou have a funny feeling you're being followed...";
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
				);
			}
		}

		if (numberOfMinutes > 10 && ore.minerals && user.skillLevel(SkillsEnum.Mining) >= 60) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				if (isMasterMiner) {
					numberOfMinerals *= 2;
				}
				loot.add('Unidentified minerals', numberOfMinerals);
			}
		}

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutesInTrip = Math.ceil(duration / Time.Minute);
			const droprate = clAdjustedDroprate(
				user,
				'Doug',
				globalDroprates.doug.baseRate,
				globalDroprates.doug.clIncrease
			);
			for (let i = 0; i < minutesInTrip; i++) {
				if (roll(droprate)) {
					loot.add('Doug');
					str +=
						"\n<:doug:748892864813203591> A pink-colored mole emerges from where you're mining, and decides to join you on your adventures after seeing your groundbreaking new methods of mining.";
					break;
				}
			}
		}

		const isUsingObsidianPickaxe = user.hasEquipped(['Offhand volcanic pickaxe'], false);
		const isDestroyed = isUsingObsidianPickaxe && !resolveItems(['Obsidian shards']).includes(ore.id);
		if (isDestroyed) str += '\nYour volcanic pickaxe destroyed the ores.';
		const hasAdze = user.hasEquipped(['Superior inferno adze']);
		const adzeIsDisabled = (
			await mahojiUsersSettingsFetch(user.id, { disabled_inventions: true })
		).disabled_inventions.includes(InventionID.SuperiorInfernoAdze);
		if (!powermine && !isDestroyed) {
			let daeyaltQty = 0;

			// Gem rocks roll off the GemRockTable
			if (ore.name === 'Gem rock') {
				let effectiveQty = quantity;
				if (user.hasEquipped(upgradedDragonstoneOutfit, true)) {
					effectiveQty = Math.ceil(increaseNumByPercent(quantity, 10));
					str += `\nYou received 10% extra gems from your Dragonstone armour. (${
						effectiveQty - quantity
					} extra)`;
				}
				for (let i = 0; i < effectiveQty; i++) {
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
					daeyaltQty += randInt(2, 3);
				}
				loot.add(ore.id, daeyaltQty);
			} else {
				loot.add(ore.id, quantity);
			}

			const hasKlik = user.usingPet('Klik');

			if (hasKlik && !hasAdze) {
				const smeltedOre = Smithing.Bars.find(o => o.inputOres.bank[ore.id] && o.inputOres.length === 1);
				if (smeltedOre) {
					const klikBank = new Bank().add(smeltedOre.id, quantity);
					loot.remove(ore.id, loot.amount(ore.id));
					loot.add(klikBank);
					userStatsBankUpdate(user.id, 'bars_from_klik_bank', klikBank);
					str +=
						'\n<:klik:749945070932721676> Klik breathes a incredibly hot fire breath, and smelts all your ores!';
				}
			}

			const userBank = user.bank;
			const spiritOre = stoneSpirits.find(t => t.ore.id === oreID);
			if (spiritOre) {
				const amountOfSpirits = Math.min(quantity, userBank.amount(spiritOre.spirit.id));
				if (amountOfSpirits > 0) {
					await user.removeItemsFromBank(new Bank().add(spiritOre.spirit.id, amountOfSpirits));
					const spiritBank = new Bank().add(oreID, amountOfSpirits);
					loot.add(spiritBank);
					userStatsBankUpdate(user.id, 'ores_from_spirits_bank', spiritBank);
				}
			}
		}
		if (hasAdze && !adzeIsDisabled) {
			const smeltedOre = Smithing.Bars.find(
				o => o.inputOres.bank[ore.id] && o.inputOres.items().filter(i => i[0].name !== 'Coal').length === 1
			);
			if (smeltedOre) {
				if (!powermine) {
					const adzeBank = new Bank().add(smeltedOre.id, quantity);
					loot.remove(ore.id, loot.amount(ore.id));
					loot.add(adzeBank);
					userStatsBankUpdate(user.id, 'bars_from_adze_bank', adzeBank);
				}
				str += ` ${await user.addXP({
					skillName: SkillsEnum.Smithing,
					amount: smeltedOre.xp * quantity,
					duration
				})}`;
				str += ' Your Superior inferno adze smelted all the ore you mined (No materials used).';
			}
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Mining master cape boost message
		if (isMasterMiner) {
			str += `\n2x ore${ore.minerals ? ' and minerals' : ''} for being a master miner.`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
