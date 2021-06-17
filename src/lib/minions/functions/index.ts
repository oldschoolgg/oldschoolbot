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

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (attackStyles.length === 0 || attackStyles.some(s => killableMon?.disallowedAttackStyles?.includes(s))) {
		attackStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		params.boostMethod &&
		(params.boostMethod === 'barrage' || params.boostMethod === 'burst') &&
		!attackStyles.includes(SkillsEnum.Magic)
	) {
		attackStyles = [SkillsEnum.Magic];
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

	const normalQty = params.quantity - cannonQty;

	if (monster && monster.customMonsterHP) {
		hp = monster.customMonsterHP;
	} else if (osjsMon?.data?.hitpoints) {
		hp = osjsMon.data.hitpoints;
	}
	if (monster && monster.combatXpMultiplier) {
		xpMultiplier = monster.combatXpMultiplier;
	}
	const totalXP = hp * 4 * normalQty * xpMultiplier;
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
				amount: newSlayerXP,
				duration: params.duration,
				minimal: params.minimal ?? true
			})
		);
	}

	res.push(
		await user.addXP({
			skillName: SkillsEnum.Hitpoints,
			amount: Math.floor(hp * params.quantity * 1.33 * xpMultiplier),
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
