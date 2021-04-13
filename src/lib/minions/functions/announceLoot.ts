import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';
import { KillableMonster } from '../types';

export default async function announceLoot(
	client: KlasaClient,
	user: KlasaUser,
	monster: KillableMonster,
	loot: ItemBank,
	team?: { leader: KlasaUser; lootRecipient: KlasaUser; size: number }
) {
	if (!monster.notifyDrops) return;
	const kc = user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0;
	const items = new Bank(loot).filter(i => monster.notifyDrops?.includes(i.id) ?? false);

	if (items.length > 0) {
		let notif = '';

		if (team) {
			notif = `In **${team.leader.username}'s** party of ${team.size} minions killing ${monster.name}, ${team.lootRecipient.username} just received **${items}**!`;
		} else {
			notif = `**${user.username}'s** minion, ${user.minionName}, just received **${items}**, their ${monster.name} KC is ${kc}!`;
		}

		client.emit(Events.ServerNotification, notif);
	}
}
