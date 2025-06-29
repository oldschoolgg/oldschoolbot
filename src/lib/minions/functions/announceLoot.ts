import type { Bank } from 'oldschooljs';

import { Events } from '@oldschoolgg/toolkit/constants';
import type { ArrayItemsResolved } from 'oldschooljs/dist/util/util';
import { minionName } from '../../util/minionUtils';
import { effectiveMonsters } from '../data/killableMonsters';

export default async function announceLoot({
	user,
	monsterID,
	notifyDrops: _notifyDrops,
	loot,
	team
}: {
	user: MUser;
	monsterID: number;
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
		const monsterName = effectiveMonsters.find(m => m.id === monsterID)?.name;
		const kc = await recipient.getKC(monsterID);

		if (team && team.size > 1) {
			notif += `In ${team.leader.badgedUsername}'s party of ${team.size} minions killing ${monsterName}, `;
		}

		notif += `**${recipient.badgedUsername}'s** minion, ${minionName(
			recipient
		)}, just received **${itemsToAnnounce}**, their ${monsterName} KC is ${kc.toLocaleString()}!`;

		globalClient.emit(Events.ServerNotification, notif);
	}
}
