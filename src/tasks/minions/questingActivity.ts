import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';

import { MAXQP, QuestList } from '../../lib/data/QuestExports';
import { SkillsEnum } from '../../lib/skilling/types';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatSkillRequirements } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: QuestingActivityTaskOptions) {
		const { userID, channelID, questID } = data;
		const user = await this.client.fetchUser(userID);
		const quest = QuestList.find(q => q.id === questID)!;
		const rewardBank = new Bank();
		// xp
		if (quest.rewards?.xp) {
			for (const [skill, amount] of Object.entries(quest.rewards.xp)) {
				await user.addXP({ skillName: skill as SkillsEnum, amount });
			}
		}
		// items
		if (quest.rewards?.items) {
			rewardBank.add(resolveBank(quest.rewards.items));
		}
		// Custom reward
		let customRewardString = '';
		let rewardToCollect = '';
		if (quest.rewards.customLogic) {
			for (const reward of quest.rewards.customLogic) {
				if (reward.type === 'direct_reward') {
					const customReward = reward.function();
					switch (customReward[0]) {
						case 'xp': {
							for (const [skill, amount] of Object.entries(customReward[1])) {
								await user.addXP({ skillName: skill as SkillsEnum, amount });
							}
							customRewardString += formatSkillRequirements(customReward[1]);
							break;
						}
						case 'item': {
							const itensAdded = resolveBank(customReward[1]);
							rewardBank.add(itensAdded);
							customRewardString += new Bank(itensAdded).toString();
							break;
						}
					}
				} else if (reward.type === 'collect_reward') {
					rewardToCollect += `You can collect another reward doing \`?q collect ${quest.name.toLowerCase()} ${
						reward.id
					}\`\n`;
				}
			}
		}

		if (rewardBank.items().length > 0) {
			await user.addItemsToBank(rewardBank, true);
		}

		await user.completeQuest(quest.id);
		const userQP = user.getQP();
		let returnStr = `${user}, ${user.minionName} returned from its adventure, completing ${
			!quest.name.toLowerCase().startsWith('the') ? 'the ' : ''
		}**${quest.name}**. You received the following rewards:\n${
			quest.rewards?.qp
		} QP (You now have ${userQP.toLocaleString()} QP)${
			quest.rewards?.xp ? `\n${formatSkillRequirements(quest.rewards?.xp)}` : ''
		}${quest.rewards?.items ? `\n${new Bank(quest.rewards?.items)}` : ''}${
			customRewardString ? `\n${customRewardString}` : ''
		}${rewardToCollect ? `\n${rewardToCollect}` : ''}`;

		if (userQP === MAXQP) {
			returnStr +=
				'\nYou have done all the quests! 🎉 Congratulations! You are now ellegible to buy a **Quest point cape**!';
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			returnStr,
			res => {
				user.log('continued trip of Questing.');
				return this.client.commands.get('quest')!.run(res as KlasaMessage, []);
			},
			undefined,
			data,
			null
		);
	}
}
