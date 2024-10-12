import { calcWhatPercent, increaseNumByPercent, reduceNumByPercent, round, sumArr } from 'e';
import { Bank } from 'oldschooljs';
import { mergeDeep } from 'remeda';
import z from 'zod';

import { type AttackStyles, getAttackStylesContext } from '../../../../lib/minions/functions';
import reducedTimeFromKC from '../../../../lib/minions/functions/reducedTimeFromKC';
import type { Consumable } from '../../../../lib/minions/types';
import { ChargeBank } from '../../../../lib/structures/Bank';
import { UpdateBank } from '../../../../lib/structures/UpdateBank';
import type { SkillsRequired } from '../../../../lib/types';
import { getItemCostFromConsumables } from './handleConsumables';
import { type BoostArgs, type BoostResult, type CombatMethodOptions, mainBoostEffects } from './speedBoosts';

const schema = z.object({
	timeToFinish: z.number().int().positive(),
	messages: z.array(z.string()),
	currentTaskOptions: z.object({}),
	finalQuantity: z.number().int().positive().min(1),
	confirmations: z.array(z.string()),
	updateBank: z.instanceof(UpdateBank)
});

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
	const { monster, monsterKC, attackStyles, gearBank, maxTripLength, inputQuantity } = args;
	const { skillsAsLevels } = args.gearBank;
	const messages: string[] = [];
	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, monsterKC);
	const [newTime, skillBoostMsg] = applySkillBoost(skillsAsLevels, timeToFinish, attackStyles);
	timeToFinish = newTime;
	messages.push(skillBoostMsg);

	if (percentReduced >= 1) messages.push(`${percentReduced}% for KC`);
	let currentTaskOptions: CombatMethodOptions = {};
	const itemCost = new Bank();
	const charges = new ChargeBank();
	const consumables: Consumable[] = [];
	const confirmations: string[] = [];

	for (const boost of mainBoostEffects) {
		const arr = Array.isArray(boost) ? boost : [boost];
		const results = arr.map(res =>
			res.run({ ...args, currentTaskOptions, ...getAttackStylesContext(attackStyles) })
		);
		const error = results.find(res => typeof res === 'string');
		if (error) return error;
		const [res] = results
			.filter(res => Boolean(res))
			.sort((a, b) => {
				if (!a || !b || !('percentageReduction' in (a as any) || !('percentageReduction' in (b as any)))) {
					throw new Error('Shouldnt happen');
				}
				a = a as any as BoostResult;
				b = b as any as BoostResult;
				if (!a.percentageReduction || !b.percentageReduction) throw new Error('Shouldnt happen');
				return b.percentageReduction - a.percentageReduction;
			});

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

	timeToFinish = Math.ceil(timeToFinish);

	if (monster.itemCost) {
		consumables.push(...(Array.isArray(monster.itemCost) ? monster.itemCost : [monster.itemCost]));
	}

	const consumablesCost = getItemCostFromConsumables({
		consumableCosts: consumables,
		gearBank,
		timeToFinish,
		maxTripLength,
		inputQuantity,
		slayerKillsRemaining: args.killsRemaining
	});
	timeToFinish = Math.floor(consumablesCost.timeToFinish);

	const updateBank = new UpdateBank();
	updateBank.itemCostBank.add(itemCost);
	updateBank.chargeBank.add(charges);

	if (consumablesCost.itemCost) {
		updateBank.itemCostBank.add(consumablesCost.itemCost);
	}

	if (consumablesCost?.boosts) {
		messages.push(...consumablesCost.boosts.map(m => m.message));
	}

	const result = schema.parse({
		timeToFinish,
		messages,
		currentTaskOptions,
		finalQuantity: consumablesCost.finalQuantity,
		confirmations,
		updateBank
	});

	return result;
}
