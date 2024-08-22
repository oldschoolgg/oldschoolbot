import type { User } from '@prisma/client';
import { Monsters } from 'oldschooljs';
import type Monster from 'oldschooljs/dist/structures/Monster';

import { NIGHTMARES_HP } from '../../constants';
import { NexMonster } from '../../nex';
import { SkillsEnum } from '../../skilling/types';
import { randomVariation } from '../../util';
import { xpCannonVaryPercent, xpPercentToCannon, xpPercentToCannonM } from '../data/combatConstants';
import killableMonsters from '../data/killableMonsters';
import { Ignecarus } from '../data/killableMonsters/custom/bosses/Ignecarus';
import { KalphiteKingMonster } from '../data/killableMonsters/custom/bosses/KalphiteKing';
import KingGoldemar from '../data/killableMonsters/custom/bosses/KingGoldemar';
import { NAXXUS_HP, Naxxus } from '../data/killableMonsters/custom/bosses/Naxxus';
import { VasaMagus } from '../data/killableMonsters/custom/bosses/VasaMagus';
import { BSOMonsters } from '../data/killableMonsters/custom/customMonsters';
import type { AddMonsterXpParams, KillableMonster, ResolveAttackStylesParams } from '../types';

export { default as calculateMonsterFood } from './calculateMonsterFood';
export { default as reducedTimeForGroup } from './reducedTimeForGroup';

const attackStylesArr = [
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

function meleeOnly(user: MUser): AttackStyles[] {
	const skills = user.getAttackStyles();
	if (skills.some(skill => skill === SkillsEnum.Ranged || skill === SkillsEnum.Magic)) {
		return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
	}
	return skills;
}
export function resolveAttackStyles(
	user: MUser,
	params: ResolveAttackStylesParams
): [KillableMonster | undefined, Monster | undefined, AttackStyles[]] {
	if (params.monsterID === KingGoldemar.id) return [undefined, undefined, meleeOnly(user)];
	if (params.monsterID === VasaMagus.id) return [undefined, undefined, [SkillsEnum.Magic]];
	if (params.monsterID === NexMonster.id) return [undefined, undefined, [SkillsEnum.Ranged]];
	if (params.monsterID === KalphiteKingMonster.id) return [undefined, undefined, meleeOnly(user)];
	if (params.monsterID === Naxxus.id) {
		return [undefined, undefined, [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Magic]];
	}

	const killableMon = params.monsterID ? killableMonsters.find(m => m.id === params.monsterID) : undefined;

	if (!killableMon) {
		return [undefined, undefined, [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence]];
	}

	const osjsMon = params.monsterID ? Monsters.get(params.monsterID) : undefined;

	// The styles chosen by this user to use.
	let attackStyles = user.getAttackStyles();

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles =
		killableMon?.defaultAttackStyles ??
		attackStylesArr.filter(i => !killableMon?.disallowedAttackStyles?.includes(i)).slice(0, 1);

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (attackStyles.length === 0 || attackStyles.some(s => killableMon?.disallowedAttackStyles?.includes(s))) {
		attackStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		params.boostMethod &&
		(params.boostMethod.includes('barrage') || params.boostMethod.includes('burst')) &&
		!attackStyles.includes(SkillsEnum.Magic)
	) {
		if (attackStyles.includes(SkillsEnum.Defence)) {
			attackStyles = [SkillsEnum.Magic, SkillsEnum.Defence];
		} else {
			attackStyles = [SkillsEnum.Magic];
		}
	}
	return [killableMon, osjsMon, attackStyles];
}

export async function addMonsterXP(user: MUser, params: AddMonsterXpParams) {
	const boostMethod = params.burstOrBarrage ? ['barrage'] : ['none'];

	const [, osjsMon, attackStyles] = resolveAttackStyles(user, {
		monsterID: params.monsterID,
		boostMethod
	});
	const monster = killableMonsters.find(mon => mon.id === params.monsterID);
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
	if (params.isOnTask && params.superiorCount && monster?.superior) {
		osjsSuperior = monster.superior;
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
	if (monster?.customMonsterHP) {
		hp = monster.customMonsterHP;
	} else if (osjsMon?.data?.hitpoints) {
		hp = osjsMon.data.hitpoints;
	}
	if (monster?.combatXpMultiplier) {
		xpMultiplier = monster.combatXpMultiplier;
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

	const res: string[] = [];

	for (const style of attackStyles) {
		res.push(
			await user.addXP({
				skillName: style,
				amount: Math.floor(xpPerSkill),
				duration: params.duration,
				minimal: params.minimal ?? true
			})
		);
	}

	if (params.isOnTask) {
		let newSlayerXP = 0;
		if (miscHpMap[params.monsterID]) {
			newSlayerXP += params.taskQuantity! * miscHpMap[params.monsterID];
		} else if (osjsMon?.data?.slayerXP) {
			newSlayerXP += params.taskQuantity! * osjsMon.data.slayerXP;
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
		res.push(
			await user.addXP({
				skillName: SkillsEnum.Slayer,
				amount: newSlayerXP + superiorSlayXp,
				duration: params.duration,
				minimal: params.minimal ?? true
			})
		);
	}

	res.push(
		await user.addXP({
			skillName: SkillsEnum.Hitpoints,
			amount: Math.floor(hp * normalQty * 1.33 * xpMultiplier + superiorXp / 3),
			duration: params.duration,
			minimal: params.minimal ?? true
		})
	);

	// Add cannon xp last so it's easy to distinguish
	if (params.usingCannon) {
		res.push(
			await user.addXP({
				skillName: SkillsEnum.Ranged,
				amount: Math.floor(hp * 2 * cannonQty),
				duration: params.duration,
				minimal: params.minimal ?? true
			})
		);
	}

	return `**XP Gains:** ${res.join(' ')}`;
}

export function convertAttackStylesToSetup(styles: AttackStyles | User['attack_style']): 'melee' | 'range' | 'mage' {
	if (styles.includes(SkillsEnum.Magic)) return 'mage';
	if (styles.includes(SkillsEnum.Ranged)) return 'range';
	return 'melee';
}
