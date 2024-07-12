import { type CommandResponse, isAtleastThisOld } from '@oldschoolgg/toolkit';
import { ComponentType, type User } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { mahojiInformationalButtons } from '../../../lib/constants';
import { clArrayUpdate } from '../../../lib/handleNewCLItems';

export async function minionBuyCommand(apiUser: User, user: MUser, ironman: boolean): CommandResponse {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date(),
		minion_ironman: Boolean(ironman)
	});

	const starter = isAtleastThisOld(apiUser.createdAt, Time.Year * 2)
		? new Bank({
				Shark: 300,
				'Saradomin brew(4)': 50,
				'Super restore(4)': 20,
				'Anti-dragon shield': 1,
				'Tiny lamp': 5,
				'Small lamp': 2,
				'Tradeable mystery box': 5,
				'Untradeable Mystery box': 5,
				'Dragon bones': 50,
				Coins: 50_000_000,
				'Clue scroll (beginner)': 10,
				'Equippable mystery box': 1,
				'Pet Mystery box': 1
			})
		: null;

	if (starter) {
		await user.addItemsToBank({ items: starter, collectionLog: false });
	}
	// Ensure user has a userStats row
	await clArrayUpdate(user, user.cl);

	return {
		content: `You have successfully got yourself a minion, and you're ready to use the bot now! Please check out the links below for information you should read.

<:ironman:626647335900020746> You can make your new minion an Ironman by using the command: \`/minion ironman\`.

🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a permanent ban - and "I didn't know the rules" is not a valid excuse, read them here: <https://wiki.oldschool.gg/rules>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

<:BSO:863823820435619890> **BSO:** I run a 2nd bot called BSO (Bot School Old), which you can also play, it has lots of fun and unique changes, like 5x XP and infinitely stacking clues. Type \`/help\` for more information.

Please click the buttons below for important links.

${starter !== null ? `**You received these starter items:** ${starter}.` : ''}`,
		components: [
			{
				type: ComponentType.ActionRow,
				components: mahojiInformationalButtons
			}
		]
	};
}
