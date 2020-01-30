import { Task, KlasaMessage } from 'klasa';
import { TextChannel, DMChannel } from 'discord.js';
import { Items } from 'oldschooljs';

import { saidYes, noOp, rand } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum, MiningActivityTaskOptions } from '../../lib/types';
import Skills from '../../lib/skills';

const Mining = Skills.get(SkillsEnum.Mining);
const MiningPet = Items.get('Rock golem');

export default class extends Task {
	async run({ oreID, quantity, userID, channelID }: MiningActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);

		const ore = Mining!.Ores.find(ore => ore.id === oreID);

		if (!ore) return;

		const xpReceived = quantity * ore.xp;

		const loot = { [ore.id]: quantity };

		if (ore.petChance && rand(1, ore.petChance) < quantity) {
			loot[MiningPet!.id] = 1;
		}

		const currentLevel = user.skillLevel(SkillsEnum.Mining);
		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);
		await user.addItemsToBank(loot);

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${
			ore.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip..`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Mining level is now ${newLevel}!`;
		}

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str);

		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					user.log(`continued trip of ${quantity}x ${ore.name}[${ore.id}]`);
					this.client.commands
						.get('mine')!
						.run(response as KlasaMessage, [quantity, ore.name]);
				}
			})
			.catch(noOp);
	}
}
