import { KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Events } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ArrayItemsResolved } from '../../types';

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
	if (Object.keys(itemsToAnnounce).length > 0) {
		let notif = '';

		if (team) {
			notif = `In **${team.leader.username}'s** party of ${team.size} minions killing ${
				Monsters.get(monsterID)!.name
			}, ${team.lootRecipient.username} just received **${loot}**!`;
		} else {
			notif = `**${user.username}'s** minion, ${user.minionName}, just received **${itemsToAnnounce}**, their ${
				Monsters.get(monsterID)!.name
			} KC is ${kc}!`;
		}

		user.client.emit(Events.ServerNotification, notif);
	}
}
