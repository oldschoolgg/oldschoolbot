import { MessageAttachment } from 'discord.js';
import { KlasaMessage, KlasaUser } from 'klasa';

import { Favours, gotFavour } from '../../minions/data/kourendFavour';
import Farming from '../../skilling/skills/farming';
import { itemNameFromID, rand } from '../../util';
import { Plant, SkillsEnum } from '../types';

export function calcNumOfPatches(plant: Plant, user: KlasaUser, qp: number): [number, string | undefined] {
	let numOfPatches = plant.defaultNumOfPatches;
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
	const questPoints = qp;
	for (let i = plant.additionalPatchesByQP.length; i > 0; i--) {
		const [questPointsReq, additionalPatches] = plant.additionalPatchesByQP[i - 1];
		if (questPoints >= questPointsReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	let errorMessage: string | undefined = undefined;
	for (let i = plant.additionalPatchesByFarmGuildAndLvl.length; i > 0; i--) {
		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 60);
		if (!hasFavour) {
			errorMessage = `${user.minionName} needs ${requiredPoints}% Hosidius Favour to use Farming guild patches.`;
			break;
		}
		const [farmingLevelReq, additionalPatches] = plant.additionalPatchesByFarmGuildAndLvl[i - 1];
		if (farmingLevel >= farmingLevelReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	for (let i = plant.additionalPatchesByFarmLvl.length; i > 0; i--) {
		const [farmingLevelReq, additionalPatches] = plant.additionalPatchesByFarmLvl[i - 1];
		if (farmingLevel >= farmingLevelReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	return [numOfPatches, errorMessage];
}

export function calcVariableYield(
	plant: Plant,
	upgradeType: string | null,
	farmingLevel: number,
	quantityAlive: number
) {
	if (!plant.variableYield) return 0;
	let cropYield = 0;
	if (plant.name === 'Crystal tree') {
		if (!plant.variableOutputAmount) return 0;
		for (let i = plant.variableOutputAmount.length; i > 0; i--) {
			const [upgradeTypeNeeded, min, max] = plant.variableOutputAmount[i - 1];
			if (upgradeType === upgradeTypeNeeded) {
				cropYield += rand(min, max);
				cropYield *= quantityAlive;
				break;
			}
		}
	} else if (plant.name === 'Limpwurt' || plant.name === 'Belladonna') {
		for (let i = 0; i < quantityAlive; i++) {
			cropYield += 3 + rand(1, Math.floor(farmingLevel / 10));
		}
	}

	if (!cropYield) return 0;
	return cropYield;
}

export function returnListOfPlants(msg: KlasaMessage) {
	const attachment = new MessageAttachment(
		Buffer.from(
			Farming.Plants.map(
				plant =>
					`${plant.seedType}: ${plant.name} -- lvl ${plant.level}: ${Object.entries(plant.inputItems)
						.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
						.join(', ')}\n	Default # of patches: ${
						plant.defaultNumOfPatches
					}\n${plant.additionalPatchesByFarmGuildAndLvl.map(
						entry => `	| Farming Level: ${entry[0]} => Total Additional Patches: ${entry[1]} |\n`
					)} ${plant.additionalPatchesByQP.map(
						entry => `	| Quest Points: ${entry[0]} => Total Additional Patches: ${entry[1]} |\n`
					)} `
			).join('\n')
		),
		'Farming Plants.txt'
	);
	return msg.channel.send({ files: [attachment] });
}
