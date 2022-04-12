import { CommandStore, KlasaMessage } from 'klasa';

import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { requiresMinion } from '../../lib/minions/decorators';
import { defaultFarmingContract } from '../../lib/minions/farming';
import { FarmingContract } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getPlantToGrow } from '../../lib/skilling/functions/calcFarmingContracts';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { bankHasItem } from '../../lib/util';
import chatHeadImage from '../../lib/util/chatHeadImage';
import itemID from '../../lib/util/itemID';

type FarmingContractDifficultyLevel = 'easy' | 'medium' | 'hard';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '<easy|medium|hard|easier|current|completed>',
			usageDelim: ' ',
			aliases: ['fc', 'fcontract'],
			description:
				'Allows a player to be assigned a farming contract. Can also check stats for farming contracts.',
			examples: ['+fc easy', '+fcontract current', '+farmingcontract completed'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [contractLevel]: ['easy' | 'medium' | 'hard' | 'easier' | 'current' | 'completed']) {
		await msg.author.settings.sync(true);
		const farmingLevel = msg.author.skillLevel(SkillsEnum.Farming);
		const currentContract = msg.author.settings.get(UserSettings.Minion.FarmingContract) ?? defaultFarmingContract;

		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (contractLevel === 'completed') {
			if (currentContract.contractsCompleted > 0) {
				return msg.channel.send({
					files: [
						await chatHeadImage({
							content: `I have checked my diary and you have completed a total of ${currentContract.contractsCompleted} farming contracts!`,
							head: 'jane'
						})
					]
				});
			}
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "I tried to check my diary but you haven't completed any farming contracts yet...",
						head: 'jane'
					})
				]
			});
		}

		if (bankHasItem(userBank, itemID('Seed pack'), 1)) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: 'You need to open your seed pack before receiving a new contract!',
						head: 'jane'
					})
				]
			});
		}

		if (!currentContract.hasContract && contractLevel === 'easier') {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "You currently don't have a contract, so you can't ask for something easier!",
						head: 'jane'
					})
				]
			});
		}

		if (!currentContract.hasContract && contractLevel === 'current') {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "You currently don't have a contract!",
						head: 'jane'
					})
				]
			});
		}

		const [hasFavour, requiredPoints] = gotFavour(msg.author, Favours.Hosidius, 60);
		if (!hasFavour) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${requiredPoints}% Hosidius Favour to enter the Farming Guild!`
			);
		}

		const contractToFarmingLevel = {
			easy: 45,
			medium: 65,
			hard: 85
		};

		if (
			contractLevel !== 'easier' &&
			contractLevel !== 'current' &&
			farmingLevel < contractToFarmingLevel[contractLevel]
		) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: `You need ${contractToFarmingLevel[contractLevel]} farming to receive a contract of ${contractLevel} difficulty!`,
						head: 'jane'
					})
				]
			});
		}

		if (currentContract.hasContract) {
			if (contractLevel === 'easier') {
				if (currentContract.difficultyLevel === 'easy') {
					return msg.channel.send({
						files: [
							await chatHeadImage({
								content: 'Pardon me, but you already have the easiest contract level available!',
								head: 'jane'
							})
						]
					});
				}
				const newContractLevel = currentContract.difficultyLevel === 'hard' ? 'medium' : 'easy';
				const plantInformation = getPlantToGrow(msg.author, {
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

				await msg.author.settings.update(UserSettings.Minion.FarmingContract, farmingContractUpdate);

				return msg.channel.send({
					files: [
						await chatHeadImage({
							content: `I suppose you were too chicken for the challenge. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`,
							head: 'jane'
						})
					]
				});
			}

			let easierStr = '';
			if (currentContract.difficultyLevel !== 'easy') {
				easierStr = "\nYou can request an easier contract if you'd like.";
			}
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: `Your current contract (${currentContract.difficultyLevel}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`,
						head: 'jane'
					})
				]
			});
		}

		if (msg.author.minionIsBusy) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content:
							"You are busy at the moment! I can't give you a new farming contract like that. Please, come back when you have some free time for us to talk.",
						head: 'jane'
					})
				]
			});
		}

		const plantInformation = getPlantToGrow(msg.author, {
			contractLevel: contractLevel as FarmingContractDifficultyLevel,
			ignorePlant: currentContract.plantToGrow
		});
		const plantToGrow = plantInformation[0] as string;
		const plantTier = plantInformation[1] as 0 | 1 | 2 | 3 | 4 | 5;

		const farmingContractUpdate: FarmingContract = {
			hasContract: true,
			difficultyLevel: contractLevel as FarmingContractDifficultyLevel,
			plantToGrow,
			plantTier,
			contractsCompleted: currentContract.contractsCompleted
		};

		await msg.author.settings.update(UserSettings.Minion.FarmingContract, farmingContractUpdate);

		return msg.channel.send({
			files: [
				await chatHeadImage({
					content: `Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`,
					head: 'jane'
				})
			]
		});
	}
}
