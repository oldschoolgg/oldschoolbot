import { Time, randInt } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { increaseBankQuantitesByPercent } from '@oldschoolgg/toolkit';
import { MysteryBoxes } from '../../lib/bsoOpenables';
import { combatAchievementTripEffect } from '../../lib/combat_achievements/combatAchievements';
import { BitField } from '../../lib/constants';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';
import type { PatchTypes } from '../../lib/minions/farming';
import type { FarmingContract } from '../../lib/minions/farming/types';

import { calcVariableYield } from '../../lib/skilling/functions/calcsFarming';
import Farming, { plants } from '../../lib/skilling/skills/farming';
import { type Plant, SkillsEnum } from '../../lib/skilling/types';
import type { FarmingActivityTaskOptions, MonsterActivityTaskOptions } from '../../lib/types/minions';
import { assert, clAdjustedDroprate, itemNameFromID, roll, skillingPetDropRate } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import { getFarmingKeyFromName } from '../../lib/util/farmingHelpers';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../lib/util/webhook';
import { userStatsBankUpdate } from '../../mahoji/mahojiSettings';

const plopperBoostPercent = 100;

async function farmingLootBoosts(
	user: MUser,
	method: 'harvest' | 'plant',
	plant: Plant,
	quantity: number,
	loot: Bank,
	messages: string[]
) {
	let bonusPercentage = 0;
	if (user.allItemsOwned.has('Plopper')) {
		bonusPercentage += plopperBoostPercent;
		messages.push(`${plopperBoostPercent}% for Plopper`);
	}

	if (user.hasEquippedOrInBank('Farming master cape')) {
		bonusPercentage += 100;
		messages.push('100% for Farming master cape');
	}
	if (method === 'harvest' && user.hasEquippedOrInBank(['Arcane harvester']) && !plant.noArcaneHarvester) {
		const boostRes = await inventionItemBoost({
			user,
			inventionID: InventionID.ArcaneHarvester,
			duration: plant.level * Time.Second * quantity
		});
		if (boostRes.success) {
			bonusPercentage += inventionBoosts.arcaneHarvester.harvestBoostPercent;
			messages.push(
				`${inventionBoosts.arcaneHarvester.harvestBoostPercent}% bonus yield from Arcane Harvester (${boostRes.messages})`
			);
		}
	}
	increaseBankQuantitesByPercent(loot, bonusPercentage);
}

const mutations = [
	{
		chance: 30,
		plantName: 'Mango bush',
		output: itemID('Shiny mango')
	},
	{
		chance: 7,
		plantName: 'Cabbage',
		output: itemID('Cannonball cabbage')
	},
	{
		chance: 7,
		plantName: 'Potato',
		output: itemID('Sweet potato')
	},
	{
		chance: 7,
		plantName: 'Sweetcorn',
		output: itemID('Rainbow sweetcorn')
	},
	{
		chance: 7,
		plantName: 'Strawberry',
		output: itemID('White strawberry')
	},
	{
		chance: 7,
		plantName: 'Mushroom',
		output: itemID('Mooshroom')
	}
];
for (const mut of mutations) {
	const plant = plants.find(i => i.name === mut.plantName);
	if (!plant) throw new Error(`Missing ${mut.plantName}`);
}

export const farmingTask: MinionTask = {
	type: 'Farming',
	async run(data: FarmingActivityTaskOptions) {
		const {
			plantsName,
			patchType,
			quantity,
			upgradeType,
			payment,
			userID,
			channelID,
			planting,
			currentDate,
			pid,
			duration
		} = data;
		const user = await mUserFetch(userID);
		const currentFarmingLevel = Math.min(99, user.skillLevel(SkillsEnum.Farming));
		const currentWoodcuttingLevel = Math.min(99, user.skillLevel(SkillsEnum.Woodcutting));
		let baseBonus = 1;
		let bonusXP = 0;
		let plantXp = 0;
		let harvestXp = 0;
		let compostXp = 0;
		let checkHealthXp = 0;
		let rakeXp = 0;
		let woodcuttingXp = 0;
		let herbloreXp = 0;
		let payStr = '';
		let wcBool = false;
		let rakeStr = '';
		let plantingStr = '';
		const infoStr: string[] = [];
		let alivePlants = 0;
		let chopped = false;
		let farmingXpReceived = 0;
		let chanceOfDeathReduction = 1;
		let cropYield = 0;
		let lives = 3;
		let bonusXpMultiplier = 0;
		let farmersPiecesCheck = 0;
		let loot = new Bank();

		const hasPlopper = user.allItemsOwned.has('Plopper');

		const plant = Farming.Plants.find(plant => plant.name === plantsName)!;
		assert(Boolean(plant));

		if (user.hasEquippedOrInBank('Magic secateurs')) {
			baseBonus += 0.1;
		}

		if (user.hasEquippedOrInBank('Farming cape')) {
			baseBonus += 0.05;
		}

		if (upgradeType === 'compost') compostXp = 18;
		if (upgradeType === 'supercompost') compostXp = 26;
		if (upgradeType === 'ultracompost') compostXp = 36;

		// initial lives = 3. Compost, super, ultra, increases lives by 1 respectively and reduces chanceofdeath as well.
		// Payment = 0% chance of death
		if (patchType.lastUpgradeType === 'compost') {
			lives += 1;
			chanceOfDeathReduction = 1 / 2;
		} else if (patchType.lastUpgradeType === 'supercompost') {
			lives += 2;
			chanceOfDeathReduction = 1 / 5;
		} else if (patchType.lastUpgradeType === 'ultracompost') {
			lives += 3;
			chanceOfDeathReduction = 1 / 10;
		}

		if (patchType.lastPayment) chanceOfDeathReduction = 0;

		// check bank for farmer's items
		if (user.hasEquippedOrInBank("Farmer's strawhat")) {
			bonusXpMultiplier += 0.004;
			farmersPiecesCheck++;
		}
		if (user.hasEquippedOrInBank("Farmer's jacket") || user.hasEquippedOrInBank("Farmer's shirt")) {
			bonusXpMultiplier += 0.008;
			farmersPiecesCheck++;
		}
		if (user.hasEquippedOrInBank("Farmer's boro trousers")) {
			bonusXpMultiplier += 0.006;
			farmersPiecesCheck++;
		}
		if (user.hasEquippedOrInBank("Farmer's boots")) {
			bonusXpMultiplier += 0.002;
			farmersPiecesCheck++;
		}
		if (farmersPiecesCheck === 4) bonusXpMultiplier += 0.005;

		// If they have nothing planted here, just plant the seeds and return.
		if (!patchType.patchPlanted) {
			rakeXp = quantity * 4 * 3; // # of patches * exp per weed * # of weeds
			plantXp = quantity * (plant.plantXp + compostXp);
			farmingXpReceived = plantXp + harvestXp + rakeXp;

			loot.add('Weeds', quantity * 3);

			let str = `${user}, ${user.minionName} finished raking ${quantity} patches and planting ${quantity}x ${
				plant.name
			}.\n\nYou received ${plantXp.toLocaleString()} XP from planting and ${rakeXp.toLocaleString()} XP from raking for a total of ${farmingXpReceived.toLocaleString()} Farming XP.`;

			bonusXP += Math.floor(farmingXpReceived * bonusXpMultiplier);
			if (bonusXP > 0) {
				str += ` You received an additional ${bonusXP.toLocaleString()} in bonus XP.`;
			}

			str += `\n${await user.addXP({
				skillName: SkillsEnum.Farming,
				amount: Math.floor(farmingXpReceived + bonusXP),
				duration: data.duration
			})}`;

			await farmingLootBoosts(user, 'plant', plant, quantity, loot, infoStr);

			if (loot.has('Plopper')) {
				loot.bank[itemID('Plopper')] = 1;
			}

			if (loot.length > 0) {
				str += `\n\nYou received: ${loot}.`;
			}

			updateBankSetting('farming_loot_bank', loot);
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});

			const newPatch: PatchTypes.PatchData = {
				lastPlanted: plant.name,
				patchPlanted: true,
				plantTime: currentDate,
				lastQuantity: quantity,
				lastUpgradeType: upgradeType,
				lastPayment: payment ?? false,
				pid
			};

			await user.update({
				[getFarmingKeyFromName(plant.seedType)]: newPatch
			});

			str += `\n\n${user.minionName} tells you to come back after your plants have finished growing!`;

			handleTripFinish(user, channelID, str, undefined, data, null);
		} else if (patchType.patchPlanted) {
			// If they do have something planted here, harvest it and possibly replant.
			const plantToHarvest = Farming.Plants.find(plant => plant.name === patchType.lastPlanted)!;

			let quantityDead = 0;
			if (!hasPlopper) {
				for (let i = 0; i < patchType.lastQuantity; i++) {
					for (let j = 0; j < plantToHarvest.numOfStages - 1; j++) {
						const deathRoll = Math.random();
						if (deathRoll < Math.floor(plantToHarvest.chanceOfDeath * chanceOfDeathReduction) / 128) {
							quantityDead += 1;
							break;
						}
					}
				}
			}

			alivePlants = patchType.lastQuantity - quantityDead;

			if (planting) {
				plantXp = quantity * (plant.plantXp + compostXp);
			}
			checkHealthXp = alivePlants * plantToHarvest.checkXp;

			const shouldCleanHerb =
				plantToHarvest.herbXp !== undefined &&
				user.bitfield.includes(BitField.CleanHerbsFarming) &&
				user.skillLevel(SkillsEnum.Herblore) >= plantToHarvest.herbLvl!;

			if (plantToHarvest.givesCrops) {
				let cropToHarvest = plantToHarvest.outputCrop;
				if (shouldCleanHerb) {
					cropToHarvest = plantToHarvest.cleanHerbCrop;
				}
				if (plantToHarvest.variableYield) {
					cropYield = calcVariableYield(
						plantToHarvest,
						patchType.lastUpgradeType,
						currentFarmingLevel,
						alivePlants
					);
				} else if (plantToHarvest.fixedOutput) {
					if (!plantToHarvest.fixedOutputAmount) return;
					cropYield = plantToHarvest.fixedOutputAmount * alivePlants;
				} else {
					const plantChanceFactor =
						Math.floor(
							Math.floor(
								plantToHarvest.chance1 +
									(plantToHarvest.chance99 - plantToHarvest.chance1) *
										((currentFarmingLevel - 1) / 98)
							) * baseBonus
						) + 1;
					const chanceToSaveLife = (plantChanceFactor + 1) / 256;
					if (plantToHarvest.seedType === 'bush') lives = 4;
					cropYield = 0;
					const livesHolder = lives;
					for (let k = 0; k < alivePlants; k++) {
						lives = livesHolder;
						for (let n = 0; lives > 0; n++) {
							if (Math.random() > chanceToSaveLife) {
								lives -= 1;
								cropYield += 1;
							} else {
								cropYield += 1;
							}
						}
					}
				}

				if (quantity > patchType.lastQuantity) {
					loot.add(cropToHarvest, cropYield);
					loot.add('Weeds', quantity - patchType.lastQuantity);
				} else {
					loot.add(cropToHarvest, cropYield);
				}

				if (shouldCleanHerb && plantToHarvest.herbXp) {
					herbloreXp = cropYield * plantToHarvest.herbXp;
					const uncleanedHerbLoot = new Bank().add(plantToHarvest.outputCrop, cropYield);
					await user.addItemsToCollectionLog(uncleanedHerbLoot);
					const cleanedHerbLoot = new Bank().add(plantToHarvest.cleanHerbCrop, cropYield);
					await userStatsBankUpdate(user.id, 'herbs_cleaned_while_farming_bank', cleanedHerbLoot);
				}

				if (plantToHarvest.name === 'Limpwurt') {
					harvestXp = plantToHarvest.harvestXp * alivePlants;
				} else {
					harvestXp = cropYield * plantToHarvest.harvestXp;
				}
			}

			if (plantToHarvest.needsChopForHarvest) {
				if (!plantToHarvest.treeWoodcuttingLevel) return;
				if (currentWoodcuttingLevel >= plantToHarvest.treeWoodcuttingLevel) {
					chopped = true;
				} else {
					const GP = Number(user.user.GP);
					const gpToCutTree = plantToHarvest.seedType === 'redwood' ? 2000 * alivePlants : 200 * alivePlants;
					if (GP < gpToCutTree) {
						return sendToChannelID(channelID, {
							content: `You do not have the required woodcutting level or enough GP to clear your patches, in order to be able to plant more. You need ${gpToCutTree} GP.`
						});
					}
					payStr = `*You did not have the woodcutting level required, so you paid a nearby farmer ${gpToCutTree} GP to remove the previous trees.*`;
					await user.removeItemsFromBank(new Bank().add('Coins', gpToCutTree));

					harvestXp = 0;
				}
				if (plantToHarvest.givesLogs && chopped) {
					assert(
						typeof plantToHarvest.outputLogs === 'number' &&
							typeof plantToHarvest.woodcuttingXp === 'number'
					);

					const amountOfLogs = randInt(5, 10) * alivePlants;
					loot.add(plantToHarvest.outputLogs, amountOfLogs);

					if (plantToHarvest.outputRoots) {
						loot.add(plantToHarvest.outputRoots, randInt(1, 4) * alivePlants);
					}

					woodcuttingXp += amountOfLogs * plantToHarvest.woodcuttingXp!;
					wcBool = true;

					harvestXp = 0;
				} else if (plantToHarvest.givesCrops && chopped) {
					if (!plantToHarvest.outputCrop) return;

					loot.add(
						plantToHarvest.outputCrop,
						plantToHarvest.fixedOutput && plantToHarvest.fixedOutputAmount
							? plantToHarvest.fixedOutputAmount * alivePlants
							: cropYield
					);

					harvestXp = cropYield * alivePlants * plantToHarvest.harvestXp;
				}
			}

			if (quantity > patchType.lastQuantity) {
				loot.add('Weeds', (quantity - patchType.lastQuantity) * 3);
				rakeXp = (quantity - patchType.lastQuantity) * 3 * 4;
				rakeStr += ` ${rakeXp} XP for raking, `;
			}

			farmingXpReceived = plantXp + harvestXp + checkHealthXp + rakeXp;
			let deathStr = '';
			if (quantityDead > 0) {
				deathStr = ` During your harvest, you found that ${quantityDead}/${patchType.lastQuantity} of your plants died.`;
			}

			if (planting) {
				plantingStr = `${user}, ${user.minionName} finished planting ${quantity}x ${plant.name} and `;
			} else {
				plantingStr = `${user}, ${user.minionName} finished `;
			}

			bonusXP += Math.floor(farmingXpReceived * bonusXpMultiplier);

			const xpRes = await user.addXP({
				skillName: SkillsEnum.Farming,
				amount: Math.floor(farmingXpReceived + bonusXP),
				duration: data.duration
			});
			const wcXP = await user.addXP({
				skillName: SkillsEnum.Woodcutting,
				amount: Math.floor(woodcuttingXp)
			});
			await user.addXP({
				skillName: SkillsEnum.Herblore,
				amount: Math.floor(herbloreXp),
				source: 'CleaningHerbsWhileFarming'
			});

			infoStr.push(
				`${plantingStr}harvesting ${patchType.lastQuantity}x ${
					plantToHarvest.name
				}.${deathStr}${payStr}\n\nYou received ${plantXp.toLocaleString()} XP for planting, ${rakeStr}${harvestXp.toLocaleString()} XP for harvesting, and ${checkHealthXp.toLocaleString()} XP for checking health. In total: ${xpRes}. ${
					wcBool ? wcXP : ''
				}`
			);

			if (bonusXP > 0) {
				infoStr.push(
					`\nYou received an additional ${bonusXP.toLocaleString()} bonus XP from your farmer's outfit.`
				);
			}

			if (herbloreXp > 0) {
				infoStr.push(
					`\nYou received ${herbloreXp.toLocaleString()} Herblore XP for cleaning the herbs during your trip.`
				);
			}

			if (duration > Time.Minute * 20 && roll(10)) {
				loot.multiply(2);
				loot.add(MysteryBoxes.roll());
			}

			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Farming, plantToHarvest.petChance);
			if (plantToHarvest.seedType === 'hespori') {
				await user.incrementKC(Monsters.Hespori.id, patchType.lastQuantity);
				const hesporiLoot = Monsters.Hespori.kill(patchType.lastQuantity, {
					farmingLevel: currentFarmingLevel
				});
				const fakeMonsterTaskOptions: MonsterActivityTaskOptions = {
					monsterID: Monsters.Hespori.id,
					quantity: patchType.lastQuantity,
					type: 'MonsterKilling',
					userID: user.id,
					duration: data.duration,
					finishDate: data.finishDate,
					channelID: data.channelID,
					id: 1
				};
				await combatAchievementTripEffect({ user, loot, messages: infoStr, data: fakeMonsterTaskOptions });
				loot = hesporiLoot;
				const plopperDroprate = clAdjustedDroprate(
					user,
					'Plopper',
					(plantToHarvest.petChance - currentFarmingLevel * 25) / patchType.lastQuantity / 5,
					2
				);
				if (roll(plopperDroprate)) loot.add('Plopper');
			} else if (
				patchType.patchPlanted &&
				plantToHarvest.petChance &&
				alivePlants > 0 &&
				roll(petDropRate / alivePlants)
			) {
				loot.add('Tangleroot');
			} else if (patchType.patchPlanted && plantToHarvest.petChance && alivePlants > 0) {
				const plopperDroprate = clAdjustedDroprate(
					user,
					'Plopper',
					(plantToHarvest.petChance - currentFarmingLevel * 25) / alivePlants / 5,
					2
				);
				if (roll(plopperDroprate)) loot.add('Plopper');
			}
			if (plantToHarvest.seedType === 'seaweed' && roll(3)) loot.add('Seaweed spore', randInt(1, 3));

			if (plantToHarvest.seedType !== 'hespori') {
				let hesporiSeeds = 0;
				for (let i = 0; i < alivePlants; i++) {
					if (roll(plantToHarvest.petChance / 500)) {
						hesporiSeeds++;
					}
				}
				if (hesporiSeeds > 0) loot.add('Hespori seed', hesporiSeeds);
			}

			if (loot.has('Tangleroot')) {
				infoStr.push('\n```diff');
				infoStr.push("\n- You have a funny feeling you're being followed...");
				infoStr.push('```');
			}

			let newPatch: PatchTypes.PatchData = {
				lastPlanted: null,
				patchPlanted: false,
				plantTime: 0,
				lastQuantity: 0,
				lastUpgradeType: null,
				lastPayment: false
			};

			if (planting) {
				newPatch = {
					lastPlanted: plant.name,
					patchPlanted: true,
					plantTime: currentDate,
					lastQuantity: quantity,
					lastUpgradeType: upgradeType,
					lastPayment: payment ? payment : false,
					pid
				};
			}

			await user.update({
				[getFarmingKeyFromName(plant.seedType)]: newPatch
			});

			const { contract: currentContract } = user.farmingContract();

			const { contractsCompleted } = currentContract;

			let janeMessage = false;
			if (currentContract.hasContract && plantToHarvest.name === currentContract.plantToGrow && alivePlants > 0) {
				const farmingContractUpdate: FarmingContract = {
					hasContract: false,
					difficultyLevel: null,
					plantToGrow: currentContract.plantToGrow,
					plantTier: currentContract.plantTier,
					contractsCompleted: contractsCompleted + 1
				};

				await user.update({
					minion_farmingContract: farmingContractUpdate as any
				});

				loot.add('Seed pack');

				janeMessage = true;
			}

			if (!planting) {
				infoStr.push('\nThe patches have been cleared. They are ready to have new seeds planted.');
			} else {
				infoStr.push(`\n${user.minionName} tells you to come back after your plants have finished growing!`);
			}

			await farmingLootBoosts(user, 'harvest', plantToHarvest, patchType.lastQuantity, loot, infoStr);
			if ('onHarvest' in plantToHarvest && plantToHarvest.onHarvest) {
				await plantToHarvest.onHarvest({ user, loot, quantity: patchType.lastQuantity, messages: infoStr });
			}

			if (plantToHarvest.name === 'Mysterious tree') {
				if (loot.has('Seed Pack')) {
					loot.add('Seed Pack', 1);
					infoStr.push('+1 Seed Pack for Mysterious tree farming contract');
				}
			}

			if (loot.has('Plopper')) {
				loot.bank[itemID('Plopper')] = 1;
				infoStr.push(
					'<:plopper:787310793321349120> You found a pig on a farm and have adopted it to help you with farming.'
				);
			}

			if (user.hasEquippedOrInBank('Farming master cape')) {
				for (let j = 0; j < alivePlants; j++) {
					if (roll(10)) {
						loot.add(MysteryBoxes.roll());
					}
				}
			}
			// Give boxes for planting when harvesting
			if (planting && plant.name === 'Mysterious tree') {
				for (let j = 0; j < quantity; j++) {
					const upper = randInt(1, 2);
					for (let i = 0; i < upper; i++) {
						loot.add(MysteryBoxes.roll());
					}
				}
			}
			// Give the boxes for harvesting during a harvest
			if (alivePlants && plantToHarvest.name === 'Mysterious tree') {
				for (let j = 0; j < alivePlants; j++) {
					const upper = randInt(1, 3);
					for (let i = 0; i < upper; i++) {
						loot.add(MysteryBoxes.roll());
					}
				}
			}

			for (const mut of mutations) {
				if (alivePlants && plantToHarvest.name === mut.plantName && roll(mut.chance)) {
					loot.add(mut.output);
					infoStr.push(`One of your crops mutated into a ${itemNameFromID(mut.output)}.`);
				}
			}

			if (Object.keys(loot).length > 0) {
				infoStr.push(`\nYou received: ${loot}.`);
			}

			updateBankSetting('farming_loot_bank', loot);
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			await userStatsBankUpdate(user.id, 'farming_harvest_loot_bank', loot);
			if (pid) {
				await prisma.farmedCrop.update({
					where: {
						id: pid
					},
					data: {
						date_harvested: new Date()
					}
				});
			}

			const seedPackCount = loot.amount('Seed pack');

			return handleTripFinish(
				user,
				channelID,
				infoStr.join('\n'),
				janeMessage
					? await chatHeadImage({
							content: `You've completed your contract and I have rewarded you with ${seedPackCount} Seed pack${
								seedPackCount > 1 ? 's' : ''
							}. Please open ${
								seedPackCount > 1 ? 'these Seed packs' : 'this Seed pack'
							} before asking for a new contract!\nYou have completed ${
								contractsCompleted + 1
							} farming contracts.`,
							head: 'jane'
						})
					: undefined,
				data,
				loot
			);
		}
	}
};
