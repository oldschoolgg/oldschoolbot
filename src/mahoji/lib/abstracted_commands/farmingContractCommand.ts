import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';

import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { defaultFarmingContract } from '../../../lib/minions/farming';
import { ContractOption, FarmingContract, FarmingContractDifficultyLevel } from '../../../lib/minions/farming/types';
import { getPlantToGrow } from '../../../lib/skilling/functions/calcFarmingContracts';
import { getFarmingInfo } from '../../../lib/skilling/functions/getFarmingInfo';
import { plants } from '../../../lib/skilling/skills/farming';
import { makeComponents, makeEasierFarmingContractButton, roughMergeMahojiResponse } from '../../../lib/util';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import { findPlant } from '../../../lib/util/farmingHelpers';
import { makeAutoContractButton } from '../../../lib/util/globalInteractions';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { farmingPlantCommand, harvestCommand } from './farmingCommand';
import { abstractedOpenCommand } from './openCommand';

async function janeImage(content: string) {
	const image = await newChatHeadImage({ content, head: 'jane' });
	return { files: [{ attachment: image, name: 'jane.jpg' }] };
}

const contractToFarmingLevel = {
	easy: 45,
	medium: 65,
	hard: 85
};

export async function farmingContractCommand(userID: string, input?: ContractOption): CommandResponse {
	const user = await mUserFetch(userID);
	const farmingLevel = user.skillsAsLevels.farming;
	const currentContract: FarmingContract =
		(user.user.minion_farmingContract as FarmingContract | null) ?? defaultFarmingContract;
	const plant = currentContract.hasContract ? findPlant(currentContract.plantToGrow) : null;

	if (!input) {
		return `You have completed a total of ${currentContract.contractsCompleted} Farming Contracts!
**Current Contract:** ${plant ? `${plant.name} - ${currentContract.difficultyLevel}` : 'None'}`;
	}

	if (user.owns('Seed pack')) {
		return janeImage('You need to open your seed pack before receiving a new contract!');
	}

	if (!currentContract.hasContract && input === 'easier') {
		return janeImage("You currently don't have a contract, so you can't ask for something easier!");
	}

	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 60);
	if (!hasFavour) {
		return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to enter the Farming Guild!`;
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
			await user.update({
				minion_farmingContract: farmingContractUpdate as any
			});

			return {
				files: (
					await janeImage(
						`I suppose you were too chicken for the challenge. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`
					)
				).files,
				components:
					newContractLevel !== 'easy'
						? makeComponents([makeAutoContractButton(), makeEasierFarmingContractButton()])
						: undefined
			};
		}

		let easierStr = '';
		if (currentContract.difficultyLevel !== 'easy') {
			easierStr = "\nYou can request an easier contract if you'd like.";
		}

		return {
			files: (
				await janeImage(
					`Your current contract (${currentContract.difficultyLevel}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`
				)
			).files,
			components:
				currentContract.difficultyLevel !== 'easy'
						? makeComponents([makeAutoContractButton(), makeEasierFarmingContractButton()])
					: undefined
		};
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

	await user.update({
		minion_farmingContract: farmingContractUpdate as any
	});

	return {
		files: (
			await janeImage(
				`Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`
			)
		).files,
		components:
			input !== 'easy'
						? makeComponents([makeAutoContractButton(), makeEasierFarmingContractButton()])
					: undefined
	};
}

export async function canRunAutoContract(user: MUser) {
	// Must be above 45 farming
	if (user.skillLevel('farming') < 45) return false;

	// If we don't have a contract, we can auto contract
	const contract = user.user.minion_farmingContract as FarmingContract | null;
	if (!contract || !contract.hasContract) return true;

	const farmingDetails = await getFarmingInfo(user.id);

	// If the patch we're contracted to is ready, we can auto contract
	const contractedPatch = farmingDetails.patchesDetailed.find(
		p => p.patchName === plants.find(p => p.name === contract.plantToGrow)?.seedType
	);
	return contractedPatch?.ready;
}

export async function autoContract(user: MUser, channelID: string, userID: string): CommandResponse {
	const [farmingDetails, mahojiUser] = await Promise.all([
		getFarmingInfo(userID),
		mahojiUsersSettingsFetch(userID, { minion_farmingContract: true })
	]);
	const contract = mahojiUser.minion_farmingContract as FarmingContract | null;
	const plant = contract?.hasContract ? findPlant(contract?.plantToGrow) : null;
	const patch = farmingDetails.patchesDetailed.find(p => p.plant === plant);
	const bestContractTierCanDo = Object.entries(contractToFarmingLevel)
		.sort((a, b) => b[1] - a[1])
		.find(a => user.skillLevel('farming') >= a[1])?.[0] as ContractOption | undefined;

	if (user.owns('Seed pack')) {
		const openResponse = await abstractedOpenCommand(null, user.id, ['seed pack'], 'auto');
		const contractResponse = await farmingContractCommand(userID, bestContractTierCanDo);
		return roughMergeMahojiResponse(openResponse, contractResponse);
	}

	// If they have no contract, get them a contract, recurse.
	if (!contract || !contract.hasContract) {
		const contractResult = await farmingContractCommand(userID, bestContractTierCanDo);
		const newUser = await mahojiUsersSettingsFetch(userID, { minion_farmingContract: true });
		const contract = newUser.minion_farmingContract as FarmingContract | null;
		if (!contract || !contract.plantToGrow) return contractResult;
		return farmingPlantCommand({
			userID: user.id,
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
			userID: user.id,
			plantName: plant!.name,
			quantity: null,
			autoFarmed: false,
			channelID,
			pay: false
		});
	}

	// If they have a contract, and its planted, and its ready, harvest it.
	if (patch.ready) {
		return harvestCommand({ user, channelID, seedType: patch.patchName });
	}

	return 'Your current contract is still growing.';
}
