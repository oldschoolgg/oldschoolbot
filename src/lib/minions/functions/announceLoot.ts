import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';
import { filterBankFromArrayOfItems } from '../../util';
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
	const itemsToAnnounce = filterBankFromArrayOfItems(
		(monster.notifyDrops as number[]) ?? [],
		loot
	);
	if (Object.keys(itemsToAnnounce).length > 0) {
		const lootStr = new Bank(itemsToAnnounce).toString();

		let notif = '';

		if (team) {
			notif = `In **${team.leader.username}'s** party of ${team.size} minions killing ${monster.name}, ${team.lootRecipient.username} just received **${lootStr}**!`;
		} else {
			notif = `**${user.username}'s** minion, ${user.minionName}, just received **${lootStr}**, their ${monster.name} KC is ${kc}!`;
		}

		client.emit(Events.ServerNotification, notif);
	}
}
