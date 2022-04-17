import { Bank, LootTable } from 'oldschooljs';

import { client } from '../..';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { newChatHeadImage } from '../../lib/util/chatHeadImage';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUserSettingsUpdate } from '../mahojiSettings';

const UniqueTable = new LootTable().add('Chickaxe').add('Leia');

// Users get effectively 1 roll of this per 10 minutes
const DeliverRewardTable = new LootTable()
	.add(new LootTable(), 1, 15)
	// Easter eggs
	.add(1961)
	.add(7928)
	.add(7929)
	.add(7930)
	.add(7931)
	.add(7932)
	.add('Carrot', 1, 2)
	.add('Cake', 1, 2)
	.add('Chocolatey milk', 1, 2)
	.add('Chocolate kebbit', 1, 2)
	.add('Chocolate chunks', 1, 2)
	.add('Chocolate bar', 1, 2)
	.add('Box of chocolate strawberries')
	.tertiary(150, 'Decorative easter eggs')
	.tertiary(40, UniqueTable);

export const easterCommand: OSBMahojiCommand = {
	name: 'easter',
	description: 'The 2022 Easter Event command!.',
	attributes: {
		requiresMinion: true,
		categoryFlags: ['minion'],
		description: 'Allows you to do the 2022 Easter Event.'
	},
	options: [],
	run: async ({ userID }) => {
		const user = await client.fetchUser(userID.toString());
		if (user.minionIsBusy) return `${user.minionName} is busy.`;
		const eggsGivenOut = user.settings.get(UserSettings.EggsDelivered);
		const cl = user.cl();
		if (cl.has(UniqueTable.allItems)) {
			return "I don't have anything left to give you!";
		}

		if (eggsGivenOut > 0) {
			// Remove all their eggs, give a loot roll for each one they've delivered.
			await mahojiUserSettingsUpdate(client, user.id, {
				eggs_delivered: {
					decrement: eggsGivenOut
				}
			});
			let loot = DeliverRewardTable.roll(eggsGivenOut);

			// Can't get more than one of each unique.
			for (const item of UniqueTable.allItems) {
				if (!loot.has(item)) continue;
				if (cl.has(item)) {
					loot.remove(item, loot.amount(item));
				} else {
					// Make sure they're not getting more than 1 at once.
					loot.bank[item] = 1;
				}
			}

			await user.addItemsToBank({ items: loot, collectionLog: true });

			return {
				content: `You received ${loot}.`,
				attachments: [
					{
						fileName: 'image.jpg',
						buffer: await newChatHeadImage({
							content: 'Thank you for delivering eggs, please take these as a reward!',
							head: 'bunny'
						})
					}
				]
			};
		}

		if (user.bank().has('Easter egg crate') || user.cl().amount('Easter egg crate') >= 3) {
			return "You've already been given an Easter egg crate! Go hand them out!";
		}
		const loot = new Bank().add('Easter egg crate');

		const klasaUser = await client.fetchUser(userID);
		await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
		const buffer = await newChatHeadImage({
			content:
				'Player, please help me deliver these Easter eggs! Take them with you and hand them out. Come back after handing some out!',
			head: 'bunny'
		});

		return {
			content: `You received ${loot}.`,
			attachments: [{ fileName: 'image.jpg', buffer }]
		};
	}
};
