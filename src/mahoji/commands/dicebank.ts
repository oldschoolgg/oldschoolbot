import { randInt } from 'e';
import { CommandRunOptions } from 'mahoji';

import { mentionCommand } from '../../lib/commandMention';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { OSBMahojiCommand } from '../lib/util';

export const diceBankCommand: OSBMahojiCommand = {
	name: 'dicebank',
	description: 'Gamble your entire bank.',
	options: [],
	run: async ({ userID, interaction }: CommandRunOptions<{ name: string }>) => {
		const user = await mUserFetch(userID);
		if (user.user.has_been_migrated || user.bank.length === 0) {
			return 'You have already gambled your bank, or you have no items in your bank.';
		}

		await handleMahojiConfirmation(
			interaction,
			'Are you sure you want to gamble your ENTIRE bank? You will lose *everything* if you lose. If you win, you will receive double back. (Disclaimer: you will not be rolled back or given your items back, consider becoming an ironman if you lose)'
		);

		await user.update({
			has_been_migrated: true
		});

		return {
			content: `You rolled a dice and received... ${randInt(
				0,
				55
			)}! You lose. You have lost your **entire** bank. ${mentionCommand('bank')}`
		};
	}
};
