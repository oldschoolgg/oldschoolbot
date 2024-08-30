import { calcWhatPercent, increaseNumByPercent, notEmpty, reduceNumByPercent, round, sumArr } from "e";
import type { AttackStyles } from "../../../../lib/minions/functions";
import reducedTimeFromKC from "../../../../lib/minions/functions/reducedTimeFromKC";
import { calcPOHBoosts } from "../../../../lib/poh";
import { itemNameFromID } from "../../../../lib/util";
import { resolveAvailableItemBoosts } from "../../../mahojiSettings";
import type { SkillsRequired } from "../../../../lib/types";
import { type BoostArgs, type BoostResult, boosts, type CombatMethodOptions } from "./speedBoosts";
import type { Consumable } from "../../../../lib/minions/types";
import { ChargeBank } from "../../../../lib/structures/Bank";
import { Bank } from "oldschooljs";

function applySkillBoost(skillsAsLevels:SkillsRequired, duration: number, styles: AttackStyles[]): [number, string] {
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

export function speedCalculations(args: Omit<BoostArgs, 'currentTaskOptions'>){
    const {monster, monsterKC,attackStyles, poh, isInWilderness,gearBank} = args;
	const {skillsAsLevels} = args.gearBank;
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
 
	const currentTaskOptions: CombatMethodOptions = {};

    const boostsApplying: BoostResult[] = [];
	for (const boost of boosts) {
        const boostArr = Array.isArray(boost) ? boost : [boost];
        const results =  boostArr
				.flatMap(b => b.run({...args,currentTaskOptions}))
				.filter(notEmpty);
		const errorResult = results.find(r => typeof r === 'string');
		if (errorResult) {
			return errorResult;
		}
		const goodResult = results.filter(i => typeof i !== "string").sort((a, b) =>{
			if (a.percentageReduction && b.percentageReduction) {
				return b.percentageReduction - a.percentageReduction;
			}
			return 0;
		})[0];
        if (goodResult) {
          boostsApplying.push(goodResult);
        }
    }

	const itemCost = new Bank();
	const charges = new ChargeBank();
	const consumables: Consumable[] = [];
	const confirmations: string[] = [];
    for (const boost of boostsApplying) {
		if (boost.percentageReduction) {
	        timeToFinish = reduceNumByPercent(timeToFinish, boost.percentageReduction);
		} else if (boost.percentageIncrease) {
			timeToFinish = increaseNumByPercent(timeToFinish, boost.percentageIncrease);
		}

		if (boost.itemCost) {
			itemCost.add(boost.itemCost);
		}

		if (boost.consumables) {
			consumables.push(...boost.consumables);
		}

		if (boost.charges) {
			charges.add(boost.charges);
		}

		if (boost.changes) {
			for (const [key, value] of Object.entries(boost.changes)) {
				// @ts-ignore
				combatMethodOptions[key as keyof CombatMethodOptions] = value;
			}
		}

		if (boost.confirmation) confirmations.push(boost.confirmation);

		if (boost.message) messages.push(boost.message);
    }

    return {
        timeToFinish,
        messages,
		consumables,
currentTaskOptions,
charges,
itemCost,
confirmations    }
}