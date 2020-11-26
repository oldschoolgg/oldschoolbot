import { KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';
import { KillableMonster } from '../types';
import { GearSetupTypes } from './../../gear/types';
import { SkillsEnum } from './../../skilling/types';

export default async function combatXPReciever(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number,
	hits: number
) {
	// Returned XP and level up string.
	let str = '';
	let spell;
	const combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);
	if (combatSkill === 'mage') {
		const combatSpell = user.settings.get(UserSettings.Minion.CombatSpell);
		if (combatSpell === null) {
			console.log('Spell is null.');
			return str;
		}
		spell = castables.find(_spell =>
			stringMatches(_spell.name.toLowerCase(), combatSpell.toLowerCase())
		);
	}
	const currentMonsterData = Monsters.find(mon => mon.id === monster.id)?.data;
	if (!currentMonsterData) {
		console.log("Monster dosen't exist.");
		return str;
	}
	if (combatSkill === null) {
		console.log('No good default');
		return str;
	}
	/*
	// Move out of function.
	if (monster.immuneToCombatSkills && combatSkill != null) {
		for (let cs of monster.immuneToCombatSkills) {
			if (cs.toString().toLowerCase() === combatSkill.toLowerCase()) {
				console.log('I do what I want, catch me outside.');
				return;
			}
		}
    }
    */

	const monsterHP = currentMonsterData.hitpoints;
	const totalHP = monsterHP * quantity;
	const currentAttackLevel = user.skillLevel(SkillsEnum.Attack);
	const currentStrengthLevel = user.skillLevel(SkillsEnum.Strength);
	const currentDefenceLevel = user.skillLevel(SkillsEnum.Defence);
	const currentRangedLevel = user.skillLevel(SkillsEnum.Ranged);
	const currentMagicLevel = user.skillLevel(SkillsEnum.Magic);
	const currentHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
	let newAttackLevel = user.skillLevel(SkillsEnum.Attack);
	let newStrengthLevel = user.skillLevel(SkillsEnum.Strength);
	let newDefenceLevel = user.skillLevel(SkillsEnum.Defence);
	let newRangedLevel = user.skillLevel(SkillsEnum.Ranged);
	let newMagicLevel = user.skillLevel(SkillsEnum.Magic);
	let newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);

	const meleeCombatStyle = user.settings.get(UserSettings.Minion.MeleeCombatStyle);
	const meleeWeapon = user.equippedWeapon(GearSetupTypes.Melee);
	let meleeAttackStyle = '';

	const rangeCombatStyle = user.settings.get(UserSettings.Minion.RangeCombatStyle);
	const rangeWeapon = user.equippedWeapon(GearSetupTypes.Range);

	const mageCombatStyle = user.settings.get(UserSettings.Minion.MageCombatStyle);

	switch (combatSkill) {
		case 'melee':
			if (meleeWeapon === null || meleeWeapon.weapon === null) {
				console.log('Weapon is null.');
				return str;
			}
			for (let stance of meleeWeapon.weapon.stances) {
				if (stance.combat_style.toLowerCase() === meleeCombatStyle) {
					meleeAttackStyle = stance.attack_style;
					break;
				}
			}
			switch (meleeAttackStyle.toLowerCase()) {
				case 'accurate':
					await user.addXP(SkillsEnum.Attack, 4 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newAttackLevel = user.skillLevel(SkillsEnum.Attack);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						4 * totalHP
					).toLocaleString()} Attack XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newAttackLevel > currentAttackLevel) {
						str += `\n\n${user.minionName}'s Attack level is now ${newAttackLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'aggressive':
					await user.addXP(SkillsEnum.Strength, 4 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newStrengthLevel = user.skillLevel(SkillsEnum.Strength);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						4 * totalHP
					).toLocaleString()} Strength XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newStrengthLevel > currentStrengthLevel) {
						str += `\n\n${user.minionName}'s Strength level is now ${newStrengthLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'defensive':
					await user.addXP(SkillsEnum.Defence, 4 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newDefenceLevel = user.skillLevel(SkillsEnum.Defence);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						4 * totalHP
					).toLocaleString()} Defence XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newDefenceLevel > currentDefenceLevel) {
						str += `\n\n${user.minionName}'s Defence level is now ${newDefenceLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'controlled':
					await user.addXP(SkillsEnum.Attack, Math.round(1.33 * totalHP));
					await user.addXP(SkillsEnum.Strength, Math.round(1.33 * totalHP));
					await user.addXP(SkillsEnum.Defence, Math.round(1.33 * totalHP));
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newAttackLevel = user.skillLevel(SkillsEnum.Attack);
					newStrengthLevel = user.skillLevel(SkillsEnum.Strength);
					newDefenceLevel = user.skillLevel(SkillsEnum.Defence);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Attack XP, ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Strength XP, ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Defence XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newAttackLevel > currentAttackLevel) {
						str += `\n\n${user.minionName}'s Attack level is now ${newAttackLevel}!`;
					}
					if (newStrengthLevel > currentStrengthLevel) {
						str += `\n\n${user.minionName}'s Strength level is now ${newStrengthLevel}!`;
					}
					if (newDefenceLevel > currentDefenceLevel) {
						str += `\n\n${user.minionName}'s Defence level is now ${newDefenceLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
			}
			break;
		case 'range':
			if (rangeWeapon === null || rangeWeapon.weapon === null) {
				console.log('Weapon is null.');
				return str;
			}
			if (rangeCombatStyle === null) {
				console.log('Range combat style is null.');
				return str;
			}
			switch (rangeCombatStyle.toLowerCase()) {
				case 'accurate':
					await user.addXP(SkillsEnum.Ranged, 4 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newRangedLevel = user.skillLevel(SkillsEnum.Ranged);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						4 * totalHP
					).toLocaleString()} Ranged XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newRangedLevel > currentRangedLevel) {
						str += `\n\n${user.minionName}'s Ranged level is now ${newRangedLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'rapid':
					await user.addXP(SkillsEnum.Ranged, 4 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newRangedLevel = user.skillLevel(SkillsEnum.Ranged);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						4 * totalHP
					).toLocaleString()} Ranged XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newRangedLevel > currentRangedLevel) {
						str += `\n\n${user.minionName}'s Ranged level is now ${newRangedLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'longrange':
					await user.addXP(SkillsEnum.Ranged, 2 * totalHP);
					await user.addXP(SkillsEnum.Defence, 2 * totalHP);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newRangedLevel = user.skillLevel(SkillsEnum.Ranged);
					newDefenceLevel = user.skillLevel(SkillsEnum.Defence);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(2 * totalHP).toLocaleString()} Ranged XP, ${(
						2 * totalHP
					).toLocaleString()} Defence XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newRangedLevel > currentRangedLevel) {
						str += `\n\n${user.minionName}'s Ranged level is now ${newRangedLevel}!`;
					}
					if (newDefenceLevel > currentDefenceLevel) {
						str += `\n\n${user.minionName}'s Ranged level is now ${newDefenceLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
			}
			break;
		case 'mage':
			switch (mageCombatStyle) {
				case 'standard':
					await user.addXP(SkillsEnum.Magic, 2 * totalHP + hits * spell?.magicxp!);
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newMagicLevel = user.skillLevel(SkillsEnum.Magic);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						2 * totalHP +
						hits * spell?.magicxp!
					).toLocaleString()} Magic XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newMagicLevel > currentMagicLevel) {
						str += `\n\n${user.minionName}'s Magic level is now ${newMagicLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
				case 'defensive':
					await user.addXP(
						SkillsEnum.Magic,
						Math.round(1.33 * totalHP) + hits * spell?.magicxp!
					);
					await user.addXP(SkillsEnum.Defence, Number(totalHP));
					await user.addXP(SkillsEnum.Hitpoints, Math.round(1.33 * totalHP));
					newMagicLevel = user.skillLevel(SkillsEnum.Magic);
					newDefenceLevel = user.skillLevel(SkillsEnum.Defence);
					newHitpointsLevel = user.skillLevel(SkillsEnum.Hitpoints);
					str = `\nYou also received ${(
						Math.round(1.33 * totalHP) +
						hits * spell?.magicxp!
					).toLocaleString()} Magic XP, ${Number(
						totalHP
					).toLocaleString()} Defence XP and ${Math.round(
						1.33 * totalHP
					).toLocaleString()} Hitpoints XP.`;
					if (newMagicLevel > currentMagicLevel) {
						str += `\n\n${user.minionName}'s Magic level is now ${newMagicLevel}!`;
					}
					if (newDefenceLevel > currentDefenceLevel) {
						str += `\n\n${user.minionName}'s Defence level is now ${newDefenceLevel}!`;
					}
					if (newHitpointsLevel > currentHitpointsLevel) {
						str += `\n\n${user.minionName}'s Hitpoints level is now ${newHitpointsLevel}!`;
					}
					return str;
			}
			break;
	}
	return '\nNot working..';
}
