import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, rand, roll } from '../../lib/util';
import { Time } from '../../lib/constants';
import { PrayerActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Prayer from '../../lib/skilling/skills/prayer';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../lib/skilling/types';

export default class extends Task {
	async run({ boneID, quantity, userID, channelID, chaos }: PrayerActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const Bury = Prayer.Bones.find(Bury => Bury.inputId === boneID);

		let pk = ``;
		let offer = `burying`;
		let xpmod = 1;
		let bonesLost = 0;
		let bonesSaved = 0;
		let newQuantity = quantity;
		if (!Bury) return;

		if (chaos === true) {
			offer = `offering`;
			xpmod = 3.5;

			// make it so you can't lose more bones then you bring
			let maxpk = quantity;
			if (quantity >= 27) {
				maxpk = 27;
			}

			const trips = Math.ceil(quantity / 27);
			let deathCounter = 0;
			// roll a 10% chance to get pked per trip
			for (let i = 0; i < trips; i++) {
				if (roll(10)) {
					deathCounter++;
				}
			}
			// calc how many bones are lost
			for (let i = 0; i < deathCounter; i++) {
				bonesLost += rand(1, maxpk);
			}
			bonesSaved = quantity * rand(.9,1.1);
			newQuantity = quantity - bonesLost + bonesSaved;
			pk = `you saved ${bonesSaved} by using the Chaos altar and you lost ${bonesLost} to pkers ,`;
		}

		const xpReceived = newQuantity * Bury.xp * xpmod;

		await user.addXP(SkillsEnum.Prayer, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished ${offer} ${newQuantity} ${
			Bury.name
		}, ${pk} you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Prayer level is now ${newLevel}!`;
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;
						user.log(`continued trip of ${quantity}x ${Bury.name}[${Bury.inputId}]`);
						this.client.commands
							.get('bury')!
							.run(response as KlasaMessage, [quantity, Bury.name]);
					}
				})
				.catch(noOp);
		});
	}
}
