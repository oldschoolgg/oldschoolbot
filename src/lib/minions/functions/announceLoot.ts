import { Events } from '@oldschoolgg/toolkit';
import type { ArrayItemsResolved, Bank } from 'oldschooljs';

import { effectiveMonsters } from '@/lib/minions/data/killableMonsters/index.js';

export default async function announceLoot({
	user,
	monsterID,
	monsterName: _monsterName,
	progress,
	notifyDrops: _notifyDrops,
	loot,
	team
}: {
	user: MUser;
	monsterID: number;
	monsterName?: string;
	progress?: {
		name: string;
		value: number;
	};
	notifyDrops?: number[] | ArrayItemsResolved;
	loot: Bank;
	team?: { leader: MUser; lootRecipient: MUser; size: number };
}) {
	if (!_notifyDrops) return;
	const notifyDrops = _notifyDrops.flat(Number.POSITIVE_INFINITY);
	const itemsToAnnounce = loot.clone().filter(i => notifyDrops.includes(i.id));
	if (itemsToAnnounce.length > 0) {
		const recipient = team && team.size > 1 ? team.lootRecipient : user;
		let notif = '';
		const monsterName = _monsterName ?? effectiveMonsters.find(m => m.id === monsterID)?.name;
		const progressText = progress
			? `${progress.name} is ${progress.value.toLocaleString()}`
			: `${monsterName ?? 'Unknown monster'} KC is ${(await recipient.getKC(monsterID)).toLocaleString()}`;

		if (team && team.size > 1) {
			notif += `In ${team.leader.badgedUsername}'s party of ${team.size} minions killing ${monsterName ?? 'an unknown monster'}, `;
		}

		notif += `**${recipient.badgedUsername}'s** minion, ${recipient.minionName}, just received **${itemsToAnnounce}**, their ${progressText}!`;

		globalClient.emit(Events.ServerNotification, notif);
	}
}
