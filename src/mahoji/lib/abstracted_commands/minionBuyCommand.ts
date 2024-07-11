import { clArrayUpdate } from '../../../lib/handleNewCLItems';
import { updateUsersRandomizerMap } from '../../../lib/randomizer';

export async function minionBuyCommand(user: MUser): Promise<string> {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date()
	});

	await updateUsersRandomizerMap(user);

	await clArrayUpdate(user, user.cl);

	return `You have successfully got yourself a minion, and you're ready to use the bot now! Please check out the links below for information you should read.

TODO fill this out later with info`;
}
