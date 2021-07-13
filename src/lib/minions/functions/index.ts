import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { NIGHTMARES_HP } from '../../constants';
import { SkillsEnum } from '../../skilling/types';
import { randomVariation } from '../../util';
import { xpCannonVaryPercent, xpPercentToCannon, xpPercentToCannonM } from '../data/combatConstants';
import killableMonsters from '../data/killableMonsters';
import { AddMonsterXpParams, KillableMonster, ResolveAttackStylesParams } from '../types';

export { default as calculateMonsterFood } from './calculateMonsterFood';
export { default as reducedTimeForGroup } from './reducedTimeForGroup';

export type AttackStyles =
	| SkillsEnum.Attack
	| SkillsEnum.Strength
	| SkillsEnum.Defence
	| SkillsEnum.Magic
	| SkillsEnum.Ranged;

const miscHpMap: Record<number, number> = {
	9415: NIGHTMARES_HP,
	3127: 250
};

export function resolveAttackStyles(
	user: KlasaUser,
	params: ResolveAttackStylesParams
): [KillableMonster | undefined, Monster | undefined, AttackStyles[]] {
	const killableMon = killableMonsters.find(m => m.id === params.monsterID);
	const osjsMon = Monsters.get(params.monsterID);

	// The styles chosen by this user to use.
	let attackStyles = user.getAttackStyles();

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles = killableMon?.defaultAttackStyles ?? [
		SkillsEnum.Attack,
		SkillsEnum.Strength,
		SkillsEnum.Defence
	];

	if (
		[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic, SkillsEnum.Ranged].every(s =>
			monsterStyles.includes(s as AttackStyles)
		)
	) {
		// If the monsterStyles match this array, that means it needs to use all 3 styles
		attackStyles = [
			SkillsEnum.Magic,
			SkillsEnum.Ranged,
			...attackStyles.filter(s => {
				if ([SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence].includes(s)) return s as AttackStyles;
			})
		];
		if (
			![SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence].some(s =>
				attackStyles.includes(s as AttackStyles)
			)
		) {
			attackStyles.push(SkillsEnum.Attack as AttackStyles);
		}
	} else if (attackStyles.length === 0 || attackStyles.some(s => killableMon?.disallowedAttackStyles?.includes(s))) {
		// If their attack style can't be used on this monster, or they have no selected attack styles selected,
		// use the monsters default attack style.
		attackStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		params.boostMethod &&
		(params.boostMethod === 'barrage' || params.boostMethod === 'burst') &&
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

export async function addMonsterXP(user: KlasaUser, params: AddMonsterXpParams) {
	const boostMethod = params.burstOrBarrage ? 'barrage' : 'none';

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
	if (monster && monster.customMonsterHP) {
		hp = monster.customMonsterHP;
	} else if (osjsMon?.data?.hitpoints) {
		hp = osjsMon.data.hitpoints;
	}
	if (monster && monster.combatXpMultiplier) {
		xpMultiplier = monster.combatXpMultiplier;
	}

	// Calculate superior XP:
	let superiorSlayXp = 0;
	let superiorXp = 0;
	if (superiorQty) {
		superiorXp = 4 * superiorQty * osjsSuperior!.data!.hitpoints;
		superiorSlayXp = superiorQty * osjsSuperior!.data!.slayerXP;
	}

	const totalXP = hp * 4 * normalQty * xpMultiplier + superiorXp;
	const xpPerSkill = totalXP / attackStyles.length;

	let res: string[] = [];

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
		if (osjsMon?.data?.slayerXP) {
			newSlayerXP += params.taskQuantity! * osjsMon.data.slayerXP;
		} else {
			newSlayerXP += params.taskQuantity! * hp;
		}
		// Give slayer XP for K'ril + Kree'Arra
		if (params.monsterID === Monsters.KrilTsutsaroth.id) {
			newSlayerXP += params.taskQuantity! * 142;
		}
		if (params.monsterID === Monsters.Kreearra.id) {
			newSlayerXP += params.taskQuantity! * (132.5 + 124 + 132.5);
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
