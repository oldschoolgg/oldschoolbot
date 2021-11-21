import { KlasaMessage } from 'klasa';

import { prisma } from '../../settings/prisma';
import { UserSettings } from '../../settings/types/UserSettings';

export async function becomeIronman(msg: KlasaMessage) {
	/**
	 * If the user is an ironman already, lets ask them if they want to de-iron.
	 */
	if (msg.author.isIronman) {
		return msg.channel.send("You're already an ironman.");
	}

	if (msg.author.minionIsBusy) {
		return msg.channel.send('Your minion is still on a trip.');
	}

	const existingGiveaways = await prisma.giveaway.findMany({
		where: {
			user_id: msg.author.id,
			completed: false
		}
	});

	if (existingGiveaways.length !== 0) {
		return msg.channel.send("You can't become an ironman because you have active giveaways.");
	}

	await msg.channel.send(
		`Are you sure you want to start over and play as an ironman?
:warning: **Read the following text before confirming. This is your only warning. ** :warning:
The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.
After becoming an ironman:
	- You will no longer be able to receive GP from  \`=daily\`
	- You will no longer be able to use \`=pay\`, \`=duel\`, \`=sellto\`, \`=sell\`, \`=dice\`, \`=gri\`
	- You **cannot** de-iron, it is PERMANENT.
    - Your entire BSO account, EVERYTHING, will be reset.
Type \`confirm permanent ironman\` if you understand the above information, and want to become an ironman now.`
	);

	try {
		await msg.channel.awaitMessages({
			max: 1,
			time: 15_000,
			errors: ['time'],
			filter: answer => answer.author.id === msg.author.id && answer.content === 'confirm permanent ironman'
		});

		msg.author.log(`just became an ironman, previous settings: ${JSON.stringify(msg.author.settings.toJSON())}`);

		await msg.author.settings.reset();

		try {
			await prisma.slayerTask.deleteMany({ where: { user_id: msg.author.id } });
			await prisma.playerOwnedHouse.delete({ where: { user_id: msg.author.id } });
			await prisma.minigame.delete({ where: { user_id: msg.author.id } });
			await prisma.xPGain.deleteMany({ where: { user_id: msg.author.id } });
			await prisma.newUser.delete({ where: { id: msg.author.id } });
			await prisma.activity.deleteMany({ where: { user_id: msg.author.id } });

			await prisma.tameActivity.delete({ where: { id: msg.author.id } });
			await prisma.tame.deleteMany({ where: { user_id: msg.author.id } });
		} catch (err) {
			console.log(err);
		}

		await msg.author.settings.update([
			[UserSettings.Minion.Ironman, true],
			[UserSettings.Minion.HasBought, true]
		]);
		return msg.channel.send('You are now an ironman.');
	} catch (err) {
		return msg.channel.send('Cancelled ironman swap.');
	}
}
