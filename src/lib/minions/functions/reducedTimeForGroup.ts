import { KlasaUser } from 'klasa';

import { calcPOHBoosts } from '../../poh';
import { UserSettings } from '../../settings/types/UserSettings';
import { PoHTable } from '../../typeorm/PoHTable.entity';
import { KillableMonster } from '../types';
import reducedTimeFromKC from './reducedTimeFromKC';

export default async function reducedTimeForGroup(
	users: KlasaUser[],
	monster: KillableMonster
): Promise<[number, string[]]> {
	let reductionMultiplier = 0;
	let messages = [];

	if (monster.name === 'Corporeal Beast') {
		for (let i = 0; i < users.length; i++) {
			const poh = await PoHTable.findOne({ userID: users[i].id });

			if (!poh) {
				messages.push(`${users[i].username} has no pool`);
				continue;
			}
			const [boosts] = await calcPOHBoosts(poh, monster.pohBoosts!);
			reductionMultiplier += boosts / 100;
		}
	}

	for (let i = 0; i < users.length; i++) {
		const userKc = users[i].settings.get(UserSettings.MonsterScores)[monster.id] ?? 1;
		const [, userKcReduction] = reducedTimeFromKC(monster, userKc);
		let userItemBoost = 0;
		if (monster.itemInBankBoosts) {
			for (const [itemID, boostAmount] of Object.entries(monster.itemInBankBoosts)) {
				if (!users[i].hasItemEquippedOrInBank(parseInt(itemID))) continue;
				userItemBoost += boostAmount;
			}
		}
		// 1 per user, i/15 for incentive to group (more people compounding i bonus), then add the users kc and item boost percent
		let multiplier = 1 + i / 15 + userKcReduction / 100 + userItemBoost / 100;
		reductionMultiplier += multiplier;
		messages.push(`${multiplier.toFixed(2)}x bonus from ${users[i].username}`);
	}

	return [
		Math.max(Math.floor(monster.timeToFinish / reductionMultiplier), monster.respawnTime!),
		messages
	];
}
