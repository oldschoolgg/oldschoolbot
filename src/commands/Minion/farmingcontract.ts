import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import guildmasterJaneImage from '../../lib/image/guildmasterJaneImage';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getPlantToGrow } from '../../lib/skilling/functions/calcFarmingContracts';
import { SkillsEnum } from '../../lib/skilling/types';
import { bankHasItem } from '../../lib/util';
import itemID from '../../lib/util/itemID';
import { FarmingContract } from './../../lib/farming/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<easy|medium|hard|easier|current|completed>',
			usageDelim: ' ',
			aliases: ['fc', 'fcontract']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[contractLevel]: ['easy' | 'medium' | 'hard' | 'easier' | 'current' | 'completed']
	) {
		await msg.author.settings.sync(true);
		const farmingLevel = msg.author.skillLevel(SkillsEnum.Farming);
		const currentContract = msg.author.settings.get(UserSettings.Minion.FarmingContract);

		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (contractLevel === 'completed') {
			if (currentContract.contractsCompleted > 0) {
				return msg.send(
					await guildmasterJaneImage(
						`I have checked my diary and you have completed a total of ${currentContract.contractsCompleted} farming contracts!`
					)
				);
			}
			return msg.send(
				await guildmasterJaneImage(
					`I tried to check my diary but you haven't completed any farming contracts yet...`
				)
			);
		}

		if (bankHasItem(userBank, itemID('Seed pack'), 1)) {
			return msg.send(
				await guildmasterJaneImage(
					`You need to open your seed pack before receiving a new contract!`
				)
			);
		}

		if (!currentContract.hasContract && contractLevel === 'easier') {
			return msg.send(
				await guildmasterJaneImage(
					`You currently don't have a contract, so you can't ask for something easier!`
				)
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
			return msg.send(
				await guildmasterJaneImage(
					`You need ${contractToFarmingLevel[contractLevel]} farming to receive a contract of ${contractLevel} difficulty!`
				)
			);
		}

		if (currentContract.hasContract) {
			if (contractLevel === 'easier') {
				if (currentContract.difficultyLevel === 'easy') {
					return msg.send(
						await guildmasterJaneImage(
							`Pardon me, but you already have the easiest contract level available!`
						)
					);
				}
				const newContractLevel = 'easy';
				const plantInformation = getPlantToGrow(msg.author, newContractLevel);
				const plantToGrow = plantInformation[0] as string;
				const plantTier = plantInformation[1] as 0 | 1 | 2 | 3 | 4 | 5;

				const farmingContractUpdate: FarmingContract = {
					hasContract: true,
					difficultyLevel: newContractLevel,
					plantToGrow,
					plantTier,
					contractsCompleted: currentContract.contractsCompleted
				};

				await msg.author.settings.update(
					UserSettings.Minion.FarmingContract,
					farmingContractUpdate
				);

				return msg.send(
					await guildmasterJaneImage(
						`I suppose you were too chicken for the challange. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`
					)
				);
			}

			let easierStr = '';
			if (currentContract.difficultyLevel !== 'easy') {
				easierStr = `\nYou can request an easier contract if you'd like.`;
			}
			return msg.send(
				await guildmasterJaneImage(
					`Your current contract (${currentContract.difficultyLevel}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`
				)
			);
		}

		if (contractLevel === 'current' || contractLevel === 'easier') return;

		const plantInformation = getPlantToGrow(msg.author, contractLevel);
		const plantToGrow = plantInformation[0] as string;
		const plantTier = plantInformation[1] as 0 | 1 | 2 | 3 | 4 | 5;

		const farmingContractUpdate: FarmingContract = {
			hasContract: true,
			difficultyLevel: contractLevel,
			plantToGrow,
			plantTier,
			contractsCompleted: currentContract.contractsCompleted
		};

		await msg.author.settings.update(
			UserSettings.Minion.FarmingContract,
			farmingContractUpdate
		);

		return msg.send(
			await guildmasterJaneImage(
				`Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`
			)
		);
	}
}
