import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { NIGHTMARES_HP } from '../../constants';
import { SkillsEnum } from '../../skilling/types';
import killableMonsters from '../data/killableMonsters';
import { KillableMonster } from '../types';

export { default as reducedTimeForGroup } from './reducedTimeForGroup';
export { default as findMonster } from './findMonster';
export { default as calculateMonsterFood } from './calculateMonsterFood';

export type AttackStyles =
	| SkillsEnum.Attack
	| SkillsEnum.Strength
	| SkillsEnum.Defence
	| SkillsEnum.Magic
	| SkillsEnum.Ranged;

export function resolveAttackStyles(
	user: KlasaUser,
	monsterID: number
): [KillableMonster, Monster, AttackStyles[]] {
	const killableMon = killableMonsters.find(m => m.id === monsterID);
	const osjsMon = Monsters.get(monsterID);
	if (!killableMon) {
		throw new Error(`Missing killableMonster for ${monsterID}::${typeof monsterID}`);
	}
	if (!osjsMon) {
		throw new Error(`Missing osjsMon for ${monsterID}::${typeof monsterID}`);
	}

	// The styles chosen by this user to use.
	let attackStyles = user.getAttackStyles();

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles = killableMon.defaultAttackStyles ?? [
		SkillsEnum.Attack,
		SkillsEnum.Strength,
		SkillsEnum.Defence
	];

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (
		attackStyles.length === 0 ||
		attackStyles.some(s => killableMon.disallowedAttackStyles?.includes(s))
	) {
		attackStyles = monsterStyles;
	}

	return [killableMon, osjsMon, attackStyles];
}

const miscHpMap: Record<number, number> = {
	9415: NIGHTMARES_HP,
	3127: 250
};

export async function addMonsterXP(
	user: KlasaUser,
	monsterID: number,
	quantity: number,
	duration: number
) {
	const [, osjsMon, attackStyles] = resolveAttackStyles(user, monsterID);
	const hp = osjsMon.data?.hitpoints || miscHpMap[monsterID] || 1;
	const totalXP = hp * 4 * quantity;
	const xpPerSkill = totalXP / attackStyles.length;

	let res: string[] = [];

	for (const style of attackStyles) {
		res.push(await user.addXP(style, xpPerSkill, duration));
	}

	res.push(await user.addXP(SkillsEnum.Hitpoints, Math.floor(hp * quantity * 1.33), duration));

	return res;
}
