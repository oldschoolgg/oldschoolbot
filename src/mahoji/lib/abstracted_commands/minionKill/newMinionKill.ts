import type { PlayerOwnedHouse } from '@prisma/client';
import { floor } from 'lodash';
import { Bank, Monsters } from 'oldschooljs';
import type { BitField, PvMMethod } from '../../../../lib/constants';
import { GearStat, type OffenceGearStat } from '../../../../lib/gear/types';
import type { CombatOptionsEnum } from '../../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import { type AttackStyles, convertAttackStylesToSetup, resolveAttackStyles } from '../../../../lib/minions/functions';
import type { Consumable, KillableMonster } from '../../../../lib/minions/types';
import type { SlayerTaskUnlocksEnum } from '../../../../lib/slayer/slayerUnlocks';
import { type CurrentSlayerInfo, determineCombatBoosts } from '../../../../lib/slayer/slayerUtil';
import type { GearBank } from '../../../../lib/structures/GearBank';
import { checkRangeGearWeapon, formatDuration, isWeekend, itemNameFromID, randomVariation } from '../../../../lib/util';
import { minionName } from '../../../../lib/util/minionUtils';
import { changeQuantityForTaskKillsRemaining } from './calcTaskMonstersRemaining';
import { getItemCostFromConsumables } from './handleConsumables';
import { type PostBoostEffect, postBoostEffects } from './speedBoosts';
import { speedCalculations } from './timeAndSpeed';

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
	const primaryStyle = convertAttackStylesToSetup(attackStyles);
	const relevantGearStat: OffenceGearStat = (
		{ melee: GearStat.AttackCrush, mage: GearStat.AttackMagic, range: GearStat.AttackRanged } as const
	)[primaryStyle];

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

	const resolveAttackStyleResult = resolveAttackStyles({
		monsterID: monster.id,
		boostMethod: combatMethods,
		attackStyles
	});
	attackStyles = resolveAttackStyleResult.attackStyles;

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

	if ((combatMethods.includes('burst') || combatMethods.includes('barrage')) && !monster.canBarrage) {
		if (isKillingJelly) {
			if (!isInWilderness) {
				return `${monster.name} can only be barraged or burst in the wilderness.`;
			}
		} else return `${monster.name} cannot be barraged or burst.`;
	}

	const osjsMon = resolveAttackStyleResult.osjsMon;
	const ephemeralPostTripEffects: PostBoostEffect[] = [];

	const speedDurationResult = speedCalculations({
		...args,
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

	const maxCanKill = Math.floor(maxTripLength / speedDurationResult.timeToFinish);
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
		return `${minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${monster.name} is ${floor(maxCanKill)}.`;
	}

	duration = randomVariation(duration, 3);
	if (isWeekend()) {
		speedDurationResult.messages.push('10% for Weekend');
		duration *= 0.9;
	}

	const lootToRemove = new Bank().add(speedDurationResult.itemCost);

	const consumableCosts: Consumable[] = [...speedDurationResult.consumables];
	if (monster.itemCost) {
		consumableCosts.push(monster.itemCost);
	}

	const consumablesCost = getItemCostFromConsumables({
		consumableCosts,
		gearBank,
		quantity,
		duration,
		timeToFinish: speedDurationResult.timeToFinish
	});
	if (consumablesCost) {
		lootToRemove.add(consumablesCost.itemCost);
		quantity = consumablesCost.newQuantity;
		duration = consumablesCost.newDuration;
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
		lootToRemove.add(rangeCheck.ammo.item, projectilesNeeded);
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
			duration,
			quantity,
			isOnTask,
			isInWilderness,
			osjsMon,
			primaryStyle,
			combatMethods,
			relevantGearStat,
			...args,
			currentTaskOptions: speedDurationResult.currentTaskOptions
		});
		if (typeof result === 'string') {
			return result;
		}
	}

	return {
		duration,
		quantity,
		lootToRemove,
		isOnTask,
		isInWilderness,
		attackStyles,
		charges: speedDurationResult.charges,
		currentTaskOptions: speedDurationResult.currentTaskOptions,
		messages: speedDurationResult.messages
	};
}
