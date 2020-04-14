import { Task } from 'klasa';

import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { roll } from 'oldschooljs/dist/util/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';

import { UserSettings } from '../../lib/UserSettings';
import { Emoji, Time } from '../../lib/constants';
import { formatDuration } from '../../util';

export default class extends Task {
	async run({ quantity, userID, channelID }: AgilityActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const oldQuantity = user.settings.get(UserSettings.CurrentTime);
		await user.addBankStandingTime(quantity);
		const newQuantity = user.settings.get(UserSettings.CurrentTime);
		let str = `${user}, you now have spent ${formatDuration(
			newQuantity * Time.Minute
		)} of your life bankstanding`;
		if (oldQuantity < 100 && newQuantity >= 100) {
			str += `filthy casual ${Emoji.Bpaptu}`;
		}
		if (oldQuantity < 500 && newQuantity >= 500) {
			str += `\ncasual ${Emoji.Bpaptu}`;
		}

		if (oldQuantity < 1000 && newQuantity >= 1000) {
			str += `\nnerd ${Emoji.Bpaptu}`;
		}

		if (oldQuantity < 10_000 && newQuantity >= 10_000) {
			str += `\ncontemplate your life choices ${Emoji.Bpaptu}`;
		}

		if (oldQuantity < 100_000 && newQuantity >= 100_000) {
			str += `\nstop ${Emoji.Bpaptu}`;
		}

		// Roll for literally nothing
		if (roll(69)) {
			str += `\nNice. ${Emoji.Bpaptu}`;
		}
		if (roll(73)) {
			str += `\n73737373773737373737377373737377373737373 ${Emoji.Bpaptu}`;
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
		});
	}
}
