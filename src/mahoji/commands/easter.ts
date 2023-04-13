import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { mahojiChatHead } from '../../lib/util/chatHeadImage';
import { formatDuration } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

function bunnyMsg(msg: string) {
	return mahojiChatHead({
		content: msg,
		head: 'bunny'
	});
}

export const everyEasterReward = new Bank()
	.add('Chicken head')
	.add('Chicken wings')
	.add('Chicken legs')
	.add('Chicken feet')
	.add('Easter egg')
	.add('Bunny ears')
	.add('Rubber chicken')
	.add('Easter ring')
	.add('Easter basket')
	.add('Bunny feet')
	.add('Bunny top')
	.add('Bunny legs')
	.add('Bunny paws')
	.add('Easter egg helm')
	.add('Eggshell platebody')
	.add('Eggshell platelegs')
	.add('Chaotic handegg')
	.add('Holy handegg')
	.add('Peaceful handegg')
	.add('Bunnyman mask')
	.add('Giant easter egg')
	.add('Carrot sword')
	.add('Magic egg ball')
	.add("'24-carat' sword")
	.add('Propeller hat')
	.add("Gregg's eastdoor")
	.add('Pastel flowers')
	.add('Easter hat')
	.add('Crate ring')
	.freeze();

export const easterCommand: OSBMahojiCommand = {
	name: 'easter',
	description: 'The 2023 Easter Event!',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Start the event!'
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		start?: {};
	}>) => {
		const user = await mUserFetch(userID);
		const itemsNotOwned = everyEasterReward.clone().remove(user.isIronman ? user.allItemsOwned : user.cl);
		const ownedStr =
			itemsNotOwned.length === 0
				? 'You own all the Easter Event items! '
				: `You have ${itemsNotOwned.length} items left to obtain. Do more Easter Event trips!`;
		if (options.start) {
			if (itemsNotOwned.length === 0) {
				return bunnyMsg('You already own every possible reward!');
			}

			const duration = Time.Minute * 5;
			await addSubTaskToActivityTask({
				userID: user.id,
				channelID,
				duration,
				type: 'Easter'
			});

			return `${user.minionName} is now doing the Easter Event! It'll take around ${formatDuration(
				duration
			)} to finish.`;
		}

		return ownedStr;
	}
};
