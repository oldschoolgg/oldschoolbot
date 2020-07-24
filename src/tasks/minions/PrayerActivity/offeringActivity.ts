import { KlasaMessage, Task } from 'klasa';

import { noOp, rand, roll, saidYes } from '../../../lib/util';
import { Time } from '../../../lib/constants';
import { OfferingActivityTaskOptions } from '../../../lib/types/minions';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import Prayer from '../../../lib/skilling/skills/prayer';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../../lib/skilling/types';

export default class extends Task {
	async run({ boneID, quantity, userID, channelID, duration }: OfferingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Prayer);

		const bone = Prayer.Bones.find(bone => bone.inputId === boneID);

		const XPMod = 3.5;
		let bonesLost = 0;
		if (!bone) return;

		// make it so you can't lose more bones then you bring
		let maxPK = quantity;
		if (quantity >= 27) {
			maxPK = 27;
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
			bonesLost += rand(1, maxPK);
		}
		const bonesSaved = Math.floor(quantity * (rand(90, 110) / 100));
		const newQuantity = quantity - bonesLost + bonesSaved;

		const xpReceived = newQuantity * bone.xp * XPMod;

		await user.addXP(SkillsEnum.Prayer, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Prayer);

		let str = `${user}, ${user.minionName} finished offering ${newQuantity} ${
			bone.name
		}, you managed to offer ${bonesSaved} extra bones because of the effects the Chaos altar and you lost ${bonesLost} to pkers ,
			you also received ${xpReceived.toLocaleString()} XP. ${
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
						user.log(`continued trip of ${quantity}x ${bone.name}[${bone.inputId}]`);
						this.client.commands
							.get('offer')!
							.run(response as KlasaMessage, [quantity, bone.name]);
					}
				})
				.catch(noOp);
		});
	}
}
