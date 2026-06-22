import { Items } from 'oldschooljs';

import reducedTimeFromKC from '@/lib/minions/functions/reducedTimeFromKC.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { calcPOHBoosts } from '@/lib/poh/index.js';
import { resolveAvailableItemBoosts } from '@/mahoji/mahojiSettings.js';

export interface PlayerBoostDetail {
	name: string;
	percent: number;
}

export interface PlayerBoostInfo {
	userId: string;
	username: string;
	teamMultiplier: number;
	personalBoosts: PlayerBoostDetail[];
	totalPersonalPercent: number;
}

export default async function reducedTimeForGroup(
	users: MUser[],
	monster: KillableMonster
): Promise<[number, string[], PlayerBoostInfo[]]> {
	const playerBoostInfos: PlayerBoostInfo[] = [];

	let teamSpeedMultiplier = 0;
	for (let i = 0; i < users.length; i++) {
		teamSpeedMultiplier += 1 + i / 15;
	}

	let totalIndividualBoostPercent = 0;

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const personalBoosts: PlayerBoostDetail[] = [];

		if (monster.pohBoosts) {
			const poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: user.id } });
			if (poh) {
				const { boost, messages: pohMessages } = calcPOHBoosts(poh, monster.pohBoosts);
				if (boost > 0) {
					const label = pohMessages?.length > 0 ? pohMessages.join(', ') : 'POH boost';
					personalBoosts.push({ name: label, percent: boost });
					totalIndividualBoostPercent += boost;
				}
			}
		}

		const userKc = await user.getKC(monster.id);
		const [, userKcReduction] = reducedTimeFromKC(monster, userKc);
		if (userKcReduction > 0) {
			personalBoosts.push({ name: `KC experience (${userKc} kc)`, percent: userKcReduction });
			totalIndividualBoostPercent += userKcReduction;
		}

		for (const [item, boostAmount] of resolveAvailableItemBoosts(user.gearBank, monster).items()) {
			if (boostAmount > 0) {
				personalBoosts.push({ name: item.name, percent: boostAmount });
				totalIndividualBoostPercent += boostAmount;
			}
		}

		if (monster.equippedItemBoosts) {
			for (const boostSet of monster.equippedItemBoosts) {
				const equipped = boostSet.items.find(item =>
					user.gearBank.gear[boostSet.gearSetup].hasEquipped(item.itemID)
				);
				if (equipped) {
					const itemName = Items.itemNameFromId(equipped.itemID) ?? `Item ${equipped.itemID}`;
					personalBoosts.push({ name: itemName, percent: equipped.boostPercent });
					totalIndividualBoostPercent += equipped.boostPercent;
				}
			}
		}

		const totalPersonalPercent = personalBoosts.reduce((sum, b) => sum + b.percent, 0);
		const teamMultiplier = 1 + i / 15;

		playerBoostInfos.push({
			userId: user.id,
			username: user.usernameOrMention,
			teamMultiplier,
			personalBoosts,
			totalPersonalPercent
		});
	}

	const messages = playerBoostInfos.map(p => {
		const boostLines =
			p.personalBoosts.length > 0
				? p.personalBoosts.map(b => `${b.name}: +${b.percent.toFixed(1)}%`).join(', ')
				: 'No personal boosts';
		return `${p.username}: ${p.teamMultiplier.toFixed(2)}x team bonus, ${p.totalPersonalPercent.toFixed(1)}% personal (${boostLines})`;
	});

	const individualBoostMultiplier = 1 + totalIndividualBoostPercent / 100;
	const finalMultiplier = teamSpeedMultiplier * individualBoostMultiplier;

	const reducedTime = Math.max(Math.floor(monster.timeToFinish / finalMultiplier), monster.respawnTime!);

	return [reducedTime, messages, playerBoostInfos];
}
