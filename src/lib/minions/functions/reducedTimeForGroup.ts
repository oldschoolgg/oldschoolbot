import reducedTimeFromKC from '@/lib/minions/functions/reducedTimeFromKC.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { calcPOHBoosts } from '@/lib/poh/index.js';
import { resolveAvailableItemBoosts } from '@/mahoji/mahojiSettings.js';

export default async function reducedTimeForGroup(
	users: MUser[],
	monster: KillableMonster
): Promise<[number, string[]]> {
	const messages = [];

	let teamSpeedMultiplier = 0;
	for (let i = 0; i < users.length; i++) {
		teamSpeedMultiplier += 1 + i / 15;
	}

	let totalIndividualBoostPercent = 0;

	if (monster.name === 'Corporeal Beast') {
		for (let i = 0; i < users.length; i++) {
			const poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: users[i].id } });

			if (!poh) {
				messages.push(`${users[i].usernameOrMention} has no pool`);
				continue;
			}
			const { boost } = calcPOHBoosts(poh, monster.pohBoosts!);
			totalIndividualBoostPercent += boost;
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
		
		totalIndividualBoostPercent += userKcReduction + userItemBoost;

		const userTeamBonus = 1 + i / 15;
		const userPersonalBonus = (userKcReduction + userItemBoost) / 100;
		messages.push(
			`${user.usernameOrMention}: ${userTeamBonus.toFixed(2)}x team bonus, ${(userPersonalBonus * 100).toFixed(1)}% personal boost`
		);
	}

	// Apply individual boosts directly instead of averaging
	// Each player's boost contributes fully to the team's speed
	const individualBoostMultiplier = 1 + (totalIndividualBoostPercent / 100);
	const finalMultiplier = teamSpeedMultiplier * individualBoostMultiplier;

	const reducedTime = Math.max(
		Math.floor(monster.timeToFinish / finalMultiplier),
		monster.respawnTime!
	);

	return [reducedTime, messages];
}