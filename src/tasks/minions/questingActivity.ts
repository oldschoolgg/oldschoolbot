import { KlasaMessage, KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';

import { QuestList } from '../../lib/data/QuestExports';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatSkillRequirements } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export async function completeUserQuestID(user: KlasaUser, questID: number) {
	const mainQuest = QuestList.find(q => q.id === questID);
	if (mainQuest) await user.addQP(mainQuest.rewards.qp);
	return user.settings.update(UserSettings.Quests, questID, {
		arrayAction: 'add'
	});
}

export default class extends Task {
	async run(data: QuestingActivityTaskOptions) {
		const { userID, channelID, questID } = data;
		const user = await this.client.users.fetch(userID);
		const quest = QuestList.find(q => q.id === questID)!;
		// xp
		if (quest.rewards?.xp) {
			for (const [skill, amount] of Object.entries(quest.rewards.xp)) {
				await user.addXP({ skillName: skill as SkillsEnum, amount });
			}
		}
		// items
		if (quest.rewards?.items) {
			await user.addItemsToBank(resolveBank(quest.rewards.items));
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
							const { itemsAdded } = await user.addItemsToBank(resolveBank(customReward[1]));
							customRewardString += new Bank(itemsAdded).toString();
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
		await completeUserQuestID(user, quest.id);
		const returnStr = `${user}, ${user.minionName} returned from its adventure, completing **${
			quest.name
		}**. You received the following rewards:\n${quest.rewards?.qp} QP (You now have ${user.settings.get(
			UserSettings.QP
		)} QP)${quest.rewards?.xp ? `\n${formatSkillRequirements(quest.rewards?.xp)}` : ''}${
			quest.rewards?.items ? `\n${new Bank(quest.rewards?.items)}` : ''
		}${customRewardString ? `\n${customRewardString}` : ''}${rewardToCollect ? `\n${rewardToCollect}` : ''}`;

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
