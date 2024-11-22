import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { ComponentType } from 'discord.js';

import { mahojiInformationalButtons } from '../../../lib/sharedComponents';

export async function minionBuyCommand(user: MUser, ironman: boolean): CommandResponse {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date(),
		minion_ironman: Boolean(ironman)
	});

	// Ensure user has a userStats row
	await prisma.userStats.upsert({
		where: {
			user_id: BigInt(user.id)
		},
		create: {
			user_id: BigInt(user.id)
		},
		update: {}
	});

	return {
		content: `You have successfully got yourself a minion, and you're ready to use the bot now! Please check out the links below for information you should read.

<:ironman:626647335900020746> You can make your new minion an Ironman by using the command: \`/minion ironman\`.

🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a permanent ban - and "I didn't know the rules" is not a valid excuse, read them here: <https://wiki.oldschool.gg/getting-started/rules/>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

<:BSO:863823820435619890> **BSO:** I run a 2nd bot called BSO (Bot School Old), which you can also play, it has lots of fun and unique changes, like 5x XP and infinitely stacking clues. Type \`/help\` for more information.

Please click the buttons below for important links.`,
		components: [
			{
				type: ComponentType.ActionRow,
				components: mahojiInformationalButtons
			}
		]
	};
}
