import { RANDOMIZER_HELP, type randomizationMethods, updateUsersRandomizerMap } from '../../../lib/randomizer';

export async function minionBuyCommand(user: MUser, method: (typeof randomizationMethods)[number]): Promise<string> {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date(),
		randomize_method: method.id
	});

	await updateUsersRandomizerMap(user, method);

	return RANDOMIZER_HELP(user);
}
