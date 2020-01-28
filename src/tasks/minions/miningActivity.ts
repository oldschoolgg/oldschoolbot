import { Task } from 'klasa';
import { SkillsEnum, MiningActivityTaskOptions } from '../../lib/types';
import Skills from '../../lib/skills';
import { TextChannel, DMChannel, MessageAttachment } from 'discord.js';
import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { KlasaMessage } from 'klasa';

const Mining = Skills.get(SkillsEnum.Mining);

export default class extends Task {
	async run({ oreID, quantity, userID, channelID }: MiningActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);

		const ore = Mining!.Ores.find(ore => ore.id === oreID);

		if (!ore) return;

		user.addXP(SkillsEnum.Mining, quantity * ore.xp);

		let str = `${user}, ${getMinionName(user)} finished killing ${quantity} ${
			monster.name
		}.  ${getMinionName(user)} asks if you'd like them to do another trip of ${quantity} ${
			monster.name
		}.`;

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str, new MessageAttachment(image));

		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					user.log(` continued trip of ${quantity}x ${monster.name}[${monster.id}]`);
					this.client.commands
						.get('minion')!
						.kill(response as KlasaMessage, [quantity, monster.name]);
				}
			})
			.catch(noOp);
	}
}
