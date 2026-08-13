import { QuestID } from '@/lib/minions/data/quests.js';

interface SailingXPUser {
	minionName?: string;
	user: {
		finished_quest_ids?: QuestID[] | null;
	};
}

export function canGainSailingXP(user: SailingXPUser): boolean {
	return user.user.finished_quest_ids?.includes(QuestID.Pandemonium) ?? false;
}

export function sailingXPUnlockMessage(user: SailingXPUser): string {
	return `${user.minionName ?? 'Your minion'} needs to have completed the Pandemonium quest to gain Sailing XP.`;
}
