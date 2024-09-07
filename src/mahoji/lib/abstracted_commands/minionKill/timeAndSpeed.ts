import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round, sumArr } from 'e';
import { Bank } from 'oldschooljs';
import { mergeDeep } from 'remeda';

import { type AttackStyles, getAttackStylesContext } from '../../../../lib/minions/functions';
import reducedTimeFromKC from '../../../../lib/minions/functions/reducedTimeFromKC';
import type { Consumable } from '../../../../lib/minions/types';
import { calcPOHBoosts } from '../../../../lib/poh';
import { ChargeBank } from '../../../../lib/structures/Bank';
import { UpdateBank } from '../../../../lib/structures/UpdateBank';
import type { SkillsRequired } from '../../../../lib/types';
import { itemNameFromID } from '../../../../lib/util';
import { resolveAvailableItemBoosts } from '../../../mahojiSettings';
import { getItemCostFromConsumables } from './handleConsumables';
import { type BoostArgs, type CombatMethodOptions, mainBoostEffects } from './speedBoosts';

function applySkillBoost(skillsAsLevels: SkillsRequired, duration: number, styles: AttackStyles[]): [number, string] {
	const skillTotal = sumArr(styles.map(s => skillsAsLevels[s]));
	let newDuration = duration;
	let str = '';
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);
	if (percent < 50) {
		percent = 50 - percent;
		newDuration = increaseNumByPercent(newDuration, percent);
		str = `-${percent.toFixed(2)}% for low stats`;
	} else {
		percent = Math.min(15, percent / 6.5);
		newDuration = reduceNumByPercent(newDuration, percent);
		str = `${percent.toFixed(2)}% for stats`;
	}
	return [newDuration, str];
}

export function speedCalculations(args: Omit<BoostArgs, 'currentTaskOptions'>) {
	const { monster, monsterKC, attackStyles, poh, isInWilderness, gearBank, maxTripLength } = args;
	const { skillsAsLevels } = args.gearBank;
	const messages: string[] = [];
	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, monsterKC);
	const [newTime, skillBoostMsg] = applySkillBoost(skillsAsLevels, timeToFinish, attackStyles);
	timeToFinish = newTime;
	messages.push(skillBoostMsg);

	if (percentReduced >= 1) messages.push(`${percentReduced}% for KC`);
	if (monster.pohBoosts) {
		const [boostPercent, messages] = calcPOHBoosts(poh, monster.pohBoosts);
		if (boostPercent > 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			messages.push(messages.join(' + '));
		}
	}

	for (const [itemID, boostAmount] of Object.entries(resolveAvailableItemBoosts(gearBank, monster, isInWilderness))) {
		timeToFinish *= (100 - boostAmount) / 100;
		messages.push(`${boostAmount}% for ${itemNameFromID(Number.parseInt(itemID))}`);
	}

	let currentTaskOptions: CombatMethodOptions = {};
	const itemCost = new Bank();
	const charges = new ChargeBank();
	const consumables: Consumable[] = [];
	const confirmations: string[] = [];

	for (const boost of mainBoostEffects) {
		for (const b of Array.isArray(boost) ? boost : [boost]) {
			const res = b.run({ ...args, currentTaskOptions, ...getAttackStylesContext(attackStyles) });
			if (!res) continue;
			if (typeof res === 'string') return res;
			const subResults = (Array.isArray(res) ? res : [res]).flat().sort((a, b) => {
				if (a.percentageReduction && b.percentageReduction) {
					return b.percentageReduction - a.percentageReduction;
				}
				return 0;
			});
			for (const boostResult of subResults) {
				if (boostResult.changes) {
					currentTaskOptions = mergeDeep(currentTaskOptions, boostResult.changes);
				}
				if (boostResult.percentageReduction) {
					timeToFinish = reduceNumByPercent(timeToFinish, boostResult.percentageReduction);
				} else if (boostResult.percentageIncrease) {
					timeToFinish = increaseNumByPercent(timeToFinish, boostResult.percentageIncrease);
				}
				if (boostResult.itemCost) itemCost.add(boostResult.itemCost);
				if (boostResult.consumables) consumables.push(...boostResult.consumables);
				if (boostResult.charges) charges.add(boostResult.charges);
				if (boostResult.confirmation) confirmations.push(boostResult.confirmation);
				if (boostResult.message) messages.push(boostResult.message);
			}
		}
	}

	if (monster.itemCost) consumables.push(monster.itemCost);

	const consumablesCost = getItemCostFromConsumables({
		consumableCosts: consumables,
		gearBank,
		quantity: args.inputQuantity ?? Math.floor(maxTripLength / monster.timeToFinish),
		timeToFinish
	});

	const updateBank = new UpdateBank();
	updateBank.itemCostBank.add(itemCost);
	updateBank.chargeBank.add(charges);

	if (consumablesCost) {
		if (consumablesCost?.maxCanKillWithItemCost < 1) {
			return `You don't have the items needed to kill this monster. You need: ${consumablesCost?.itemCost}`;
		}
		updateBank.itemCostBank.add(consumablesCost.itemCost);
	}

	return {
		timeToFinish,
		messages,
		currentTaskOptions,
		maxCanKillWithItemCost: consumablesCost?.maxCanKillWithItemCost,
		confirmations,
		updateBank
	};
}
