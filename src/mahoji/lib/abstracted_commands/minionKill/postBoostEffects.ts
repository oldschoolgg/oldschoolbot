import type { GearSetupType } from '@prisma/client';
import { Time, calcPercentOfNum, objectKeys, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import { BitField, PeakTier } from '../../../../lib/constants';
import { Eatables } from '../../../../lib/data/eatables';
import { calculateMonsterFoodRaw } from '../../../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../../../lib/minions/functions/reducedTimeFromKC';
import { removeFoodFromUserRaw } from '../../../../lib/minions/functions/removeFoodFromUser';
import type { Peak } from '../../../../lib/tickers';
import { convertAttackStyleToGearSetup } from '../../../../lib/util';
import { calcWildyPKChance } from '../../../../lib/util/calcWildyPkChance';
import type { BoostArgs, BoostResult } from './speedBoosts';

const noFoodBoost = Math.floor(Math.max(...Eatables.map(eatable => eatable.pvmBoost ?? 0)) + 1);

// Runs after we know the quantity/duration/etc
type PostBoostEffectReturn = Pick<
	BoostResult,
	'percentageReduction' | 'percentageIncrease' | 'message' | 'charges' | 'changes' | 'itemCost'
>;
export type PostBoostEffect = {
	description: string;
	run: (
		args: { currentPeak: Peak; duration: number; quantity: number } & Omit<
			BoostArgs,
			'addPostBoostEffect' | 'itemCost'
		>
	) => null | undefined | PostBoostEffectReturn | PostBoostEffectReturn[];
};
export const postBoostEffects: PostBoostEffect[] = [
	{
		description: 'Food',
		run: ({ monster, isInWilderness, quantity, monsterKC, gearBank, favoriteFood }) => {
			if (!monster.healAmountNeeded || !monster.attackStyleToUse || !monster.attackStylesUsed) {
				return {
					percentageReduction: noFoodBoost,
					message: `${noFoodBoost}% for no food`
				};
			}
			const [healAmountNeeded] = calculateMonsterFoodRaw(gearBank, monster);

			let gearToCheck: GearSetupType = convertAttackStyleToGearSetup(monster.attackStyleToUse);
			if (isInWilderness) gearToCheck = 'wildy';

			const [, percentReduced] = reducedTimeFromKC(monster, monsterKC);
			const foodRemoveResult = removeFoodFromUserRaw({
				gearBank: gearBank,
				favoriteFood,
				totalHealingNeeded: healAmountNeeded * quantity,
				attackStylesUsed: isInWilderness
					? ['wildy']
					: uniqueArr([...objectKeys(monster.minimumGearRequirements ?? {}), gearToCheck]),
				learningPercentage: percentReduced,
				isWilderness: isInWilderness,
				minimumHealAmount: monster.minimumHealAmount
			});

			if (foodRemoveResult === null || foodRemoveResult.foodToRemove.length === 0) {
				return {
					percentageReduction: noFoodBoost,
					message: `${noFoodBoost}% for no food`
				};
			}

			const results: PostBoostEffectReturn[] = [];
			for (const [item, qty] of foodRemoveResult.foodToRemove.items()) {
				const eatable = Eatables.find(e => e.id === item.id)!;
				const healAmount =
					typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(gearBank);
				const amountHealed = qty * healAmount;
				if (
					amountHealed < calcPercentOfNum(75 * foodRemoveResult.reductionRatio, healAmountNeeded * quantity)
				) {
					continue;
				}
				const boost = eatable.pvmBoost;
				if (boost) {
					if (boost < 0) {
						results.push({
							percentageIncrease: Math.abs(boost),
							message: `${boost}% slower for using ${eatable.name}`
						});
					} else {
						results.push({
							percentageReduction: boost,
							message: `${boost}% for ${eatable.name}`
						});
					}
				}
				break;
			}

			results.push({
				itemCost: foodRemoveResult.foodToRemove
			});
			return results;
		}
	},
	{
		description: 'PVP',
		run: ({
			monster,
			isInWilderness,
			currentTaskOptions,
			duration,
			gearBank,
			pkEvasionExperience,
			bitfield,
			currentPeak
		}) => {
			if (!isInWilderness) return;

			let confirmationString: string | undefined = undefined;
			const messages: string[] = [];

			let hasWildySupplies = undefined;

			const antiPkBrewsNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));
			const antiPkRestoresNeeded = Math.max(1, Math.floor(duration / (8 * Time.Minute)));
			const antiPkKarambwanNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));

			const antiPKSupplies = new Bank().add('Saradomin brew(4)', antiPkBrewsNeeded);

			// Restores
			if (gearBank.bank.amount('Blighted super restore(4)') >= antiPkRestoresNeeded) {
				antiPKSupplies.add('Blighted super restore(4)', antiPkRestoresNeeded);
			} else {
				antiPKSupplies.add('Super restore(4)', antiPkRestoresNeeded);
			}

			// Food
			if (gearBank.bank.amount('Blighted karambwan') >= antiPkKarambwanNeeded + 20) {
				antiPKSupplies.add('Blighted karambwan', antiPkKarambwanNeeded);
			} else {
				antiPKSupplies.add('Cooked karambwan', antiPkKarambwanNeeded);
			}

			hasWildySupplies = true;
			if (!gearBank.bank.has(antiPKSupplies)) {
				hasWildySupplies = false;
				confirmationString = `Are you sure you want to kill ${monster.name} without anti-pk supplies? You should bring at least ${antiPKSupplies} on this trip for safety to not die and potentially get smited.`;
			} else {
				messages.push(
					'Your minion brought some supplies to survive potential pkers. (Handed back after trip if lucky)'
				);
			}
			const { pkCount, died, chanceString } = calcWildyPKChance(
				currentPeak,
				gearBank,
				monster,
				duration,
				hasWildySupplies,
				Boolean(currentTaskOptions.usingCannon),
				pkEvasionExperience
			);
			messages.push(chanceString);
			if (currentPeak.peakTier === PeakTier.High && !bitfield.includes(BitField.DisableHighPeakTimeWarning)) {
				confirmationString = `Are you sure you want to kill ${monster.name} during high peak time? PKers are more active.`;
			}

			return {
				message: messages.join(', '),
				confirmation: confirmationString,
				changes: {
					pkEncounters: pkCount,
					died: died,
					hasWildySupplies
				}
			};
		}
	}
];
