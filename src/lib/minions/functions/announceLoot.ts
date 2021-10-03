import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ArrayItemsResolved } from '../../types';
import { effectiveMonsters } from '../data/killableMonsters';

export default async function announceLoot({
	user,
	monsterID,
	notifyDrops: _notifyDrops,
	loot,
	team
}: {
	user: KlasaUser;
	monsterID: number;
	notifyDrops?: number[] | ArrayItemsResolved;
	loot: Bank;
	team?: { leader: KlasaUser; lootRecipient: KlasaUser; size: number };
}) {
	if (!_notifyDrops) return;
	const notifyDrops = _notifyDrops.flat(Infinity);
	const kc = user.settings.get(UserSettings.MonsterScores)[monsterID] ?? 0;
	const itemsToAnnounce = loot.clone().filter(i => notifyDrops.includes(i.id));
	if (itemsToAnnounce.length > 0) {
		let notif = '';

		if (team && team.size > 1) {
			notif = `In ${team.leader.username}'s party of ${team.size} minions killing ${
				effectiveMonsters.find(m => m.id === monsterID)!.name
			}, **${team.lootRecipient.username}** just received **${itemsToAnnounce}**!`;
		} else {
			notif = `**${user.username}'s** minion, ${user.minionName}, just received **${itemsToAnnounce}**, their ${
				effectiveMonsters.find(m => m.id === monsterID)!.name
			} KC is ${kc.toLocaleString()}!`;
		}

		user.client.emit(Events.ServerNotification, notif);
	}
}
