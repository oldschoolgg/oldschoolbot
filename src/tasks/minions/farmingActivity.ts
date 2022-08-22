import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { defaultFarmingContract, PatchTypes } from '../../lib/minions/farming';
import { FarmingContract } from '../../lib/minions/farming/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { calcVariableYield } from '../../lib/skilling/functions/calcsFarming';
import Farming from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import { assert, rand, roll, updateBankSetting } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import { getFarmingKeyFromName } from '../../lib/util/farmingHelpers';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { logError } from '../../lib/util/logError';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { sendToChannelID } from '../../lib/util/webhook';
import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch, mUserFetch } from '../../mahoji/mahojiSettings';

export default class extends Task {
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
			autoFarmed
		} = data;
		const user = await mUserFetch(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
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
		let payStr = '';
		let wcStr = '';
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

		const plant = Farming.Plants.find(plant => plant.name === plantsName);

		if (hasItemsEquippedOrInBank(user, ['Magic secateurs'])) {
			baseBonus += 0.1;
		}

		if (hasItemsEquippedOrInBank(user, ['Farming cape'])) {
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

		if (!patchType.patchPlanted) {
			if (!plant) {
				logError(new Error(`${user.sanitizedName}'s new patch had no plant found.`), { user_id: user.id });
				return;
			}

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

			await user.addXP({
				skillName: SkillsEnum.Farming,
				amount: Math.floor(farmingXpReceived + bonusXP)
			});
			const newLevel = user.skillLevel(SkillsEnum.Farming);

			if (newLevel > currentFarmingLevel) {
				str += `\n${user.minionName}'s Farming level is now ${newLevel}!`;
			}

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
				lastPayment: payment ?? false
			};

			await mahojiUserSettingsUpdate(user.id, {
				[getFarmingKeyFromName(plant.seedType)]: newPatch
			});

			str += `\n\n${user.minionName} tells you to come back after your plants have finished growing!`;

			handleTripFinish(
				user,
				channelID,
				str,
				autoFarmed ? ['farming', { auto_farm: {} }, true] : undefined,
				undefined,
				data,
				null
			);
		} else if (patchType.patchPlanted) {
			const plantToHarvest = Farming.Plants.find(plant => plant.name === patchType.lastPlanted);
			if (!plantToHarvest) return;
			if (!plant) return;

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

			if (plantToHarvest.givesCrops) {
				if (!plantToHarvest.outputCrop) return;
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
					loot.add(plantToHarvest.outputCrop, cropYield);
					loot.add('Weeds', quantity - patchType.lastQuantity);
				} else {
					loot.add(plantToHarvest.outputCrop, cropYield);
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

					const amountOfLogs = rand(5, 10) * alivePlants;
					loot.add(plantToHarvest.outputLogs, amountOfLogs);

					if (plantToHarvest.outputRoots) {
						loot.add(plantToHarvest.outputRoots, rand(1, 4) * alivePlants);
					}

					woodcuttingXp += amountOfLogs * plantToHarvest.woodcuttingXp!;
					wcStr = ` You also received ${woodcuttingXp.toLocaleString()} Woodcutting XP.`;

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

			infoStr.push(
				`${plantingStr}harvesting ${patchType.lastQuantity}x ${
					plantToHarvest.name
				}.${deathStr}${payStr}\n\nYou received ${plantXp.toLocaleString()} XP for planting, ${rakeStr}${harvestXp.toLocaleString()} XP for harvesting, and ${checkHealthXp.toLocaleString()} XP for checking health for a total of ${farmingXpReceived.toLocaleString()} Farming XP.${wcStr}`
			);

			bonusXP += Math.floor(farmingXpReceived * bonusXpMultiplier);

			if (bonusXP > 0) {
				infoStr.push(
					`\nYou received an additional ${bonusXP.toLocaleString()} bonus XP from your farmer's outfit.`
				);
			}

			await user.addXP({
				skillName: SkillsEnum.Farming,
				amount: Math.floor(farmingXpReceived + bonusXP)
			});
			await user.addXP({
				skillName: SkillsEnum.Woodcutting,
				amount: Math.floor(woodcuttingXp)
			});

			const newFarmingLevel = user.skillLevel(SkillsEnum.Farming);
			const newWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);

			if (newFarmingLevel > currentFarmingLevel) {
				infoStr.push(`\n${user.minionName}'s Farming level is now ${newFarmingLevel}!`);
			}

			if (newWoodcuttingLevel > currentWoodcuttingLevel) {
				infoStr.push(`\n\n${user.minionName}'s Woodcutting level is now ${newWoodcuttingLevel}!`);
			}

			let tangleroot = false;
			if (plantToHarvest.seedType === 'hespori') {
				await user.incrementKC(Monsters.Hespori.id);
				const hesporiLoot = Monsters.Hespori.kill(1, { farmingLevel: currentFarmingLevel });
				loot = hesporiLoot;
				if (hesporiLoot.amount('Tangleroot')) tangleroot = true;
			} else if (
				patchType.patchPlanted &&
				plantToHarvest.petChance &&
				alivePlants > 0 &&
				roll((plantToHarvest.petChance - user.skillLevel(SkillsEnum.Farming) * 25) / alivePlants)
			) {
				loot.add('Tangleroot');
				tangleroot = true;
			}

			if (plantToHarvest.seedType !== 'hespori') {
				let hesporiSeeds = 0;
				for (let i = 0; i < alivePlants; i++) {
					if (roll(plantToHarvest.petChance / 500)) {
						hesporiSeeds++;
					}
				}
				if (hesporiSeeds > 0) loot.add('Hespori seed', hesporiSeeds);
			}

			if (tangleroot) {
				infoStr.push('\n```diff');
				infoStr.push("\n- You have a funny feeling you're being followed...");
				infoStr.push('```');
				this.client.emit(
					Events.ServerNotification,
					`${Emoji.Farming} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Tangleroot while farming ${patchType.lastPlanted} at level ${currentFarmingLevel} Farming!`
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
					lastPayment: payment ? payment : false
				};
			}

			await mahojiUserSettingsUpdate(user.id, {
				[getFarmingKeyFromName(plant.seedType)]: newPatch
			});

			const currentContract: FarmingContract | null =
				(mahojiUser.minion_farmingContract as FarmingContract | null) ?? {
					...defaultFarmingContract
				};

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

				await mahojiUserSettingsUpdate(user.id, {
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

			updateBankSetting(globalClient, ClientSettings.EconomyStats.FarmingLootBank, loot);
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});

			handleTripFinish(
				user,
				channelID,
				infoStr.join('\n'),
				autoFarmed ? ['farming', { auto_farm: {} }, true] : undefined,
				janeMessage
					? await chatHeadImage({
							content: `You've completed your contract and I have rewarded you with 1 Seed pack. Please open this Seed pack before asking for a new contract!\nYou have completed ${
								contractsCompleted + 1
							} farming contracts.`,
							head: 'jane'
					  })
					: undefined,
				data,
				null
			);
		}
	}
}
