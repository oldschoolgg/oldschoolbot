import { resolveAvailableItemBoosts } from '../../../mahoji/mahojiSettings';
import { calcPOHBoosts } from '../../poh';

import type { KillableMonster } from '../types';
import reducedTimeFromKC from './reducedTimeFromKC';

export default async function reducedTimeForGroup(
	users: MUser[],
	monster: KillableMonster
): Promise<[number, string[]]> {
	let reductionMultiplier = 0;
	const messages = [];

	if (monster.name === 'Corporeal Beast') {
		for (let i = 0; i < users.length; i++) {
			const poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: users[i].id } });

			if (!poh) {
				messages.push(`${users[i].usernameOrMention} has no pool`);
				continue;
			}
			const { boost } = calcPOHBoosts(poh, monster.pohBoosts!);
			reductionMultiplier += boost / 100;
		}
	}

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const userKc = await user.getKC(monster.id);
		const [, userKcReduction] = reducedTimeFromKC(monster, userKc);
		let userItemBoost = 0;
		for (const [, boostAmount] of resolveAvailableItemBoosts(user.gearBank, monster).items()) {
			userItemBoost += boostAmount;
		}
		// 1 per user, i/15 for incentive to group (more people compounding i bonus), then add the users kc and item boost percent
		const multiplier = 1 + i / 15 + userKcReduction / 100 + userItemBoost / 100;
		reductionMultiplier += multiplier;
		messages.push(`${multiplier.toFixed(2)}x bonus from ${user.usernameOrMention}`);
	}

	return [Math.max(Math.floor(monster.timeToFinish / reductionMultiplier), monster.respawnTime!), messages];
}
