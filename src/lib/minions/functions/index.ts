import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { CombatsEnum } from '../../../commands/Minion/combatsetup';
import { NIGHTMARES_HP } from '../../constants';
import { GearStat } from '../../gear';
import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { Castable, SkillsEnum } from '../../skilling/types';
import { randomVariation, stringMatches } from '../../util';
import { xpCannonVaryPercent, xpPercentToCannon, xpPercentToCannonM } from '../data/combatConstants';
import killableMonsters from '../data/killableMonsters';
import { AddMonsterXpParams, KillableMonster, ResolveAttackStylesParams } from '../types';

export { default as calculateMonsterFood } from './calculateMonsterFood';
export { default as reducedTimeForGroup } from './reducedTimeForGroup';

export const combatStylesArr = [
	SkillsEnum.Attack,
	SkillsEnum.Strength,
	SkillsEnum.Defence,
	SkillsEnum.Magic,
	SkillsEnum.Ranged
] as const;
export type CombatStyles = typeof combatStylesArr[number];

const miscHpMap: Record<number, number> = {
	9415: NIGHTMARES_HP,
	3127: 250
};

export function resolveCombatStyles(
	user: KlasaUser,
	params: ResolveAttackStylesParams
): [KillableMonster | undefined, Monster | undefined, CombatStyles[]] {
	const killableMon = killableMonsters.find(m => m.id === params.monsterID);
	const osjsMon = Monsters.get(params.monsterID);

	// The styles chosen by this user to use.
	let combatStyles = user.getCombatStyles();

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles =
		killableMon?.defaultCombatStyles ??
		combatStylesArr.filter(i => !killableMon?.disallowedCombatStyles?.includes(i)).slice(0, 1);

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (combatStyles.length === 0 || combatStyles.some(s => killableMon?.disallowedCombatStyles?.includes(s))) {
		combatStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		params.boostMethod &&
		(params.boostMethod === 'barrage' || params.boostMethod === 'burst') &&
		!combatStyles.includes(SkillsEnum.Magic)
	) {
		if (combatStyles.includes(SkillsEnum.Defence)) {
			combatStyles = [SkillsEnum.Magic, SkillsEnum.Defence];
		} else {
			combatStyles = [SkillsEnum.Magic];
		}
	}
	return [killableMon, osjsMon, combatStyles];
}

export async function addMonsterXP(user: KlasaUser, params: AddMonsterXpParams) {
	const boostMethod = params.burstOrBarrage ? 'barrage' : 'none';

	let [, osjsMon] = resolveCombatStyles(user, {
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

	let spell: Castable | undefined = undefined;
	let combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);
	if (combatSkill === CombatsEnum.Auto && monster) {
		const defaultMonsterStyle = monster.defaultStyleToUse;
		if (
			defaultMonsterStyle === GearStat.AttackCrush ||
			defaultMonsterStyle === GearStat.AttackSlash ||
			defaultMonsterStyle === GearStat.AttackStab
		) {
			combatSkill = CombatsEnum.Melee;
		}

		if (defaultMonsterStyle === GearStat.AttackRanged) {
			combatSkill = CombatsEnum.Range;
		}

		if (defaultMonsterStyle === GearStat.AttackMagic) {
			combatSkill = CombatsEnum.Mage;
		}
	}

	if (combatSkill === null) {
		return 'No combatSkill found or selected.';
	}

	// Calculate superior XP:
	let superiorSlayXp = 0;
	let superiorHP = 0;
	if (superiorQty) {
		superiorHP = superiorQty * osjsSuperior!.data!.hitpoints;
		superiorSlayXp = superiorQty * osjsSuperior!.data!.slayerXP;
	}

	const totalHP = hp * normalQty * xpMultiplier + superiorHP;

	// Check what attack style
	let attackStyle: string = '';
	let res: string[] = [];
	if (combatSkill === CombatsEnum.Mage) {
		const combatSpell = user.settings.get(UserSettings.Minion.CombatSpell);
		if (combatSpell === null) {
			return 'Spell is null.';
		}
		spell = castables.find(_spell => stringMatches(_spell.name.toLowerCase(), combatSpell.toLowerCase()));
		const mageCombatStyle = user.settings.get(UserSettings.Minion.MageCombatStyle)!.replace(/[^a-zA-Z0-9]/g, '');
		switch (mageCombatStyle) {
			case 'standard':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Magic,
						amount: Math.floor(2 * totalHP + (params.hits ?? 0) * spell!.magicxp),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'defensive':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Magic,
						amount: Math.floor(1.33 * totalHP + (params.hits ?? 0) * spell!.magicxp),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Defence,
						amount: Math.floor(totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'accurate':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Magic,
						amount: Math.floor(2 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'longrange':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Magic,
						amount: Math.floor(1.33 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Defence,
						amount: Math.floor(totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			default:
				return 'No attack style found or selected.';
		}
	}
	if (combatSkill === CombatsEnum.Melee) {
		attackStyle = user.settings.get(UserSettings.Minion.MeleeAttackStyle)!.replace(/[^a-zA-Z0-9]/g, '');
		switch (attackStyle) {
			case 'accurate':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Attack,
						amount: Math.floor(4 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'aggressive':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Strength,
						amount: Math.floor(4 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'defensive':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Defence,
						amount: Math.floor(4 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'controlled':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Attack,
						amount: Math.floor(1.33 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Strength,
						amount: Math.floor(1.33 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Defence,
						amount: Math.floor(1.33 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			default:
				return 'No attack style found or selected.';
		}
	}
	if (combatSkill === CombatsEnum.Range) {
		attackStyle = user.settings.get(UserSettings.Minion.RangeAttackStyle)!.replace(/[^a-zA-Z0-9]/g, '');
		switch (attackStyle) {
			case 'accurate':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Ranged,
						amount: Math.floor(4 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'rapid':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Ranged,
						amount: Math.floor(4 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			case 'longrange':
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Ranged,
						amount: Math.floor(2 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				res.push(
					await user.addXP({
						skillName: SkillsEnum.Defence,
						amount: Math.floor(2 * totalHP),
						duration: params.duration,
						minimal: params.minimal ?? true
					})
				);
				break;
			default:
				return 'No attack style found or selected.';
		}
	}

	if (params.isOnTask) {
		let newSlayerXP = 0;
		if (osjsMon?.data?.slayerXP) {
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
			amount: Math.floor(totalHP * 1.33 * xpMultiplier),
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

export function convertCombatStylesToSetup(styles: CombatStyles | User['combat_style']): 'melee' | 'range' | 'mage' {
	if (styles.includes(SkillsEnum.Magic)) return 'mage';
	if (styles.includes(SkillsEnum.Ranged)) return 'range';
	return 'melee';
}
