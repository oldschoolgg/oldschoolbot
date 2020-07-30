import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import guildmasterJaneImage from '../../lib/image/guildmasterJaneImage';
import { getPlantToGrow } from '../../lib/skilling/functions/calcFarmingContracts';
import { SkillsEnum } from '../../lib/skilling/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<contractLevel:...string>',
			usageDelim: ' ',
			aliases: ['fc']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[contractLevel]: ['completed' | 'easy' | 'medium' | 'hard' | 'easier' | 'current']
	) {
		await msg.author.settings.sync(true);
		const farmingLevel = msg.author.skillLevel(SkillsEnum.Farming);
		const currentContract = msg.author.settings.get(
			UserSettings.FarmingContracts.FarmingContract
		);

		const userBank = msg.author.settings.get(UserSettings.Bank);

		if (
			contractLevel !== 'easy' &&
			contractLevel !== 'medium' &&
			contractLevel !== 'hard' &&
			contractLevel !== 'easier' &&
			contractLevel !== 'completed' &&
			contractLevel !== 'current'
		) {
			return msg.send(
				await guildmasterJaneImage(
					`Are you a melon? Say 'easy', 'medium', or 'hard' for a contract. Say 'current' to see your current contract. Say 'easier' for an easier contract level. Say 'completed' to see how many contracts you've completed.`
				)
			);
		}

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

		if (currentContract.contractStatus && contractLevel === 'easier') {
			return msg.send(
				await guildmasterJaneImage(
					`You currently don't have a contract, so you can't ask for something easier!`
				)
			);
		}

		if (contractLevel === 'easy' && farmingLevel < 45) {
			return msg.send(
				await guildmasterJaneImage(`You need 45 farming to receive an easy contract!`)
			);
		}
		if (contractLevel === 'medium' && farmingLevel < 65) {
			return msg.send(
				await guildmasterJaneImage(`You need 65 farming to receive a medium contract!`)
			);
		}
		if (contractLevel === 'hard' && farmingLevel < 85) {
			return msg.send(
				await guildmasterJaneImage(`You need 85 farming to receive a hard contract!`)
			);
		}

		if (currentContract.contractStatus) {
			if (contractLevel === 'easier') {
				if (currentContract.contractType === 'easy') {
					return msg.send(
						await guildmasterJaneImage(
							`Pardon me, but you already have the easiest contract level available!`
						)
					);
				}
				const newContractLevel = 'easy';
				const plantInformation = getPlantToGrow(msg.author, newContractLevel);
				const plantToGrow = plantInformation[0];
				const plantTier = plantInformation[1];

				const farmingContractUpdate = {
					contractStatus: true as boolean,
					contractType: newContractLevel as 'easy' | 'medium' | 'hard' | '',
					plantToGrow: plantToGrow as string | number,
					plantTier: plantTier as string | number,
					seedPackTier: 0 as 0 | 1 | 2 | 3 | 4 | 5,
					contractsCompleted: currentContract.contractsCompleted as number
				};

				await msg.author.settings.update(
					UserSettings.FarmingContracts.FarmingContract,
					farmingContractUpdate
				);

				return msg.send(
					await guildmasterJaneImage(
						`I suppose you were too chicken for the challange. Please could you grow a ${plantToGrow} instead for us? I'll reward you once you have checked its health.`
					)
				);
			}

			let easierStr = '';
			if (currentContract.contractType !== 'easy') {
				easierStr = `\nYou can request an easier contract if you'd like.`;
			}
			return msg.send(
				await guildmasterJaneImage(
					`Your current contract (${currentContract.contractType}) is to grow ${currentContract.plantToGrow}. Please come back when you have finished this contract first.${easierStr}`
				)
			);
		}

		if (contractLevel === 'current' || contractLevel === 'easier') return;

		const plantInformation = getPlantToGrow(msg.author, contractLevel);
		const plantToGrow = plantInformation[0];
		const plantTier = plantInformation[1];

		const farmingContractUpdate: {
			contractStatus: boolean;
			contractType: 'easy' | 'medium' | 'hard' | '';
			plantToGrow: string | number;
			plantTier: string | number;
			seedPackTier: 0 | 1 | 2 | 3 | 4 | 5;
			contractsCompleted: number;
		} = {
			contractStatus: true,
			contractType: contractLevel,
			plantToGrow,
			plantTier,
			seedPackTier: 0,
			contractsCompleted: currentContract.contractsCompleted
		};

		await msg.author.settings.update(
			UserSettings.FarmingContracts.FarmingContract,
			farmingContractUpdate
		);

		return msg.send(
			await guildmasterJaneImage(
				`Please could you grow a ${plantToGrow} for us? I'll reward you once you have checked its health.`
			)
		);
	}
}
