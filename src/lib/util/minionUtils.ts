import { perTimeUnitChance } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';
import type { Bank } from 'oldschooljs';

import { QuestID } from '@/lib/minions/data/quests.js';

export function rollForMoonKeyHalf({ user, duration, loot }: { user: MUser | boolean; duration: number; loot: Bank }) {
	if (typeof user === 'boolean' && !user) return;
	if (typeof user !== 'boolean' && !user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) return;
	perTimeUnitChance(duration, 1, Time.Minute * 60, () => {
		loot.add('Loop half of key (moon key)');
	});
}
