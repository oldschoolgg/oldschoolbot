import { Task, KlasaMessage } from 'klasa';
import { TextChannel, DMChannel } from 'discord.js';
import { Items } from 'oldschooljs';

import { saidYes, noOp, rand } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { roll } from 'oldschooljs/dist/util/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Mining from '../../lib/skills/mining';

const MiningPet = Items.get('Rock golem');

export default class extends Task {
	async run({ oreID, quantity, userID, channelID, duration }: MiningActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Mining);

		const ore = Mining.Ores.find(ore => ore.id === oreID);

		if (!ore) return;

		const xpReceived = quantity * ore.xp;

		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${
			ore.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Mining level is now ${newLevel}!`;
		}

		const loot = {
			[ore.id]: quantity
		};

		// Roll for pet at 1.5x chance
		if (ore.petChance && rand(1, ore.petChance * 1.5) < quantity) {
			loot[MiningPet!.id] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
		}

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.nuggets) {
			const numberOfNuggets = rand(0, Math.floor(numberOfMinutes / 4));
			loot[12012] = numberOfNuggets;
		} else if (numberOfMinutes > 10 && ore.minerals) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot[21341] = numberOfMinerals;
			}
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str);

		user.toggleBusy(true);
		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
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
			.catch(noOp)
			.finally(() => user.toggleBusy(false));
	}
}
