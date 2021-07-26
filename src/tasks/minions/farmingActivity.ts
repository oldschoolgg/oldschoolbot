import { ArrayActions } from '@klasa/settings-gateway';
import { MessageAttachment } from 'discord.js';
import { deepClone, objectEntries, roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { In } from 'typeorm';

import { Emoji, Events } from '../../lib/constants';
import { defaultFarmingContract } from '../../lib/minions/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcVariableYield } from '../../lib/skilling/functions/calcsFarming';
import Farming from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
import { FarmingPatchesTable, FarmingPatchStatus } from '../../lib/typeorm/FarmingPatchesTable.entity';
import { Skills } from '../../lib/types';
import { FarmingActivityTaskOptions } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FarmingActivityTaskOptions) {
		const user = await this.client.users.fetch(data.userID);
		const currentFarmingLevel = user.skillLevel(SkillsEnum.Farming);

		const xpReceived: Skills = {
			[SkillsEnum.Farming]: 0,
			[SkillsEnum.Woodcutting]: 0
		};
		const itemsReceived = new Bank();

		const harvested: Record<string, number> = {};
		const dead: Record<string, number> = {};
		const planted: Record<string, number> = {};

		const currentDate = new Date();

		const patchesQtyByTypeHarvested: Record<string, number> = {};

		let baseBonus = 1;
		baseBonus += user.hasItemEquippedOrInBank('Farming cape') ? 0.05 : 0;
		baseBonus += user.hasItemEquippedOrInBank('Magic secateurs') ? 0.1 : 0;

		let contractsCompleted = 0;

		// Collect what there is to collect
		const patchesToCollect = await FarmingPatchesTable.find({
			where: {
				id: In(data.toCollect.map(c => c.id))
			}
		});

		let bonusXpMultiplier = 0;
		let farmersPiecesCheck = 0;
		// Add bonus XP if the user has the farming outfit in the bank
		if (user.hasItemEquippedOrInBank("Farmer's strawhat")) {
			bonusXpMultiplier += 0.004;
			farmersPiecesCheck++;
		}
		if (user.hasItemEquippedOrInBank("Farmer's jacket") || user.hasItemEquippedOrInBank("Farmer's shirt")) {
			bonusXpMultiplier += 0.008;
			farmersPiecesCheck++;
		}
		if (user.hasItemEquippedOrInBank("Farmer's boro trousers")) {
			bonusXpMultiplier += 0.006;
			farmersPiecesCheck++;
		}
		if (user.hasItemEquippedOrInBank("Farmer's boots")) {
			bonusXpMultiplier += 0.002;
			farmersPiecesCheck++;
		}
		if (farmersPiecesCheck === 4) bonusXpMultiplier += 0.005;

		for (const collect of patchesToCollect) {
			let pathLives = 3;
			let chanceOfDeathReduction = 1;
			let { paidToCut } = data.toCollect.find(c => c.id === collect.id)!;

			// Update lives and chance of death based on what composer the user is using
			if (collect.compostUsed === 'compost') {
				pathLives += 1;
				chanceOfDeathReduction = 1 / 2;
			} else if (collect.compostUsed === 'supercompost') {
				pathLives += 2;
				chanceOfDeathReduction = 1 / 5;
			} else if (collect.compostUsed === 'ultracompost') {
				pathLives += 3;
				chanceOfDeathReduction = 1 / 10;
			}

			// If paying the crop, the crop cant die
			if (collect.carePayment) chanceOfDeathReduction = 0;

			// Get the plant to be harvested data
			const plantToHarvest = Farming.Plants.find(p => p.name === collect.plant)!;

			// Check how many died
			let quantityDead = 0;
			let alivePlants = collect.quantity;
			for (let i = 0; i < collect.quantity; i++) {
				for (let j = 0; j < plantToHarvest.numOfStages - 1; j++) {
					const deathRoll = Math.random();
					if (deathRoll < Math.floor(plantToHarvest.chanceOfDeath * chanceOfDeathReduction) / 128) {
						quantityDead += 1;
						alivePlants -= 1;
						break;
					}
				}
			}

			// Get health xp
			xpReceived[SkillsEnum.Farming]! += alivePlants * plantToHarvest.checkXp;

			// If this plant have crops/collectables (allotments, fruit trees, etc)
			if (plantToHarvest.givesCrops && plantToHarvest.outputCrop) {
				let cropYield = 0;
				if (plantToHarvest.variableYield) {
					// For variable crops, like herbs and allotments
					cropYield = calcVariableYield(plantToHarvest, collect.patchType, currentFarmingLevel, alivePlants);
				} else if (plantToHarvest.fixedOutput) {
					// For fixed crops, like fruit trees
					if (plantToHarvest.fixedOutputAmount) {
						cropYield = plantToHarvest.fixedOutputAmount * alivePlants;
					}
				} else {
					// For everything else
					const plantChanceFactor =
						Math.floor(
							Math.floor(
								plantToHarvest.chance1 +
									(plantToHarvest.chance99 - plantToHarvest.chance1) *
										((user.skillLevel(SkillsEnum.Farming) - 1) / 98)
							) * baseBonus
						) + 1;
					const chanceToSaveLife = (plantChanceFactor + 1) / 256;
					if (plantToHarvest.seedType === 'bush') pathLives = 4;
					cropYield = 0;
					const livesHolder = pathLives;
					for (let k = 0; k < alivePlants; k++) {
						pathLives = livesHolder;
						for (let n = 0; pathLives > 0; n++) {
							if (Math.random() > chanceToSaveLife) {
								pathLives -= 1;
								cropYield += 1;
							} else {
								cropYield += 1;
							}
						}
					}
				}

				// Add the output to the received items bank
				if (cropYield > 0) itemsReceived.add(plantToHarvest.outputCrop, cropYield);
				// Get the base xp for these crops
				if (plantToHarvest.name === 'Limpwurt') {
					xpReceived[SkillsEnum.Farming]! += plantToHarvest.harvestXp * alivePlants;
				} else {
					xpReceived[SkillsEnum.Farming]! += cropYield * plantToHarvest.harvestXp;
				}
			}

			// Check if this plant needs to be cut down
			if (plantToHarvest.needsChopForHarvest && !paidToCut) {
				const amountOfLogs = rand(5, 10) * alivePlants;
				itemsReceived.add(plantToHarvest.outputLogs, amountOfLogs);
				if (plantToHarvest.outputRoots) itemsReceived.add(plantToHarvest.outputRoots, rand(1, 4) * alivePlants);
				xpReceived[SkillsEnum.Woodcutting]! += amountOfLogs * plantToHarvest.woodcuttingXp!;
			}

			// Check specific for Hespori loot
			let tanglerootReceived = false;
			if (plantToHarvest.seedType === 'hespori') {
				await user.incrementMonsterScore(Monsters.Hespori.id);
				const hesporiLoot = Monsters.Hespori.kill(1, { farmingLevel: currentFarmingLevel });
				if (hesporiLoot.amount('Tangleroot') > 0) tanglerootReceived = true;
				itemsReceived.add(hesporiLoot);
			} else {
				// If not Hespori, check for pet droprate
				if (
					plantToHarvest.petChance ** alivePlants > 0 &&
					roll((plantToHarvest.petChance - user.skillLevel(SkillsEnum.Farming) * 25) / alivePlants)
				) {
					tanglerootReceived = true;
					itemsReceived.add('Tangleroot', 1);
				}
				// Also, when not hespori, user can get hespori seeds
				let hesporiSeeds = 0;
				for (let i = 0; i < alivePlants; i++) if (roll(plantToHarvest.petChance / 500)) hesporiSeeds++;
				if (hesporiSeeds > 0) itemsReceived.add('Hespori seed', hesporiSeeds);
			}

			// Emit that the user received a Tangleroot!
			if (tanglerootReceived) {
				this.client.emit(
					Events.ServerNotification,
					`${Emoji.Farming} **${user.username}'s** minion, ${user.minionName}, just received a Tangleroot while farming ${plantToHarvest.name} at level ${currentFarmingLevel} Farming!`
				);
			}

			// Check for farming contracts
			const farmingSettings = { ...deepClone(user.settings.get(UserSettings.Minion.FarmingSettings)) };
			let currentContract = farmingSettings.farmingContract || defaultFarmingContract;
			contractsCompleted = currentContract.contractsCompleted;
			if (
				plantToHarvest.name === currentContract.plantToGrow &&
				alivePlants > 0 &&
				!user.bank().has('Seed pack') &&
				!itemsReceived.has('Seed pack')
			) {
				currentContract = {
					hasContract: false,
					difficultyLevel: null,
					plantToGrow: null,
					plantTier: currentContract.plantTier,
					contractsCompleted: contractsCompleted + 1
				};
				await user.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
					arrayAction: ArrayActions.Overwrite
				});
				itemsReceived.add('Seed pack', 1);
			}

			// Add the qty that died or was harvested
			harvested[collect.plant] = (harvested[collect.plant] || 0) + alivePlants;
			dead[collect.plant] = (dead[collect.plant] || 0) + quantityDead;
			patchesQtyByTypeHarvested[collect.patchType] =
				(patchesQtyByTypeHarvested[collect.patchType] || 0) + collect.quantity;

			collect.status = FarmingPatchStatus.Harvested;
			collect.harvestDate = currentDate;
			await collect.save();
		}

		let durationPerSeedType = 0;

		for (const plant of data.toPlant) {
			const plantToPlant = Farming.Plants.find(p => p.name === plant.plant)!;
			// Check how many rakes will be able to be done (We reduce from total collected what we will be planting)
			if (patchesQtyByTypeHarvested[plantToPlant.seedType])
				patchesQtyByTypeHarvested[plantToPlant.seedType] -= plant.quantity;
			// If we havent collected this seed, it means we will use the entire qty being planted
			else patchesQtyByTypeHarvested[plantToPlant.seedType] = 0 - plant.quantity;

			// If we have more patches to plant than we collected
			if (patchesQtyByTypeHarvested[plantToPlant.seedType] < 0) {
				const weedsReceived = Math.abs(patchesQtyByTypeHarvested[plantToPlant.seedType]) * 3;
				xpReceived[SkillsEnum.Farming]! += weedsReceived * 4;
				itemsReceived.add('Weeds', weedsReceived);
				// Reset to 0, so the next plant will be use only what it is planting
				patchesQtyByTypeHarvested[plantToPlant.seedType] = 0;
			}

			let compostXp = 0;
			if (plant.compost === 'compost') compostXp = 18;
			if (plant.compost === 'supercompost') compostXp = 26;
			if (plant.compost === 'ultracompost') compostXp = 36;

			// Add XP for planting
			xpReceived[SkillsEnum.Farming]! += (plantToPlant.plantXp + compostXp) * plant.quantity;

			// Save in the DB
			const finishDate = new Date();
			const plantedDate = new Date();
			// Add to the plant date the time it took to plant the plants before
			plantedDate.setTime(plantedDate.getTime() + durationPerSeedType * (this.client.production ? 1 : 0));
			// Get the plant date and add the growth time
			finishDate.setTime(
				plantedDate.getTime() +
					(this.client.production ? plantToPlant.growthTime * Time.Minute : rand(5, 150) * Time.Second)
			);
			const rec = new FarmingPatchesTable();
			rec.plant = plantToPlant.name;
			rec.patchType = plantToPlant.seedType;
			rec.quantity = plant.quantity;
			rec.compostUsed = plant.compost || null;
			rec.carePayment = plant.payment;
			rec.userID = user.id;
			rec.finishDate = finishDate;
			rec.plantDate = plantedDate;
			rec.status = FarmingPatchStatus.Planted;
			await rec.save();

			//
			durationPerSeedType += plant.duration;
			planted[plant.plant] = (planted[plant.plant] || 0) + plant.quantity;
		}

		xpReceived[SkillsEnum.Farming]! *= 1 + bonusXpMultiplier;

		// Prepare the messages to send the player
		const finalMessage: string[] = [];

		finalMessage.push(`${user}, ${user.minionName} just came back from its farming trip and here are its results:`);

		if (objectEntries(harvested).length > 0) {
			finalMessage.push(
				`You minion harvested: ${objectEntries(harvested)
					.map(v => `${v[1]}x ${v[0]}${dead[v[0]] ? ` (${dead[v[0]]}x died)` : ''}`)
					.join(', ')}`
			);
		}

		if (objectEntries(planted).length > 0) {
			finalMessage.push(
				`You minion planted: ${objectEntries(planted)
					.map(v => `${v[1]}x ${v[0]}`)
					.join(', ')}.\n${user.minionName} tells you to come back after your plants have finished growing!`
			);
		}

		if (itemsReceived.items().length > 0) {
			finalMessage.push(`You received the following items: ${itemsReceived}`);
		}

		let janeMessage: undefined | MessageAttachment = undefined;
		if (itemsReceived.amount('Seed pack') > 0) {
			janeMessage = await chatHeadImage({
				content: `You've completed your contract and I have rewarded you with 1 Seed pack. Please open this Seed pack before asking for a new contract!\nYou have completed ${
					contractsCompleted + 1
				} farming contracts.`,
				head: 'jane'
			});
		} else {
			janeMessage = undefined;
		}

		let xpReceivedStr: string[] = [];

		if (xpReceived[SkillsEnum.Farming]! > 0)
			xpReceivedStr.push(
				await user.addXP({
					amount: xpReceived[SkillsEnum.Farming]!,
					skillName: SkillsEnum.Farming
				})
			);

		if (xpReceived[SkillsEnum.Woodcutting]! > 0)
			xpReceivedStr.push(
				await user.addXP({
					amount: xpReceived[SkillsEnum.Woodcutting]!,
					skillName: SkillsEnum.Woodcutting
				})
			);

		if (itemsReceived.items().length > 0) await user.addItemsToBank(itemsReceived, true);

		finalMessage.push(xpReceivedStr.join('\n'));

		handleTripFinish(
			this.client,
			user,
			data.channelID,
			finalMessage.join('\n\n'),
			undefined,
			janeMessage,
			data,
			null
		);
	}
}
