import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { Task } from 'klasa';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SoulWarsOptions } from '../../../lib/types/minions';
import { noOp, roll } from '../../../lib/util';
import { sendToChannelID } from '../../../lib/util/webhook';

function calcPoints() {
	let base = 42.5;
	if (roll(5)) {
		base = 30;
	}
	if (roll(15)) {
		base = 10;
	}
	if (roll(2)) {
		base = increaseNumByPercent(base, 20);
	} else {
		base = reduceNumByPercent(base, 20);
	}
	return Math.ceil(base);
}

export default class extends Task {
	async run({ channelID, leader, users, quantity }: SoulWarsOptions) {
		const leaderUser = await this.client.users.fetch(leader);
		let str = `${leaderUser}, your party finished doing ${quantity}x games of Soul Wars.\n\n`;

		for (const id of users) {
			const user = await this.client.users.fetch(id).catch(noOp);
			if (!user) continue;

			let points = 0;
			for (let i = 0; i < quantity; i++) {
				points += calcPoints();
			}

			if (user.usingPet('Flappy')) {
				points *= 2;
			}

			await user.settings.update(
				UserSettings.ZealTokens,
				user.settings.get(UserSettings.ZealTokens) + points
			);

			user.incrementMinigameScore('SoulWars', quantity);
			str += `${user} received ${points}x Zeal Tokens.`;
		}

		sendToChannelID(this.client, channelID, { content: str });
	}
}
