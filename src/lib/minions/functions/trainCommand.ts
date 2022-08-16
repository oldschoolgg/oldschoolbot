import { KlasaUser } from 'klasa';

import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';

export enum CombatsEnum {
	Melee = 'melee',
	Ranged = 'ranged',
	Magic = 'magic',
	Auto = 'auto',
	NoCombat = 'nocombat'
}

export enum AttackStyles {
	Accurate = 'accurate',
	Aggressive = 'aggressive',
	Defensive = 'defensive',
	Controlled = 'controlled',
	Rapid = 'rapid',
	Longrange = 'longrange',
	Standard = 'standard',
	Blaze = 'blaze'
}

export async function trainCommand(
	user: KlasaUser,
	_combatSkill: string | undefined,
	_attackStyleAndType: string | undefined,
	_combatSpell: string | undefined
) {
	if (user.minionIsBusy) {
		return "You can't change your combat style in the middle of a trip.";
	}
	// Fetch another way??
	const oldCombatSkill = user.settings.get(UserSettings.Minion.CombatSkill);
	if (!_combatSkill || typeof _combatSkill !== 'string') {
		return `Your current combat skill is ${oldCombatSkill}. Available combat skill options are: Melee, Ranged, Magic, Auto, NoCombat.`;
	}
	_combatSkill = _combatSkill.toLowerCase();

	for (const currentEnum of Object.keys(CombatsEnum)) {
		if (currentEnum.toLowerCase() === _combatSkill.toLowerCase()) {
			await mahojiUserSettingsUpdate(user.id, {
				minion_combatSkill: currentEnum as CombatsEnum
			});
			break;
		}
	}

	if (!_attackStyleAndType || _combatSpell) {
		return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}.`;
	}
	
	const parsedStyleAndType = _attackStyleAndType
		.toLowerCase()
		.split(', ')
		.map(i => i.trim());

	const attackStyle = parsedStyleAndType[0];
	let attackType: string | undefined = undefined;
	if (parsedStyleAndType.length > 1) {
		attackType = parsedStyleAndType[1];
	}

	if (_combatSkill === CombatsEnum.Melee) {
		await mahojiUserSettingsUpdate(user.id, {
			minion_meleeAttackStyle: attackStyle as AttackStyles
		});
		if (attackType) {
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackType: attackType
			});
		}

		return `${
			user.minionName
		} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}, attack style to ${attackStyle} ${
			attackType ? `and attack type to ${attackType}` : ''
		}.`;
	}

	if (_combatSkill === CombatsEnum.Ranged) {
		await mahojiUserSettingsUpdate(user.id, {
			minion_rangedAttackStyle: attackStyle as AttackStyles
		});

		return `${
			user.minionName
		} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}, attack style to ${attackStyle}.`;
	}

	if (_combatSkill === CombatsEnum.Magic) {
		await mahojiUserSettingsUpdate(user.id, {
			minion_magicAttackStyle: attackStyle as AttackStyles
		});

		if (_combatSpell) {
			const CombatSpells = castables.filter(
				_spell => _spell.category.toLowerCase() === 'combat' && _spell.baseMaxHit
			);

			const Spell = CombatSpells.find(_spell => stringMatches(_spell.name.toLowerCase(), _combatSpell));

			if (!Spell) {
				return `The combat spell \`${_combatSpell}\` dosen't match any of the available combat spells. The following combat spells is possible: ${CombatSpells.map(
					spell => spell.name
				).join(', ')}.`;
			}
			await mahojiUserSettingsUpdate(user.id, {
				minion_combatSpell: Spell.name
			});
		}

		return `${
			user.minionName
		} changed main combat skill from ${oldCombatSkill} to ${_combatSkill} ${_combatSpell ? `and combat spell to ${_combatSpell}` : ''}.`;
	}

	return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}.`;
}
