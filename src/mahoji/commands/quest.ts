import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { type EQuest, Quests } from 'oldschooljs';
import { doQuest, getQuestInfo } from '../lib/abstracted_commands/questCommand';
import type { OSBMahojiCommand } from '../lib/util';
export const questCommand: OSBMahojiCommand = {
	name: 'quest',
	description: 'Send your minion to do quests, view quest info, or claim completed quests up to your QP.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the quest.',
			required: false,
			autocomplete: async (value: string, user) => {
				const mUser = await mUserFetch(user.id);
				const search = value?.toLowerCase() ?? '';
				return Quests.filter(
					q => q.name.toLowerCase().includes(search) && !mUser.hasCompletedQuest(q.id as EQuest)
				)
					.sort((a, b) => a.id - b.id)
					.map(q => ({ name: q.name, value: q.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'info',
			description: 'Show info about the quest instead of starting it.',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'claim',
			description: 'Automatically mark quests as completed up to your legacy QP.',
			required: false
		}
	],
	run: async ({
		options,
		channelID,
		userID
	}: CommandRunOptions<{
		name?: string;
		info?: boolean;
		claim?: boolean;
	}>) => {
		const user = await mUserFetch(userID);
		if (options.claim) {
			const legacyQP = user.user.QP ?? 0;
			const sortedQuests = Quests.sort((a, b) => a.id - b.id);

			let totalQP = 0;
			const questsToComplete: number[] = [];
			const questNames: string[] = [];
			for (const quest of sortedQuests) {
				if (totalQP + (quest.qp ?? 0) > legacyQP) break;
				if (!user.hasCompletedQuest(quest.id as any)) {
					questsToComplete.push(quest.id);
					questNames.push(quest.name);
				}
				totalQP += quest.qp ?? 0;
			}

			if (questsToComplete.length === 0) {
				return 'No quests to claim based on your legacy QP.';
			}

			await user.update({
				finished_quest_ids: {
					push: questsToComplete
				}
			});

			const shownQuests = questNames.slice(0, 10).join(', ');
			const moreCount = questNames.length > 10 ? questNames.length - 10 : 0;
			return `Claimed ${questsToComplete.length} quests up to your legacy QP (${legacyQP}): ${shownQuests}${moreCount > 0 ? `, and ${moreCount} more.` : ''}`;
		}
		if (options.info) {
			if (!options.name) {
				return 'Input a valid quest name.';
			}
			return getQuestInfo(user, options.name);
		}
		return doQuest(user, channelID, options.name);
	}
};
