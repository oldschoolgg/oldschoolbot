import { Embed } from '@discordjs/builders';
import { ApplicationCommandOptionType, CommandRunOptions, ICommand } from 'mahoji';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { rand, toKMB, updateGPTrackSetting } from '../../lib/util';
import { mahojiParseNumber } from '../mahojiSettings';

export const command: ICommand = {
	name: 'dice',
	description: 'Allows you to dice some GP for a chance at doubling it up, or losing it all.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'amount',
			description: 'The amount you want to dice.',
			required: false
		}
	],
	run: async ({ member, options }: CommandRunOptions<{ amount?: string }>) => {
		const roll = rand(1, 100);
		const amount = mahojiParseNumber({ input: options.amount });

		const embed = new Embed().setTitle('Dice Roll').setThumbnail('https://i.imgur.com/sySQkSX.png');

		if (!amount) {
			embed.setDescription(`You rolled **${roll}** on the percentile dice.`);
		} else {
			const user = await client.fetchUser(member.user.id);
			if (user.isIronman) return "You're an ironman and you cant play dice.";

			if (amount > 500_000_000) {
				return 'You can only dice up to 500m at a time!';
			}

			if (amount < 1_000_000) {
				return 'You have to dice atleast 1,000,000.';
			}

			await user.settings.sync(true);
			const gp = user.settings.get(UserSettings.GP);
			if (amount > gp) return "You don't have enough GP.";
			const won = roll >= 55;
			let amountToAdd = won ? amount : -amount;

			await user.addGP(amountToAdd);
			updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceDice, amountToAdd);

			if (won) {
				const wins = user.settings.get(UserSettings.Stats.DiceWins);
				user.settings.update(UserSettings.Stats.DiceWins, wins + 1);
			} else {
				const losses = user.settings.get(UserSettings.Stats.DiceLosses);
				user.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
			}

			embed.setDescription(
				`${user.username} rolled **${roll}** on the percentile dice, and you ${won ? 'won' : 'lost'} ${toKMB(
					amountToAdd
				)} GP.`
			);
		}

		return { embeds: [embed] };
	}
};
