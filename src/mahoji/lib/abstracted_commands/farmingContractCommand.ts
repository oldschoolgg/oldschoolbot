import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import type { IFarmingContract, IFarmingContractDifficultyLevel } from '@oldschoolgg/schemas';
import { toTitleCase } from '@oldschoolgg/toolkit';

import { EmojiId } from '@/lib/data/emojis.js';
import type { MessageBuilderClass } from '@/lib/discord/MessageBuilder.js';
import { Farming, plants } from '@/lib/skilling/skills/farming/index.js';
import { getPlantToGrow } from '@/lib/skilling/skills/farming/utils/calcFarmingContracts.js';
import type { ContractOption } from '@/lib/skilling/skills/farming/utils/types.js';
import { farmingPlantCommand, harvestCommand } from '@/mahoji/lib/abstracted_commands/farmingCommand.js';
import { abstractedOpenCommand } from '@/mahoji/lib/abstracted_commands/openCommand.js';

function makeEasierFarmingContractButton() {
	return new ButtonBuilder()
		.setCustomId('FARMING_CONTRACT_EASIER')
		.setLabel('Ask for easier Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ id: EmojiId.Seedpack });
}

const contractToFarmingLevel = {
	easy: 45,
	medium: 65,
	hard: 85
};

function isValidDifficulty(input: string): input is IFarmingContractDifficultyLevel {
	return ['easy', 'medium', 'hard'].includes(input);
}

function formatNewContractContent(plantName: string, difficulty: IFarmingContractDifficultyLevel) {
	return `Your new farming contract is: ${plantName} (${toTitleCase(difficulty)} contract)`;
}

export async function farmingContractCommand(
	user: MUser,
	input?: ContractOption
): Promise<string | MessageBuilderClass> {
	const farmingLevel = user.skillsAsLevels.farming;
	const currentContract: IFarmingContract = user.fetchFarmingContract();
	const plant = currentContract.hasContract ? Farming.findPlant(currentContract.plantToGrow) : null;

	if (!input) {
		if (!currentContract.hasContract) {
			const bestTier = bestFarmingContractUserCanDo(user);
			if (bestTier !== undefined) {
				return farmingContractCommand(user, bestTier);
			}
		}

		return `You have completed a total of ${currentContract.contractsCompleted} Farming Contracts!
**Current Contract:** ${plant ? `${plant.name} - ${currentContract.difficultyLevel}` : 'None'}`;
	}

	if (user.owns('Seed pack')) {
		return new MessageBuilder().addChatHeadImage(
			'jane',
			'You need to open your seed pack before receiving a new contract!'
		);
	}

	if (!currentContract.hasContract && input === 'easier') {
		return new MessageBuilder().addChatHeadImage(
			'jane',
			"You currently don't have a contract, so you can't ask for something easier!"
		);
	}

	if (input !== 'easier' && farmingLevel < contractToFarmingLevel[input]) {
		return new MessageBuilder().addChatHeadImage(
			'jane',
			`You need ${contractToFarmingLevel[input]} farming to receive a contract of ${input} difficulty!`
		);
	}

	if (currentContract.hasContract) {
		if (input === 'easier') {
			if (currentContract.difficultyLevel === 'easy') {
				return new MessageBuilder().addChatHeadImage(
					'jane',
					'Pardon me, but you already have the easiest contract level available!'
				);
			}
			const newContractLevel: IFarmingContractDifficultyLevel =
				currentContract.difficultyLevel === 'hard' ? 'medium' : 'easy';
			const plantInformation = getPlantToGrow({
				user,
				contractLevel: newContractLevel,
				ignorePlant: currentContract.plantToGrow!
			});
			const plantToGrow = plantInformation[0];
			const plantTier = plantInformation[1];

			await user.updateFarmingContract({
				hasContract: true,
				difficultyLevel: newContractLevel,
				plantToGrow,
				plantTier,
				contractsCompleted: currentContract.contractsCompleted
			});

			const response = new MessageBuilder()
				.setContent(formatNewContractContent(plantToGrow, newContractLevel))
				.addChatHeadImage(
					'jane',
					`I suppose you were too chicken for the challenge. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`
				)
				.addComponents(newContractLevel !== 'easy' ? [makeEasierFarmingContractButton()] : undefined);

			return response;
		}

		let easierStr = '';
		if (currentContract.difficultyLevel !== 'easy') {
			easierStr = "\nYou can request an easier contract if you'd like.";
		}
		const response = new MessageBuilder()
			.addChatHeadImage(
				'jane',
				`Your current contract (${currentContract.difficultyLevel}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`
			)
			.addComponents(
				currentContract.difficultyLevel !== 'easy' ? [makeEasierFarmingContractButton()] : undefined
			);

		return response;
	}

	if (await user.minionIsBusy()) {
		return new MessageBuilder().addChatHeadImage(
			'jane',
			"You are busy at the moment! I can't give you a new farming contract like that. Please, come back when you have some free time for us to talk."
		);
	}

	if (!isValidDifficulty(input)) {
		throw new Error(`Oopsie woopsie >.<`);
	}

	const plantInformation = getPlantToGrow({
		user,
		contractLevel: input,
		ignorePlant: currentContract.plantToGrow
	});
	const plantToGrow = plantInformation[0] as string;
	const plantTier = plantInformation[1] as 0 | 1 | 2 | 3 | 4 | 5;

	await user.updateFarmingContract({
		hasContract: true,
		difficultyLevel: input,
		plantToGrow,
		plantTier,
		contractsCompleted: currentContract.contractsCompleted
	});

	const response = new MessageBuilder()
		.setContent(formatNewContractContent(plantToGrow, input))
		.addChatHeadImage(
			'jane',
			`Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`
		)
		.addComponents(input !== 'easy' ? [makeEasierFarmingContractButton()] : undefined);
	return response;
}

export function canRunAutoContract(user: MUser) {
	// Must be above 45 farming
	if (user.skillsAsLevels.farming < 45) return false;

	// If we don't have a contract, we can auto contract
	const contract = user.fetchFarmingContract();
	if (!contract || !contract.hasContract) return true;

	const farmingDetails = user.farmingInfo();

	// If the patch we're contracted to is ready, we can auto contract
	const contractedPatch = farmingDetails.patchesDetailed.find(
		p => p.patchName === plants.find(pl => pl.name === contract.plantToGrow)?.seedType
	);
	return contractedPatch?.ready;
}

function bestFarmingContractUserCanDo(user: MUser) {
	return Object.entries(contractToFarmingLevel)
		.sort((a, b) => b[1] - a[1])
		.find(a => user.skillLevel('farming') >= a[1])?.[0] as ContractOption | undefined;
}

export async function autoContract(interaction: MInteraction, user: MUser): Promise<string | MessageBuilderClass> {
	const contract = user.farmingContract();
	const plant = contract.contract ? Farming.findPlant(contract.contract.plantToGrow) : null;
	const patch = contract.farmingInfo.patchesDetailed.find(p => p.plant === plant);
	const bestContractTierCanDo = bestFarmingContractUserCanDo(user);

	if (user.owns('Seed pack')) {
		const openResponse = await abstractedOpenCommand(null, user, ['seed pack'], 'auto');
		await user.sync();
		const contractResponse = await farmingContractCommand(user, bestContractTierCanDo);
		const msg =
			openResponse instanceof MessageBuilder ? openResponse : new MessageBuilder().setContent(openResponse);
		return msg.merge(contractResponse);
	}

	// If they have no contract, get them a contract, recurse.
	if (!contract.contract) {
		const contractResult = await farmingContractCommand(user, bestContractTierCanDo);
		const newContract: IFarmingContract = user.fetchFarmingContract();
		if (!newContract.hasContract || !newContract.plantToGrow) return contractResult;
		return farmingPlantCommand({
			user,
			interaction,
			plantName: newContract.plantToGrow,
			pay: false,
			autoFarmed: false,
			quantity: null
		});
	}

	// If they have a contract, but nothing planted, plant it.
	if (!patch) {
		return farmingPlantCommand({
			user,
			interaction,
			plantName: plant!.name,
			quantity: null,
			autoFarmed: false,
			pay: false
		});
	}

	// If they have a contract, and its planted, and it's ready, harvest it.
	if (patch.ready) {
		return harvestCommand({ user, seedType: patch.patchName, interaction });
	}

	return 'Your current contract is still growing.';
}
