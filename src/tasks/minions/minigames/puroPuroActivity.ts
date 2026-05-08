import { calcPerHour, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import { implings, puroImpHighTierTable, puroImpNormalTable, puroImpSpellTable } from '@/lib/implings.js';
import type { PuroPuroActivityTaskOptions } from '@/lib/types/minions.js';

function hunt(rng: RNGProvider, minutes: number, hasGraceful: boolean, min: number, max: number) {
	let totalQty = 0;
	for (let i = 0; i < minutes; i++) totalQty += rng.randFloat(min, max);
	if (!hasGraceful) totalQty = Math.floor(reduceNumByPercent(totalQty, 20));
	return totalQty;
}

function calcPuroPuroTripResult({
	duration,
	hasDarkLure,
	hasGraceful,
	hasBryophytaStaff,
	hunterLevel,
	rng,
	implingTier
}: {
	hasBryophytaStaff: boolean;
	duration: number;
	hasGraceful: boolean;
	hunterLevel: number;
	hasDarkLure: boolean;
	rng: RNGProvider;
	implingTier: number | null;
}) {
	const minutes = Math.floor(duration / Time.Minute);
	const implingsLoot = new Bank();
	const itemCost = new Bank();
	const allImpQty = Math.floor(hunt(rng, minutes, hasGraceful, 1, 3));
	const highTierImpQty = Math.floor(hunt(rng, minutes, hasGraceful, 0.75, 1) * (hasDarkLure ? 1.2 : 1));
	const singleImpQty = Math.floor(hunt(rng, minutes, hasGraceful, 5, 6));

	switch (implingTier) {
		case 2:
			puroImpHighTierTable.roll(highTierImpQty, { targetBank: implingsLoot });
			break;
		case 3:
			implingsLoot.add('Eclectic impling jar', singleImpQty);
			break;
		case 4:
			implingsLoot.add('Essence impling jar', singleImpQty);
			break;
		case 5:
			implingsLoot.add('Earth impling jar', singleImpQty);
			break;
		case 6:
			implingsLoot.add('Gourmet impling jar', singleImpQty);
			break;
		case 7:
			implingsLoot.add('Young impling jar', singleImpQty);
			break;
		case 8:
			implingsLoot.add('Baby impling jar', singleImpQty);
			break;
		default: {
			const table = hasDarkLure ? puroImpSpellTable : puroImpNormalTable;
			table.roll(allImpQty, { targetBank: implingsLoot });
			break;
		}
	}
	const messages: string[] = [];

	let hunterXP = 0;
	const missed = new Bank();
	for (const [item, qty] of implingsLoot.items()) {
		const impling = implings[item.id];
		if (hunterLevel < impling.level) {
			missed.add(item.id, qty);
			implingsLoot.remove(item.id, qty);
			continue;
		}
		hunterXP += impling.catchXP * qty;
	}

	let magicXP = 0;
	if (hasDarkLure) {
		const spellsUsed: number = implingsLoot.items().reduce((prev, curr) => {
			let previousVal = prev;
			const huntLevel = implings[curr[0].id].level;
			if (huntLevel >= 58) previousVal += curr[1];
			return previousVal;
		}, 0);

		let savedRunes = 0;
		if (hasBryophytaStaff) {
			for (let i = 0; i < spellsUsed; i++) {
				if (rng.roll(15)) savedRunes++;
			}
		}

		itemCost.add('Nature Rune', spellsUsed - savedRunes);
		itemCost.add('Death Rune', spellsUsed);

		const saved = savedRunes > 0 ? `\nYour Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		magicXP += spellsUsed * 60;

		if (implingTier === 2) {
			messages.push(
				`Due to using Dark Lure, you are catching 20% more implings. You used: ${itemCost}. ${saved}`
			);
		} else {
			messages.push(
				`Due to using Dark Lure, you have an increased chance at getting Nature Implings and above. You used: ${itemCost}. ${saved}`
			);
		}
	}

	return {
		implingsLoot,
		hunterXP,
		itemCost,
		missed,
		messages,
		magicXP
	};
}

export const puroPuroTask: MinionTask = {
	type: 'PuroPuro',
	async run(data: PuroPuroActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, darkLure, implingTier } = data;

		await user.incrementMinigameScore('puro_puro', quantity);

		let message = `<@${user.id}>, ${user.minionName} finished hunting in Puro-Puro. `;

		const { implingsLoot, hunterXP, itemCost, missed, magicXP, messages } = calcPuroPuroTripResult({
			duration: data.duration,
			hasDarkLure: darkLure,
			hasGraceful: user.hasGracefulEquipped(),
			hunterLevel: user.skillLevel('hunter'),
			hasBryophytaStaff: user.hasEquipped(EItem.BRYOPHYTAS_STAFF),
			rng,
			implingTier
		});

		const xpStr = await user.addXP({
			skillName: 'hunter',
			amount: hunterXP,
			duration: data.duration,
			source: 'PuroPuro'
		});

		if (hunterXP > 0) {
			message += `\n${xpStr}.`;
		}

		const magicXpStr = await user.addXP({
			skillName: 'magic',
			amount: magicXP,
			duration: data.duration,
			source: 'PuroPuro'
		});

		if (magicXP > 0) message += `\n${magicXpStr}.`;
		message +=
			implingsLoot.length === 0
				? `\nYou didn't get any loot.`
				: `\nYou received: **${implingsLoot
						.items()
						.sort((curr, next) => {
							const currHunterLevel = implings[curr[0].id].level;
							const nextHunterLevel = implings[next[0].id].level;
							return nextHunterLevel - currHunterLevel;
						})
						.map(item => {
							return `${item[1]}x ${item[0].name}`;
						})
						.join(', ')}**.`;

		if (missed.length > 0) message += `\nYou missed out on ${missed} due to your hunter level being too low.`;

		if (implingsLoot.length === 1) {
			const [item, qty] = implingsLoot.items()[0];
			message += `\n\n${calcPerHour(qty, data.duration).toFixed(1)} ${item.name}/hr`;
		} else if (implingsLoot.length > 1) {
			const totalQty = implingsLoot
				.items()
				.map(i => i[1])
				.reduce((a, b) => a + b, 0);
			message += `\n\n${calcPerHour(totalQty, data.duration).toFixed(1)} jars/hr`;
		}

		if (messages.length > 0) {
			message += `\n\n${messages.join('\n')}`;
		}

		await user.transactItems({
			itemsToAdd: implingsLoot,
			collectionLog: true,
			itemsToRemove: itemCost
		});

		await user.statsBankUpdate('puropuro_implings_bank', implingsLoot);

		return handleTripFinish({ user, channelId, message, data, loot: implingsLoot });
	}
};
