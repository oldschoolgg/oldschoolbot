import type { User } from '@prisma/client';
import { type Monster, Monsters } from 'oldschooljs';

import { NIGHTMARES_HP, type PvMMethod } from '../../constants';
import { GearStat, type OffenceGearStat, type PrimaryGearSetupType } from '../../gear';
import { NexMonster } from '../../nex';
import { SkillsEnum } from '../../skilling/types';
import { XPBank } from '../../structures/XPBank';
import { randomVariation } from '../../util';
import { xpCannonVaryPercent, xpPercentToCannon, xpPercentToCannonM } from '../data/combatConstants';
import killableMonsters from '../data/killableMonsters';
import { Ignecarus } from '../data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../data/killableMonsters/custom/bosses/KingGoldemar';
import { NAXXUS_HP, Naxxus } from '../data/killableMonsters/custom/bosses/Naxxus';
import { VasaMagus } from '../data/killableMonsters/custom/bosses/VasaMagus';
import { BSOMonsters } from '../data/killableMonsters/custom/customMonsters';
import type { AddMonsterXpParams, KillableMonster } from '../types';

export { default as calculateMonsterFood } from './calculateMonsterFood';
export { default as reducedTimeForGroup } from './reducedTimeForGroup';

export const attackStylesArr = [
	SkillsEnum.Attack,
	SkillsEnum.Strength,
	SkillsEnum.Defence,
	SkillsEnum.Magic,
	SkillsEnum.Ranged
] as const;
export type AttackStyles = (typeof attackStylesArr)[number];

const miscHpMap: Record<number, number> = {
	3127: 250,
	46274: 5000,
	9415: NIGHTMARES_HP,
	[KingGoldemar.id]: 10_000,
	[VasaMagus.id]: 3900,
	[KalphiteKingMonster.id]: 5300,
	[BSOMonsters.SeaKraken.id]: 5200,
	[Ignecarus.id]: 10_000,
	[Naxxus.id]: NAXXUS_HP
};

function meleeOnly(skills: AttackStyles[]): AttackStyles[] {
	if (skills.some(skill => skill === SkillsEnum.Ranged || skill === SkillsEnum.Magic)) {
		return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
	}
	return skills;
}

export function resolveAttackStyles({
	monster,
	boostMethod,
	attackStyles: inputAttackStyle
}: ResolveAttackStylesParams): AttackStyles[] {
	if (monster?.id === KingGoldemar.id) return meleeOnly(inputAttackStyle);
	if (monster?.id === VasaMagus.id) return [SkillsEnum.Magic];
	if (monster?.id === NexMonster.id) return [SkillsEnum.Ranged];
	if (monster?.id === KalphiteKingMonster.id) return meleeOnly(inputAttackStyle);
	if (monster?.id === Naxxus.id) {
		return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Magic];
	}
	// The styles chosen by this user to use.
	let attackStyles = inputAttackStyle ?? [];

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles =
		monster?.defaultAttackStyles ??
		attackStylesArr.filter(i => !monster?.disallowedAttackStyles?.includes(i)).slice(0, 1);

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (attackStyles.length === 0 || attackStyles.some(s => monster?.disallowedAttackStyles?.includes(s))) {
		attackStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		boostMethod &&
		(boostMethod.includes('barrage') || boostMethod.includes('burst')) &&
		!attackStyles.includes(SkillsEnum.Magic)
	) {
		if (attackStyles.includes(SkillsEnum.Defence)) {
			attackStyles = [SkillsEnum.Magic, SkillsEnum.Defence];
		} else {
			attackStyles = [SkillsEnum.Magic];
		}
	}

	if (attackStyles.includes(SkillsEnum.Magic) && attackStyles.includes(SkillsEnum.Ranged)) {
		attackStyles = [SkillsEnum.Magic];
	}
	return attackStyles;
}

interface ResolveAttackStylesParams {
	boostMethod?: PvMMethod[] | readonly PvMMethod[];
	attackStyles: AttackStyles[];
	monster?: KillableMonster;
}

export function addMonsterXPRaw(params: {
	monsterID: number;
	quantity: number;
	duration: number;
	isOnTask: boolean;
	taskQuantity: number | null;
	minimal?: boolean;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	burstOrBarrage?: number;
	superiorCount?: number;
	attackStyles: AttackStyles[];
}) {
	const boostMethod = params.burstOrBarrage ? (['barrage'] as const) : (['none'] as const);
	const maybeMonster = killableMonsters.find(m => m.id === params.monsterID);
	const maybeOSJSMonster = Monsters.get(params.monsterID);
	const attackStyles = resolveAttackStyles({
		monster: maybeMonster,
		boostMethod,
		attackStyles: params.attackStyles
	});
	let hp = miscHpMap[params.monsterID] ?? 1;
	let xpMultiplier = 1;
	const cannonQty = params.cannonMulti
		? randomVariation(Math.floor((xpPercentToCannonM / 100) * params.quantity), xpCannonVaryPercent)
		: params.usingCannon
			? randomVariation(Math.floor((xpPercentToCannon / 100) * params.quantity), xpCannonVaryPercent)
			: 0;

	// Remove superiors from the regular count to be added separately.
	let normalQty = 0;
	let superiorQty = 0;
	let osjsSuperior: Monster | undefined = undefined;
	if (params.isOnTask && params.superiorCount && maybeMonster?.superior) {
		osjsSuperior = maybeMonster.superior;
		if (osjsSuperior?.data?.hitpoints && osjsSuperior?.data?.slayerXP) {
			normalQty = params.quantity - cannonQty - params.superiorCount;
			superiorQty = params.superiorCount;
		} else {
			normalQty = params.quantity - cannonQty;
		}
	} else {
		normalQty = params.quantity - cannonQty;
	}

	// Calculate regular monster XP
	if (maybeMonster?.customMonsterHP) {
		hp = maybeMonster.customMonsterHP;
	} else if (maybeOSJSMonster?.data?.hitpoints) {
		hp = maybeOSJSMonster.data.hitpoints;
	}
	if (maybeMonster?.combatXpMultiplier) {
		xpMultiplier = maybeMonster.combatXpMultiplier;
	}

	// Calculate superior XP:
	let superiorSlayXp = 0;
	let superiorXp = 0;
	if (superiorQty && osjsSuperior?.data?.hitpoints) {
		superiorXp = 4 * superiorQty * osjsSuperior?.data?.hitpoints;
		superiorSlayXp = superiorQty * osjsSuperior?.data?.slayerXP;
	}

	const totalXP = hp * 4 * normalQty * xpMultiplier + superiorXp;
	const xpPerSkill = totalXP / attackStyles.length;

	const xpBank = new XPBank();

	for (const style of attackStyles) {
		xpBank.add(style, Math.floor(xpPerSkill), {
			duration: params.duration,
			minimal: params.minimal ?? true
		});
	}

	if (params.isOnTask) {
		let newSlayerXP = 0;
		if (miscHpMap[params.monsterID]) {
			newSlayerXP += params.taskQuantity! * miscHpMap[params.monsterID];
		} else if (maybeOSJSMonster?.data?.slayerXP) {
			newSlayerXP += params.taskQuantity! * maybeOSJSMonster.data.slayerXP;
		} else {
			newSlayerXP += params.taskQuantity! * hp;
		}
		// Give slayer XP for K'ril + Kree'Arra + Sire
		if (params.monsterID === Monsters.KrilTsutsaroth.id) {
			newSlayerXP += params.taskQuantity! * 142;
		}
		if (params.monsterID === Monsters.Kreearra.id) {
			newSlayerXP += params.taskQuantity! * (132.5 + 124 + 132.5);
		}
		if (params.monsterID === Monsters.AbyssalSire.id) {
			newSlayerXP += params.taskQuantity! * 200;
		}
		xpBank.add('slayer', newSlayerXP + superiorSlayXp, {
			duration: params.duration,
			minimal: params.minimal ?? true
		});
	}

	xpBank.add('hitpoints', Math.floor(hp * normalQty * 1.33 * xpMultiplier + superiorXp / 3), {
		duration: params.duration,
		minimal: params.minimal ?? true
	});

	// Add cannon xp last so it's easy to distinguish
	if (params.usingCannon) {
		xpBank.add('ranged', Math.floor(hp * 2 * cannonQty), {
			duration: params.duration,
			minimal: params.minimal ?? true
		});
	}

	return xpBank;
}

export async function addMonsterXP(user: MUser, params: AddMonsterXpParams) {
	const res = addMonsterXPRaw({ ...params, attackStyles: user.getAttackStyles() });
	const result = await user.addXPBank(res);
	return `**XP Gains:** ${result}`;
}

const gearStyleMap = { melee: GearStat.AttackCrush, mage: GearStat.AttackMagic, range: GearStat.AttackRanged } as const;

export function getAttackStylesContext(styles: AttackStyles | User['attack_style']) {
	let primaryStyle: PrimaryGearSetupType = 'melee';
	if (styles.includes(SkillsEnum.Magic)) primaryStyle = 'mage';
	else if (styles.includes(SkillsEnum.Ranged)) primaryStyle = 'range';
	const relevantGearStat: OffenceGearStat = gearStyleMap[primaryStyle];
	return {
		primaryStyle,
		relevantGearStat
	};
}
