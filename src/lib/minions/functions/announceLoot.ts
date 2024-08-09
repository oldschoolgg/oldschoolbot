import type { Bank } from 'oldschooljs';

import type { ArrayItemsResolved } from 'oldschooljs/dist/util/util';
import { Events } from '../../constants';
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
		let notif = '';

		if (team && team.size > 1) {
			notif = `In ${team.leader.badgedUsername}'s party of ${team.size} minions killing ${
				effectiveMonsters.find(m => m.id === monsterID)?.name
			}, **${team.lootRecipient.badgedUsername}** just received **${itemsToAnnounce}**!`;
		} else {
			const kc = await user.getKC(monsterID);
			notif = `**${user.badgedUsername}'s** minion, ${minionName(
				user
			)}, just received **${itemsToAnnounce}**, their ${
				effectiveMonsters.find(m => m.id === monsterID)?.name
			} KC is ${kc.toLocaleString()}!`;
		}

		globalClient.emit(Events.ServerNotification, notif);
	}
}
