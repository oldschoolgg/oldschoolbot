import { RANDOMIZER_HELP } from '../../../lib/constants';
import { updateUsersRandomizerMap } from '../../../lib/randomizer';

export async function minionBuyCommand(user: MUser): Promise<string> {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date()
	});

	await updateUsersRandomizerMap(user);

	return RANDOMIZER_HELP;
}
