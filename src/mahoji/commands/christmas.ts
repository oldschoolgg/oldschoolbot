import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { christmasEventReward } from '../../lib/christmasEvent';
import { OSBMahojiCommand } from '../lib/util';
import { userStatsUpdate } from '../mahojiSettings';

const snowBallsPerSnowMan = 100;

export const christmasCommand: OSBMahojiCommand = {
	name: 'christmas',
	description: 'The 2022 Christmas Event.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'help_and_stats',
			description: 'Receive help with the event, and see your stats!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hand_in',
			description: 'Create snowmen and hand them in!'
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ hand_in?: {} }>) => {
		const user = await mUserFetch(userID);
		const snowballsOwned = user.bank.amount('Snowball');
		if (options.hand_in) {
			if (!snowballsOwned) return 'You have no snowballs to make snowmen out of! Do some trips to get some.';
			if (snowballsOwned < snowBallsPerSnowMan) {
				return `You don't have enough snowballs to make a snowman, you need atleast ${snowBallsPerSnowMan}.`;
			}
			const snowMenToBuild = Math.max(1, Math.floor(snowballsOwned / snowBallsPerSnowMan));
			const cost = new Bank().add('Snowball', snowMenToBuild * snowBallsPerSnowMan);
			await user.removeItemsFromBank(cost);
			await userStatsUpdate(user.id, () => ({
				snowmen_built: {
					increment: snowMenToBuild
				}
			}));
			const loot = christmasEventReward(user, snowMenToBuild);
			await user.addItemsToBank({ items: loot, collectionLog: true });
			return `You used ${cost} to build ${snowMenToBuild}x Snowmen! As a reward, you received... ${loot}.`;
		}

		const stats = await user.fetchStats();
		return `**Christmas Event 2022**

**Help**
1. Do trips until you get a Christmas snowglobe!
2. Keep doing trips with the snowglobe, to collect snow!
3. Once you have enough snow, do \`/christmas hand_in\` to build snowmen and hand them in for rewards!

Repeat 2 and 3 for as long as you want!

**Stats**
You have built... ${stats.snowmen_built}x Snowmen
You have ${user.bank.amount('Snowball')}x Snowballs in your bank`;
	}
};
