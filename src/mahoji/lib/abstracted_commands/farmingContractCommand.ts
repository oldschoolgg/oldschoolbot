import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';

import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { defaultFarmingContract } from '../../../lib/minions/farming';
import { ContractOption, FarmingContract, FarmingContractDifficultyLevel } from '../../../lib/minions/farming/types';
import { getPlantToGrow } from '../../../lib/skilling/functions/calcFarmingContracts';
import { getFarmingInfo } from '../../../lib/skilling/functions/getFarmingInfo';
import { SkillsEnum } from '../../../lib/skilling/types';
import { roughMergeMahojiResponse } from '../../../lib/util';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import { findPlant } from '../../../lib/util/farmingHelpers';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { minionName } from '../../../lib/util/minionUtils';
import {
	getMahojiBank,
	getSkillsOfMahojiUser,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../../mahojiSettings';
import { farmingPlantCommand, harvestCommand } from './farmingCommand';
import { abstractedOpenCommand } from './openCommand';

async function janeImage(content: string) {
	const image = await newChatHeadImage({ content, head: 'jane' });
	return { attachments: [{ buffer: image, fileName: 'jane.jpg' }] };
}

const contractToFarmingLevel = {
	easy: 45,
	medium: 65,
	hard: 85
};

export function getFarmingContractOfUser(user: User) {
	const currentContract: FarmingContract =
		(user.minion_farmingContract as FarmingContract | null) ?? defaultFarmingContract;
	return currentContract;
}

export async function farmingContractCommand(userID: bigint, input?: ContractOption): CommandResponse {
	const user = await mahojiUsersSettingsFetch(userID);
	const bank = getMahojiBank(user);
	const farmingLevel = getSkillsOfMahojiUser(user, true).farming;
	const currentContract = getFarmingContractOfUser(user);
	const plant = currentContract.hasContract ? findPlant(currentContract.plantToGrow) : null;

	if (!input) {
		return `You have completed a total of ${currentContract.contractsCompleted} Farming Contracts!
**Current Contract:** ${plant ? `${plant.name} - ${currentContract.difficultyLevel}` : 'None'}`;
	}

	if (bank.has('Seed pack')) {
		return janeImage('You need to open your seed pack before receiving a new contract!');
	}

	if (!currentContract.hasContract && input === 'easier') {
		return janeImage("You currently don't have a contract, so you can't ask for something easier!");
	}

	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 60);
	if (!hasFavour) {
		return `${minionName(user)} needs ${requiredPoints}% Hosidius Favour to enter the Farming Guild!`;
	}

	if (input !== 'easier' && farmingLevel < contractToFarmingLevel[input]) {
		return janeImage(
			`You need ${contractToFarmingLevel[input]} farming to receive a contract of ${input} difficulty!`
		);
	}

	if (currentContract.hasContract) {
		if (input === 'easier') {
			if (currentContract.difficultyLevel === 'easy') {
				return janeImage('Pardon me, but you already have the easiest contract level available!');
			}
			const newContractLevel: ContractOption = currentContract.difficultyLevel === 'hard' ? 'medium' : 'easy';
			const plantInformation = getPlantToGrow(user, {
				contractLevel: newContractLevel,
				ignorePlant: currentContract.plantToGrow!
			});
			const plantToGrow = plantInformation[0];
			const plantTier = plantInformation[1];

			const farmingContractUpdate: FarmingContract = {
				hasContract: true,
				difficultyLevel: newContractLevel,
				plantToGrow,
				plantTier,
				contractsCompleted: currentContract.contractsCompleted
			};
			await mahojiUserSettingsUpdate(user.id, {
				minion_farmingContract: farmingContractUpdate as any
			});
			return janeImage(
				`I suppose you were too chicken for the challenge. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`
			);
		}

		let easierStr = '';
		if (currentContract.difficultyLevel !== 'easy') {
			easierStr = "\nYou can request an easier contract if you'd like.";
		}
		return janeImage(
			`Your current contract (${currentContract.difficultyLevel}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`
		);
	}

	if (minionIsBusy(user.id)) {
		return janeImage(
			"You are busy at the moment! I can't give you a new farming contract like that. Please, come back when you have some free time for us to talk."
		);
	}

	const plantInformation = getPlantToGrow(user, {
		contractLevel: input as FarmingContractDifficultyLevel,
		ignorePlant: currentContract.plantToGrow
	});
	const plantToGrow = plantInformation[0] as string;
	const plantTier = plantInformation[1] as 0 | 1 | 2 | 3 | 4 | 5;

	const farmingContractUpdate: FarmingContract = {
		hasContract: true,
		difficultyLevel: input as FarmingContractDifficultyLevel,
		plantToGrow,
		plantTier,
		contractsCompleted: currentContract.contractsCompleted
	};

	await mahojiUserSettingsUpdate(user.id, {
		minion_farmingContract: farmingContractUpdate as any
	});

	return janeImage(
		`Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`
	);
}

export async function autoContract(klasaUser: KlasaUser, channelID: bigint, userID: bigint): CommandResponse {
	const [farmingDetails, mahojiUser] = await Promise.all([getFarmingInfo(userID), mahojiUsersSettingsFetch(userID)]);
	const contract = mahojiUser.minion_farmingContract as FarmingContract | null;
	const plant = contract?.hasContract ? findPlant(contract?.plantToGrow) : null;
	const patch = farmingDetails.patchesDetailed.find(p => p.plant === plant);
	const bestContractTierCanDo = Object.entries(contractToFarmingLevel)
		.sort((a, b) => b[1] - a[1])
		.find(a => klasaUser.skillLevel(SkillsEnum.Farming) >= a[1])?.[0] as ContractOption | undefined;

	if (klasaUser.owns('Seed pack')) {
		const openResponse = await abstractedOpenCommand(null, klasaUser, mahojiUser, ['seed pack'], 'auto');
		const contractResponse = await farmingContractCommand(userID, bestContractTierCanDo);
		return roughMergeMahojiResponse(openResponse, contractResponse);
	}

	// If they have no contract, get them a contract, recurse.
	if (!contract || !contract.hasContract) {
		const contractResult = await farmingContractCommand(userID, bestContractTierCanDo);
		const newUser = await mahojiUsersSettingsFetch(mahojiUser.id, { minion_farmingContract: true });
		const contract = newUser.minion_farmingContract as FarmingContract | null;
		if (!contract || !contract.plantToGrow) return contractResult;
		return farmingPlantCommand({
			user: klasaUser,
			plantName: contract.plantToGrow,
			pay: false,
			autoFarmed: false,
			quantity: null,
			channelID
		});
	}

	// If they have a contract, but nothing planted, plant it.
	if (!patch) {
		return farmingPlantCommand({
			user: klasaUser,
			plantName: plant!.name,
			quantity: null,
			autoFarmed: false,
			channelID,
			pay: false
		});
	}

	// If they have a contract, and its planted, and its ready, harvest it.
	if (patch.ready) {
		return harvestCommand({ user: klasaUser, channelID, seedType: patch.patchName });
	}

	return 'Your current contract is still growing.';
}
