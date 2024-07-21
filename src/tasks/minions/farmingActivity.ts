import { randInt } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { combatAchievementTripEffect } from '../../lib/combat_achievements/combatAchievements';
import { BitField, Emoji, Events } from '../../lib/constants';
import type { PatchTypes } from '../../lib/minions/farming';
import type { FarmingContract } from '../../lib/minions/farming/types';

import { calcVariableYield } from '../../lib/skilling/functions/calcsFarming';
import Farming from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FarmingActivityTaskOptions, MonsterActivityTaskOptions } from '../../lib/types/minions';
import { assert, roll, skillingPetDropRate } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import { getFarmingKeyFromName } from '../../lib/util/farmingHelpers';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../lib/util/webhook';
import { userStatsBankUpdate } from '../../mahoji/mahojiSettings';

export const farmingTask: MinionTask = {
	type: 'Farming',
	async run(data: FarmingActivityTaskOptions) {
		const { plantsName, patchType, quantity, upgradeType, payment, userID, channelID, planting, currentDate, pid } =
			data;
		const user = await mUserFetch(userID);
		const currentFarmingLevel = user.skillLevel(SkillsEnum.Farming);
		const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
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

			if (loot.length > 0) str += `\n\nYou received: ${loot}.`;

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
			for (let i = 0; i < patchType.lastQuantity; i++) {
				for (let j = 0; j < plantToHarvest.numOfStages - 1; j++) {
					const deathRoll = Math.random();
					if (deathRoll < Math.floor(plantToHarvest.chanceOfDeath * chanceOfDeathReduction) / 128) {
						quantityDead += 1;
						break;
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
										((user.skillLevel(SkillsEnum.Farming) - 1) / 98)
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
					await userStatsBankUpdate(user, 'herbs_cleaned_while_farming_bank', cleanedHerbLoot);
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
					harvestXp = cropYield * plantToHarvest.harvestXp;
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

			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Farming, plantToHarvest.petChance);
			if (plantToHarvest.seedType === 'hespori') {
				await user.incrementKC(Monsters.Hespori.id, patchType.lastQuantity);
				const hesporiLoot = Monsters.Hespori.kill(patchType.lastQuantity, {
					farmingLevel: currentFarmingLevel
				});
				const fakeMonsterTaskOptions: MonsterActivityTaskOptions = {
					mi: Monsters.Hespori.id,
					q: patchType.lastQuantity,
					type: 'MonsterKilling',
					userID: user.id,
					duration: data.duration,
					finishDate: data.finishDate,
					channelID: data.channelID,
					id: 1
				};
				await combatAchievementTripEffect({ user, loot, messages: infoStr, data: fakeMonsterTaskOptions });
				loot = hesporiLoot;
			} else if (
				patchType.patchPlanted &&
				plantToHarvest.petChance &&
				alivePlants > 0 &&
				roll(petDropRate / alivePlants)
			) {
				loot.add('Tangleroot');
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
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Farming} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Tangleroot while farming ${patchType.lastPlanted} at level ${currentFarmingLevel} Farming!`
				);
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

			if (loot.length > 0) infoStr.push(`\nYou received: ${loot}.`);

			if (!planting) {
				infoStr.push('\nThe patches have been cleared. They are ready to have new seeds planted.');
			} else {
				infoStr.push(`\n${user.minionName} tells you to come back after your plants have finished growing!`);
			}

			await updateBankSetting('farming_loot_bank', loot);
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			await userStatsBankUpdate(user, 'farming_harvest_loot_bank', loot);
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

			handleTripFinish(
				user,
				channelID,
				infoStr.join('\n'),
				janeMessage
					? await chatHeadImage({
							content: `You've completed your contract and I have rewarded you with 1 Seed pack. Please open this Seed pack before asking for a new contract!\nYou have completed ${
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
