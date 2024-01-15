import { increaseNumByPercent, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';

import { chargePortentIfHasCharges, PortentID } from '../../lib/bso/divination';
import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { upgradedDragonstoneOutfit } from '../../lib/data/CollectionsExport';
import { globalDroprates } from '../../lib/data/globalDroprates';
import { UserFullGearSetup } from '../../lib/gear';
import { InventionID } from '../../lib/invention/inventions';
import { StoneSpirit, stoneSpirits } from '../../lib/minions/data/stoneSpirits';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining from '../../lib/skilling/skills/mining';
import Smithing from '../../lib/skilling/skills/smithing';
import { Ore, SkillsEnum } from '../../lib/skilling/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, itemID, skillingPetDropRate, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';
import { mahojiUsersSettingsFetch, userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';

export function calculateMiningResult({
	ore,
	allGear,
	duration,
	miningLevel,
	disabledInventions,
	quantity,
	isPowermining,
	equippedPet,
	isUsingObsidianPickaxe,
	hasMiningMasterCape,
	portentResult,
	spiritOre,
	amountOfSpiritsToUse,
	collectionLog,
	miningXP
}: {
	ore: Ore;
	allGear: UserFullGearSetup;
	duration: number;
	miningLevel: number;
	disabledInventions: InventionID[];
	isPowermining: boolean;
	equippedPet: number | null;
	isUsingObsidianPickaxe: boolean;
	quantity: number;
	hasMiningMasterCape: boolean;
	portentResult: Awaited<ReturnType<typeof chargePortentIfHasCharges>> | null;
	amountOfSpiritsToUse: number;
	spiritOre: StoneSpirit | undefined;
	collectionLog: Bank;
	miningXP: number;
}) {
	const messages: string[] = [];
	const barsFromKlikBank = new Bank();
	const oresFromSpiritsBank = new Bank();
	const barsFromAdzeBank = new Bank();
	const totalCost = new Bank();
	const loot = new Bank();
	const numberOfMinutes = Math.ceil(duration / Time.Minute);

	let spiritualMiningPortentXP = 0;
	let totalMiningXPToAdd = quantity * ore.xp;

	// Prospector outfit
	if (
		allGear.skilling.hasEquipped(
			Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
			true
		)
	) {
		const amountToAdd = Math.floor(totalMiningXPToAdd * (2.5 / 100));
		totalMiningXPToAdd += amountToAdd;
		messages.push(`2.5% (${amountToAdd.toLocaleString()}) bonus XP for full prospector outfit.`);
	}

	// Add clue scrolls
	if (ore.clueScrollChance) {
		addSkillingClueToLoot(miningLevel, SkillsEnum.Mining, quantity, ore.clueScrollChance, loot);
	}

	// Roll for pet
	if (ore.petChance) {
		const { petDropRate } = skillingPetDropRate(miningXP, SkillsEnum.Mining, ore.petChance);
		if (roll(petDropRate / quantity)) {
			loot.add('Rock golem');
		}
	}

	if (numberOfMinutes > 10 && ore.minerals && miningLevel >= 60) {
		let numberOfMinerals = 0;
		for (let i = 0; i < quantity; i++) {
			if (roll(ore.minerals)) numberOfMinerals++;
		}

		if (numberOfMinerals > 0) {
			if (hasMiningMasterCape) {
				numberOfMinerals *= 2;
				messages.push('2x minerals for Mining master cape.');
			}
			loot.add('Unidentified minerals', numberOfMinerals);
		}
	}

	if (duration >= MIN_LENGTH_FOR_PET) {
		const minutesInTrip = Math.ceil(duration / Time.Minute);
		const droprate = clAdjustedDroprate(
			collectionLog,
			'Doug',
			globalDroprates.doug.baseRate,
			globalDroprates.doug.clIncrease
		);
		for (let i = 0; i < minutesInTrip; i++) {
			if (roll(droprate)) {
				loot.add('Doug');
				messages.push(
					"<:doug:748892864813203591> A pink-colored mole emerges from where you're mining, and decides to join you on your adventures after seeing your groundbreaking new methods of mining."
				);
				break;
			}
		}
	}

	const isDestroyed = isUsingObsidianPickaxe && !resolveItems(['Obsidian shards']).includes(ore.id);
	if (isDestroyed) messages.push('Your volcanic pickaxe destroyed the ores.');
	const hasAdze = Object.values(allGear).some(g => g.hasEquipped(['Superior inferno adze']));
	const adzeIsDisabled = disabledInventions.includes(InventionID.SuperiorInfernoAdze);
	if (!isPowermining && !isDestroyed) {
		let daeyaltQty = 0;

		// Gem rocks roll off the GemRockTable
		if (ore.name === 'Gem rock') {
			let effectiveQty = quantity;
			if (Object.values(allGear).some(g => g.hasEquipped(upgradedDragonstoneOutfit, true))) {
				effectiveQty = Math.ceil(increaseNumByPercent(quantity, 10));
				messages.push(
					`You received 10% extra gems from your Dragonstone armour. (${effectiveQty - quantity} extra)`
				);
			}
			for (let i = 0; i < effectiveQty; i++) {
				loot.add(Mining.GemRockTable.roll());
			}
		} else if (ore.name === 'Volcanic ash') {
			// Volcanic ash
			const tiers = [
				[22, 1],
				[37, 2],
				[52, 3],
				[67, 4],
				[82, 5],
				[97, 6]
			];
			for (const [lvl, multiplier] of tiers.reverse()) {
				if (miningLevel >= lvl) {
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

		const hasKlik = equippedPet === itemID('Klik');

		if (hasKlik && !hasAdze) {
			const smeltedOre = Smithing.Bars.find(o => o.inputOres.bank[ore.id] && o.inputOres.length === 1);
			if (smeltedOre) {
				barsFromKlikBank.add(smeltedOre.id, quantity);
				loot.remove(ore.id, loot.amount(ore.id));
				loot.add(barsFromKlikBank);
				messages.push(
					'<:klik:749945070932721676> Klik breathes a incredibly hot fire breath, and smelts all your ores!'
				);
			}
		}

		if (spiritOre && amountOfSpiritsToUse > 0) {
			const spiritCost = new Bank().add(spiritOre.spirit.id, amountOfSpiritsToUse);
			totalCost.add(spiritCost);

			const spiritBank = new Bank().add(ore.id, amountOfSpiritsToUse);
			loot.add(spiritBank);
			oresFromSpiritsBank.add(ore.id, amountOfSpiritsToUse);
			messages.push(`You received ${spiritBank} from your ${spiritCost}.`);
		}
	}

	if (spiritOre && amountOfSpiritsToUse > 0 && portentResult?.didCharge) {
		const spiritCost = new Bank().add(spiritOre.spirit.id, amountOfSpiritsToUse);
		totalCost.add(spiritCost);
		spiritualMiningPortentXP = amountOfSpiritsToUse * (ore.xp * (ore.xp / 10));
		totalMiningXPToAdd += spiritualMiningPortentXP;

		messages.push(
			`You received ${toKMB(spiritualMiningPortentXP)} bonus XP from your Spiritual mining portent (${
				portentResult.portent.charges_remaining
			} charges remaining).`
		);
	}

	let smithingXPFromAdze = 0;
	if (hasAdze && !adzeIsDisabled) {
		const smeltedOre = Smithing.Bars.find(
			o => o.inputOres.bank[ore.id] && o.inputOres.items().filter(i => i[0].name !== 'Coal').length === 1
		);
		if (smeltedOre) {
			if (!isPowermining) {
				barsFromAdzeBank.add(smeltedOre.id, quantity);
				loot.remove(ore.id, loot.amount(ore.id));
				loot.add(barsFromAdzeBank);
			}
			smithingXPFromAdze = smeltedOre.xp * quantity;
			messages.push('Your Superior inferno adze smelted all the ore you mined (No materials used).');
		}
	}

	return {
		totalMiningXPToAdd: Math.floor(totalMiningXPToAdd),
		smithingXPFromAdze: Math.floor(smithingXPFromAdze),
		barsFromKlikBank,
		totalCost,
		spiritualMiningPortentXP: Math.floor(spiritualMiningPortentXP),
		loot,
		barsFromAdzeBank,
		oresFromSpiritsBank,
		messages
	};
}

export const miningTask: MinionTask = {
	type: 'Mining',
	async run(data: MiningActivityTaskOptions) {
		const { oreID, userID, channelID, duration, powermine } = data;
		let { quantity } = data;
		const user = await mUserFetch(userID);
		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		const sd = await mahojiUsersSettingsFetch(user.id, { disabled_inventions: true });
		const spiritOre = stoneSpirits.find(t => t.ore.id === ore.id);
		const amountOfSpiritsToUse =
			spiritOre !== undefined ? Math.min(quantity, user.bank.amount(spiritOre.spirit.id)) : 0;
		const hasMiningMasterCape = user.hasEquipped('Mining master cape');
		const portentResult =
			amountOfSpiritsToUse > 0
				? await chargePortentIfHasCharges({
						user,
						portentID: PortentID.MiningPortent,
						charges: amountOfSpiritsToUse
				  })
				: null;
		const {
			totalMiningXPToAdd,
			smithingXPFromAdze,
			barsFromKlikBank,
			totalCost,
			spiritualMiningPortentXP,
			loot,
			messages,
			barsFromAdzeBank,
			oresFromSpiritsBank
		} = calculateMiningResult({
			duration,
			isPowermining: powermine ?? false,
			isUsingObsidianPickaxe: user.hasEquipped(['Offhand volcanic pickaxe'], false),
			quantity,
			hasMiningMasterCape,
			ore,
			allGear: user.gear,
			miningLevel: user.skillLevel(SkillsEnum.Mining),
			disabledInventions: sd.disabled_inventions,
			equippedPet: user.user.minion_equippedPet,
			amountOfSpiritsToUse,
			spiritOre,
			portentResult,
			collectionLog: user.cl,
			miningXP: user.skillsAsXP.mining
		});

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot,
			itemsToRemove: totalCost
		});

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: totalMiningXPToAdd,
			duration
		});

		if (smithingXPFromAdze > 0) {
			xpRes += ` ${await user.addXP({
				skillName: SkillsEnum.Smithing,
				amount: smithingXPFromAdze,
				duration
			})}`;
		}

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${xpRes}`;

		if (barsFromKlikBank.length > 0) {
			await userStatsBankUpdate(user.id, 'bars_from_klik_bank', barsFromKlikBank);
		}
		if (oresFromSpiritsBank.length > 0) {
			await userStatsBankUpdate(user.id, 'ores_from_spirits_bank', oresFromSpiritsBank);
		}
		if (barsFromAdzeBank.length > 0) {
			await userStatsBankUpdate(user.id, 'bars_from_adze_bank', barsFromAdzeBank);
		}
		if (spiritualMiningPortentXP > 0) {
			await userStatsUpdate(user.id, {
				xp_from_mining_portent: {
					increment: spiritualMiningPortentXP
				}
			});
		}

		str += `\nYou received: ${loot}.`;

		if (messages.length > 0) {
			str += `\n\n${messages.join('\n')}`;
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
