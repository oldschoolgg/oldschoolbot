import { Task } from 'klasa';

import { ShotputRoomActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { noOp, rand, roll } from '../../../lib/util';

export default class extends Task {
	async run({shotputID, userID, channelID, quantity, duration }: ShotputRoomActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		let failedShot = 0;
		let tokens = 0;

		if (shotputID === 'light') {
			for (let i = 0; i < quantity; i++) {
				if(roll(20)) {
					failedShot++;
					continue;
				}
				tokens += rand(1, 20) + 1;
			}
		}
		else {
			for (let i = 0; i < quantity; i++) {
				if(roll(15)) {
					failedShot++;
					continue;
				}
				tokens += rand(1, 20) + 3;
			}
		}
		const str = `You finished throwing ${quantity}x shot puts, You failed ${failedShot} shot puts and recieved a total of ${tokens}x Warrior guild tokens.`;
		const loot = {
			[8851]: tokens
		};

		await user.addItemsToBank(loot, true);
		
		//TODO: Run energy in future?

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
