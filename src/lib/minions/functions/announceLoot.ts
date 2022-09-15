import { userMention } from '@discordjs/builders';
import { Bank } from 'oldschooljs';

import { Events, usernameCache } from '../../constants';
import { ArrayItemsResolved } from '../../types';
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
	const notifyDrops = _notifyDrops.flat(Infinity);
	const kc = user.getKC(monsterID);
	const itemsToAnnounce = loot.clone().filter(i => notifyDrops.includes(i.id));
	if (itemsToAnnounce.length > 0) {
		let notif = '';

		if (team && team.size > 1) {
			notif = `In ${team.leader.usernameOrMention}'s party of ${team.size} minions killing ${
				effectiveMonsters.find(m => m.id === monsterID)!.name
			}, **${team.lootRecipient.usernameOrMention}** just received **${itemsToAnnounce}**!`;
		} else {
			const username = usernameCache.get(user.id);

			notif = `**${username ?? userMention(user.id)}'s** minion, ${minionName(
				user
			)}, just received **${itemsToAnnounce}**, their ${
				effectiveMonsters.find(m => m.id === monsterID)!.name
			} KC is ${kc.toLocaleString()}!`;
		}

		globalClient.emit(Events.ServerNotification, notif);
	}
}
