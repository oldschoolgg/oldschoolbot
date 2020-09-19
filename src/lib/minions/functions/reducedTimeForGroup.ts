import { KlasaUser } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import { KillableMonster } from '../types';
import reducedTimeFromKC from './reducedTimeFromKC';

export default function reducedTimeForGroup(users: KlasaUser[], monster: KillableMonster) {
	let reductionMultiplier = 0;

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
		reductionMultiplier += 1 + i / 15 + userKcReduction / 100 + userItemBoost / 100;
	}

	return Math.max(Math.floor(monster.timeToFinish / reductionMultiplier), monster.respawnTime!);
}
