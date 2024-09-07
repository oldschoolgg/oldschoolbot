import type { PlayerOwnedHouse } from '@prisma/client';
import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { Monsters } from 'oldschooljs';
import { mergeDeep } from 'remeda';
import z from 'zod';
import type { BitField, PvMMethod } from '../../../../lib/constants';
import { type CombatOptionsEnum, SlayerActivityConstants } from '../../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import {
	type AttackStyles,
	attackStylesArr,
	getAttackStylesContext,
	resolveAttackStyles
} from '../../../../lib/minions/functions';
import type { KillableMonster } from '../../../../lib/minions/types';
import type { SlayerTaskUnlocksEnum } from '../../../../lib/slayer/slayerUnlocks';
import { type CurrentSlayerInfo, determineCombatBoosts } from '../../../../lib/slayer/slayerUtil';
import type { GearBank } from '../../../../lib/structures/GearBank';
import { UpdateBank } from '../../../../lib/structures/UpdateBank';
import type { Peak } from '../../../../lib/tickers';
import {
	checkRangeGearWeapon,
	formatDuration,
	isWeekend,
	itemNameFromID,
	numberEnum,
	randomVariation,
	zodEnum
} from '../../../../lib/util';
import { changeQuantityForTaskKillsRemaining } from './calcTaskMonstersRemaining';
import { type PostBoostEffect, postBoostEffects } from './postBoostEffects';
import { speedCalculations } from './timeAndSpeed';

const returnSchema = z.object({
	duration: z.number().int().positive(),
	quantity: z.number().int().positive(),
	isOnTask: z.boolean(),
	isInWilderness: z.boolean(),
	attackStyles: z.array(z.enum(zodEnum(attackStylesArr))),
	currentTaskOptions: z.object({
		bob: z
			.number()
			.superRefine(numberEnum([SlayerActivityConstants.IceBarrage, SlayerActivityConstants.IceBurst]))
			.optional(),
		usingCannon: z.boolean().optional(),
		cannonMulti: z.boolean().optional(),
		chinning: z.boolean().optional(),
		hasWildySupplies: z.boolean().optional(),
		died: z.boolean().optional(),
		pkEncounters: z.number().int().min(0).optional(),
		isInWilderness: z.boolean().optional()
	}),
	messages: z.array(z.string()),
	updateBank: z.instanceof(UpdateBank)
});

export interface MinionKillOptions {
	attackStyles: AttackStyles[];
	gearBank: GearBank;
	currentSlayerTask: CurrentSlayerInfo;
	monster: KillableMonster;
	isTryingToUseWildy: boolean;
	combatOptions: readonly CombatOptionsEnum[];
	inputPVMMethod: PvMMethod | undefined;
	monsterKC: number;
	poh: PlayerOwnedHouse;
	maxTripLength: number;
	inputQuantity?: number;
	slayerUnlocks: SlayerTaskUnlocksEnum[];
	favoriteFood: number[];
	bitfield: readonly BitField[];
	pkEvasionExperience: number;
	currentPeak: Peak;
}

export function newMinionKillCommand(args: MinionKillOptions) {
	let {
		combatOptions,
		attackStyles,
		gearBank,
		currentSlayerTask,
		monster,
		isTryingToUseWildy,
		inputPVMMethod,
		maxTripLength,
		inputQuantity,
		slayerUnlocks
	} = args;
	const osjsMon = Monsters.get(monster.id)!;
	let { primaryStyle, relevantGearStat } = getAttackStylesContext(attackStyles);

	const isOnTask =
		currentSlayerTask.assignedTask !== null &&
		currentSlayerTask.currentTask !== null &&
		currentSlayerTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
	}

	if (monster.canBePked && !isTryingToUseWildy) {
		return `You can't kill ${monster.name} outside the wilderness.`;
	}

	const isInWilderness = Boolean(
		isTryingToUseWildy || (isOnTask && currentSlayerTask.assignedTask?.wilderness) || monster.canBePked
	);

	if (!monster.wildy && isInWilderness) {
		return `You can't kill ${monster.name} in the wilderness.`;
	}

	const matchedRevenantMonster = revenantMonsters.find(m => m.id === monster.id);
	if (matchedRevenantMonster) {
		const weapon = gearBank.gear.wildy.equippedWeapon();
		if (!weapon) {
			return 'You have no weapon equipped in your Wildy outfit.';
		}

		if (weapon.equipment![relevantGearStat] < 10) {
			return `Your weapon is terrible, you can't kill Revenants. You should have ${primaryStyle} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`/minion train\``;
		}
	}

	const isKillingJelly = monster.id === Monsters.Jelly.id;
	const isAbleToBurstInWilderness = isKillingJelly && isInWilderness;

	const combatMethods = determineCombatBoosts({
		cbOpts: combatOptions,
		monster,
		methods: [inputPVMMethod ?? 'none'],
		isOnTask,
		wildyBurst: isAbleToBurstInWilderness
	});

	attackStyles = resolveAttackStyles({
		monster,
		boostMethod: combatMethods,
		attackStyles
	});
	const { skillsAsLevels } = gearBank;
	if (combatMethods.includes('barrage') && skillsAsLevels.magic < 94) {
		return `You need 94 Magic to use Ice Barrage. You have ${skillsAsLevels.magic}`;
	}
	if (combatMethods.includes('burst') && skillsAsLevels.magic < 70) {
		return `You need 70 Magic to use Ice Burst. You have ${skillsAsLevels.magic}`;
	}
	if (combatMethods.includes('chinning') && skillsAsLevels.ranged < 65) {
		return `You need 65 Ranged to use Chinning method. You have ${skillsAsLevels.ranged}`;
	}

	const isBurstingOrBarraging = combatMethods.includes('burst') || combatMethods.includes('barrage');
	if (isBurstingOrBarraging && !monster.canBarrage) {
		if (isKillingJelly && !isInWilderness) {
			return `${monster.name} can only be barraged or burst in the wilderness.`;
		} else {
			return `${monster.name} cannot be barraged or burst.`;
		}
	}

	const ephemeralPostTripEffects: PostBoostEffect[] = [];

	const speedDurationResult = speedCalculations({
		...args,
		attackStyles,
		isOnTask,
		osjsMon,
		primaryStyle,
		isInWilderness: isInWilderness,
		combatMethods,
		relevantGearStat,
		addPostBoostEffect: (effect: PostBoostEffect) => ephemeralPostTripEffects.push(effect)
	});
	if (typeof speedDurationResult === 'string') {
		return speedDurationResult;
	}

	const maxBasedOnTime = Math.floor(maxTripLength / speedDurationResult.timeToFinish);
	const maxCanKill = Math.min(speedDurationResult.maxCanKillWithItemCost ?? Number.POSITIVE_INFINITY, maxBasedOnTime);
	let quantity = inputQuantity ?? maxCanKill;
	if ([Monsters.Skotizo.id].includes(monster.id)) {
		quantity = 1;
	}
	quantity = changeQuantityForTaskKillsRemaining({
		isOnTask,
		quantity,
		monster,
		task: currentSlayerTask,
		slayerUnlocks
	});

	quantity = Math.max(1, quantity);
	let duration = speedDurationResult.timeToFinish * quantity;
	if (quantity > 1 && duration > maxTripLength) {
		return `You can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${monster.name} is ${Math.floor(maxCanKill)}.`;
	}

	duration = randomVariation(duration, 3);
	if (isWeekend()) {
		speedDurationResult.messages.push('10% for Weekend');
		duration *= 0.9;
	}

	if (monster.projectileUsage?.required) {
		if (!gearBank.gear.range.ammo?.item) {
			return `You need range ammo equipped to kill ${monster.name}.`;
		}
		const rangeCheck = checkRangeGearWeapon(gearBank.gear.range);
		if (typeof rangeCheck === 'string') {
			return `Your range gear isn't right: ${rangeCheck}`;
		}
		const projectilesNeeded = monster.projectileUsage.calculateQuantity({ quantity });
		speedDurationResult.updateBank.itemCostBank.add(rangeCheck.ammo.item, projectilesNeeded);
		if (projectilesNeeded > rangeCheck.ammo.quantity) {
			return `You need ${projectilesNeeded.toLocaleString()}x ${itemNameFromID(
				rangeCheck.ammo.item
			)} to kill ${quantity}x ${
				monster.name
			}, and you have ${rangeCheck.ammo.quantity.toLocaleString()}x equipped.`;
		}
	}

	for (const effect of [...postBoostEffects, ...ephemeralPostTripEffects]) {
		const result = effect.run({
			...args,
			duration,
			quantity,
			isOnTask,
			isInWilderness,
			osjsMon,
			primaryStyle,
			combatMethods,
			relevantGearStat,
			currentTaskOptions: speedDurationResult.currentTaskOptions
		});
		if (!result) continue;
		for (const boostResult of Array.isArray(result) ? result : [result]) {
			if (boostResult.changes) {
				speedDurationResult.currentTaskOptions = mergeDeep(
					speedDurationResult.currentTaskOptions,
					boostResult.changes
				);
				const newStyles = getAttackStylesContext(attackStyles);
				primaryStyle = newStyles.primaryStyle;
				relevantGearStat = newStyles.relevantGearStat;
			}

			if (boostResult.percentageReduction) {
				duration = reduceNumByPercent(duration, boostResult.percentageReduction);
			} else if (boostResult.percentageIncrease) {
				duration = increaseNumByPercent(duration, boostResult.percentageIncrease);
			}
			if (boostResult.charges) speedDurationResult.updateBank.chargeBank.add(boostResult.charges);
			if (boostResult.itemCost) speedDurationResult.updateBank.itemCostBank.add(boostResult.itemCost);
			if (boostResult.message) speedDurationResult.messages.push(boostResult.message);
		}
	}
	duration = Math.ceil(duration);

	speedDurationResult.updateBank.itemCostBank.freeze();
	speedDurationResult.updateBank.itemLootBank.freeze();

	if (speedDurationResult.updateBank.itemCostBank.length > 0) {
		speedDurationResult.messages.push(`Removing items: ${speedDurationResult.updateBank.itemCostBank}`);
	}

	const result = returnSchema.parse({
		duration,
		quantity,
		isOnTask,
		isInWilderness,
		attackStyles,
		currentTaskOptions: speedDurationResult.currentTaskOptions,
		messages: speedDurationResult.messages,
		updateBank: speedDurationResult.updateBank
	});

	return result;
}
