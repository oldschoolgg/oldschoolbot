import { getItem, mentionCommand } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { getSmokeyLotteryGiveawayInterval, smokeyLotteryMaxTickets } from '../../lib/christmasEvent';
import { christmasCakeIngredients } from '../../lib/constants';
import { formatDuration } from '../../lib/util';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../lib/util/clientSettings';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { Cooldowns } from '../lib/Cooldowns';
import { itemOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

export const christmasCommand: OSBMahojiCommand = {
	name: 'christmas',
	description: 'The 2023 Christmas Event.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'smokey_lottery',
			description: 'The smokey lottery!',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'view',
					description: 'View information on the lottery.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'main_event',
			description: 'The main christmas event!',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'speak_to_rudolph',
					description: 'Speak to rudolph the reindeer.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'info',
					description: 'View information on the event.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'ironman_food_bank',
					description: 'Donate food ingredients to the ironman food bank.',
					options: [
						{
							...ownedItemOption(i => christmasCakeIngredients.includes(i.id)),
							name: 'donate_item',
							description: 'The item you want to donate to the food bank.'
						},
						{
							...itemOption(i => christmasCakeIngredients.includes(i.id)),
							name: 'take_item',
							description: 'The item you want to take from the food bank.'
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		smokey_lottery?: {
			view?: {};
		};
		main_event?: {
			speak_to_rudolph?: {};
			info?: {};
			ironman_food_bank?: {
				donate_item?: string;
				take_item?: string;
			};
		};
	}>) => {
		const user = await mUserFetch(userID);

		if (options.main_event?.ironman_food_bank) {
			if (!user.isIronman) return 'You must be an ironman to use the food bank.';
			if (options.main_event.ironman_food_bank.donate_item) {
				const item = getItem(options.main_event.ironman_food_bank.donate_item);
				if (!item) return 'Invalid item.';
				if (!christmasCakeIngredients.includes(item.id)) return 'Invalid item.';
				if (user.bank.amount(item.id) === 0) return `You don't have any ${item.name}.`;
				const items = new Bank().add(item);
				await transactItems({
					userID: user.id,
					collectionLog: false,
					itemsToRemove: items
				});
				await updateBankSetting('xmas_ironman_food_bank', items);
				return `You donated ${items} to the food bank.`;
			}

			if (options.main_event.ironman_food_bank.take_item) {
				const isOnCooldown = Cooldowns.get(user.id, 'FOODBANK', Time.Hour * 6);
				if (isOnCooldown !== null) {
					return `You can take another item from the food bank in: ${formatDuration(isOnCooldown)}.`;
				}
				const item = getItem(options.main_event.ironman_food_bank.take_item);
				if (!item) return 'Invalid item.';
				if (!christmasCakeIngredients.includes(item.id)) return 'Invalid item.';
				if (user.bank.amount(item.id) > 0) return `You already have a ${item.name}.`;
				const currentBank = new Bank(
					(await mahojiClientSettingsFetch({ xmas_ironman_food_bank: true }))
						.xmas_ironman_food_bank as ItemBank
				);
				const items = new Bank().add(item);
				if (!currentBank.has(items)) return `The food bank doesn't have any ${item.name}.`;
				const newBank = currentBank.remove(items);
				await mahojiClientSettingsUpdate({ xmas_ironman_food_bank: newBank.bank });
				await transactItems({
					userID: user.id,
					collectionLog: true,
					itemsToAdd: new Bank().add(item)
				});
				return `You took ${items} from the food bank.`;
			}
		}

		if (options.smokey_lottery?.view) {
			const data = user.smokeyLotteryData();
			return `**Your Tickets:**\n
**Grinchion Tickets:** ${data.grinchionTickets}/${smokeyLotteryMaxTickets.grinchionTickets}
**Giveaway Tickets:** ${data.giveawayTickets}/${smokeyLotteryMaxTickets.giveawayTickets} Next daily reset: ${
				getSmokeyLotteryGiveawayInterval().nextResetStr
			}
**Challenge Tickets:** ${data.challengeTickets}/${smokeyLotteryMaxTickets.challengeTickets}
**Pet Hunt Tickets:** ${data.petHuntTickets}/${smokeyLotteryMaxTickets.petHuntTickets}
`;
		}

		if (options.main_event?.speak_to_rudolph) {
			if (user.cl.has('Burnt butter')) {
				return 'Rudolph is with you now.';
			}
			if (
				user.cl.has('Christmas cake recipe') &&
				user.bank.has('Christmas cake') &&
				!user.cl.has('Burnt butter')
			) {
				await transactItems({
					userID: user.id,
					collectionLog: true,
					itemsToAdd: new Bank().add('Burnt butter').add('Note from pets'),
					itemsToRemove: new Bank().add('Christmas cake')
				});
				return {
					...(await mahojiChatHead({
						content:
							"Delicious...cake... hand it over! I'm sure Santa will love it when he gets back. I'll wait with you until he gets back.",
						head: 'rudolph'
					})),
					content:
						'You hand the cake over to Rudolph, he sneaks off with it, and some of the pets from your bank join him to eat it - after finishing it, they leave behind a note that you pick up. Rudolph decides to join you until Santa returns.'
				};
			}
			if (user.cl.has('Christmas cake recipe')) {
				return mahojiChatHead({
					content:
						'You already have the christmas cake recipe, please make m..santa one! Santa will want a cake when he gets back.',
					head: 'rudolph'
				});
			}
			if (user.user.grinchions_caught >= 3) {
				await user.addItemsToBank({ items: new Bank().add('Christmas cake recipe'), collectionLog: true });
				return {
					...(await mahojiChatHead({
						content:
							'Thank you for helping me catch those grinchions! I found a christmas cake recipe, use it to make a cake for Santa!',
						head: 'rudolph'
					})),
					content: "You've received a Christmas cake recipe."
				};
			}
			return mahojiChatHead({
				content:
					'Santa has been kidnapped by the grinch, and all his grinchions are stealing presents! Please help us catch them!',
				head: 'rudolph'
			});
		}

		if (options.main_event?.info) {
			return `**Christmas Event 2023**

To progress in the event, speak to Rudolph ${mentionCommand(
				globalClient,
				'christmas',
				'main_event',
				'speak_to_rudolph'
			)}, and do trips to hunt grinchions!
You have caught ${user.user.grinchions_caught} grinchions.`;
		}

		return 'Invalid command.';
	}
};
