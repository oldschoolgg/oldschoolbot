import { Task, KlasaMessage } from 'klasa';
import { saidYes, noOp, rand } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Hunter from '../../lib/skills/hunter';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ creatureID, quantity, userID, channelID }: HunterActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Hunter);

		const Creature = Hunter.Creatures.find(Creature => Creature.id === creatureID);

		if (!Creature) return;

		const xpReceived = quantity * Creature.xp;

		await user.addXP(SkillsEnum.Hunter, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Hunter);

		let str = `${user}, ${user.minionName} finished hunting ${quantity} ${
			Creature.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Hunter level is now ${newLevel}!`;
		}

		const loot: { [key: string]: number } = {};

		Creature.drops?.forEach(drop => (loot[itemID(drop.toString())] = quantity));

		// Roll for pet at 1.5x chance
		if (Creature.petChance && rand(1, Creature.petChance * 1.5) < quantity) {
			loot[itemID('Baby chinchompa')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

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
						user.log(`continued trip of ${quantity}x ${Creature.name}[${Creature.id}]`);
						this.client.commands
							.get('hunt')!
							.run(response as KlasaMessage, [quantity, Creature.name]);
					}
				})
				.catch(noOp);
		});
	}
}
