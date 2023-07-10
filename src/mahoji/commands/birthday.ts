import { mentionCommand } from '@oldschoolgg/toolkit';
import { roll, shuffleArr, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { randomVariation } from 'oldschooljs/dist/util';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import resolveItems from '../../lib/util/resolveItems';
import { formatDuration } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

const bugHandInRewards = resolveItems(['Ban hammer', 'The Interrogator', 'Acrylic set']);

export const birthdayCommand: OSBMahojiCommand = {
	name: 'birthday',
	description: 'The 2023 BSO Birthday Event!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'help',
			description: 'Receive help on what to do.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'collect',
			description: 'Collect cake ingredients.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hand_in',
			description: 'Hand in items.'
		}
	],
	run: async ({ options, channelID, userID }: CommandRunOptions<{ help?: {}; collect?: {}; hand_in?: {} }>) => {
		const user = await mUserFetch(userID);
		const cakeIngredients = resolveItems(['Perfect egg', 'Perfect bucket of milk', 'Perfect pot of flour']);
		const hasAllCakeIngredients = cakeIngredients.every(id => user.bank.has(id));

		if (options.hand_in) {
			if (hasAllCakeIngredients) {
				const cost = new Bank();
				for (const i of cakeIngredients) cost.add(i);
				await user.removeItemsFromBank(cost);
				const loot = new Bank();
				if (!user.cl.has('Delicious birthday cake')) {
					loot.add('Delicious birthday cake');
				}
				if (!user.cl.has('Bunch of flowers')) {
					loot.add('Bunch of flowers');
				}
				if (!user.cl.has('Birthday love note')) {
					loot.add('Birthday love note');
				}

				if (!user.bank.has('Bug jar')) {
					loot.add('Bug jar');
				}
				if (loot.length > 0) {
					await user.addItemsToBank({ items: loot, collectionLog: true });
					return mahojiChatHead({
						head: 'partyPete',
						content: `Thanks for the ingredients! Here's your reward... ${loot}. Use the Bug jar to collect bugs!`
					});
				}
				return mahojiChatHead({ head: 'partyPete', content: 'Thanks for the ingredients!' });
			}
			if (user.bank.has('Bug jar')) {
				return mahojiChatHead({
					head: 'partyPete',
					content: 'Your Bug jar is empty, go find a bug!'
				});
			}
			if (user.bank.has('Full bug jar')) {
				const loot = new Bank();
				const [possibleReward] = shuffleArr(bugHandInRewards).filter(i => !user.cl.has(i));

				await transactItems({
					userID,
					collectionLog: true,
					itemsToRemove: new Bank().add('Full bug jar'),
					itemsToAdd: new Bank().add('Bug jar')
				});

				const buggyRate = user.cl.has('Buggy') ? clAdjustedDroprate(user, 'Buggy', 35, 1.2) : 10;
				if (roll(buggyRate)) {
					const petLoot = new Bank().add('Buggy');
					await user.addItemsToBank({ items: petLoot, collectionLog: true });
					return mahojiChatHead({
						head: 'partyPete',
						content: `This bug is... strange. It's too big for me to keep, you should keep it. You received... ${petLoot}`
					});
				}

				if (possibleReward && roll(5)) {
					loot.add(possibleReward);
					await user.addItemsToBank({ items: loot, collectionLog: true });
				}

				if (possibleReward) {
					return mahojiChatHead({
						head: 'partyPete',
						content: `Thank you for the bug! Here's your reward... ${loot}. Now find me another one.`
					});
				}
				return mahojiChatHead({
					head: 'partyPete',
					content: 'Thank you for the bug! Now find me another one.'
				});
			}
			return mahojiChatHead({
				head: 'partyPete',
				content: "You don't have the ingredients, collect them!"
			});
		}

		if (options.help) {
			if (user.bank.has('Bug jar')) {
				return mahojiChatHead({
					head: 'partyPete',
					content: 'Go do trips and find bugs, then hand them in when you find one!'
				});
			}
			if (user.bank.has('Full bug jar')) {
				return mahojiChatHead({
					head: 'partyPete',
					content: 'You found a bug! Hand it in to me.'
				});
			}
			return {
				content: `You can hand things in to Party pete using ${mentionCommand(
					globalClient,
					'birthday',
					'hand_in'
				)}. You can collect cake ingredients using ${mentionCommand(globalClient, 'birthday', 'collect')}.`,
				...(await mahojiChatHead({
					head: 'partyPete',
					content:
						'Collect some *perfect* cake ingredients for me, then hand them in to me so I can make the *perfect* Birthday cake!'
				}))
			};
		}

		if (options.collect) {
			if (hasAllCakeIngredients) {
				return mahojiChatHead({
					head: 'partyPete',
					content: 'You already have all the ingredients! Hand them in to me.'
				});
			}
			const activity = await addSubTaskToActivityTask<ActivityTaskOptions>({
				userID: user.id,
				channelID: channelID.toString(),
				duration: randomVariation(Time.Minute * 10, 15),
				type: 'BirthdayCollectIngredients'
			});
			return `${user.minionName} is now collecting ingredients for the cake! It'll take around ${formatDuration(
				activity.duration
			)} to finish.`;
		}

		return 'Invalid command.';
	}
};
