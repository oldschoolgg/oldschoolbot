import { KlasaUser } from 'klasa';

import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';

import castables from '../../skilling/skills/combat/magic/castables';
import { stringMatches } from '../../util';
import { attackStyles_enum, combats_enum } from '.prisma/client';

export async function trainCommand(
	user: KlasaUser,
	_combatSkill: string | undefined,
	_attackStyleAndType: string | undefined,
	_combatSpell: string | undefined
) {
	if (user.minionIsBusy) {
		return "You can't change your combat style in the middle of a trip.";
	}

	const mahojiUser = await mahojiUsersSettingsFetch(user.id,{minion_combatSkill: true});
	const oldCombatSkill = mahojiUser.minion_combatSkill;
	if (!_combatSkill || typeof _combatSkill !== 'string') {
		return `Your current combat skill is ${oldCombatSkill}. Available combat skill options are: Melee, Ranged, Magic, Auto, NoCombat.`;
	}
	_combatSkill = _combatSkill.toLowerCase();

	for (const currentEnum of Object.keys(combats_enum)) {
		if (currentEnum.toLowerCase() === _combatSkill.toLowerCase()) {
			await mahojiUserSettingsUpdate(user.id, {
				minion_combatSkill: combats_enum[currentEnum as keyof typeof combats_enum]
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

	if (_combatSkill === combats_enum.melee && attackType) {
		//check so the actual/fist settings match viable options
		await mahojiUserSettingsUpdate(user.id, {
			minion_meleeAttackStyle: attackStyle as attackStyles_enum
		});

		await mahojiUserSettingsUpdate(user.id, {
			minion_meleeAttackType: attackType
		});

		return `${
			user.minionName
		} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}, attack style to ${attackStyle} ${
			attackType ? `and attack type to ${attackType}` : ''
		}.`;
	}

	if (_combatSkill === combats_enum.ranged) {
		//check so the actual settings match viable options
		await mahojiUserSettingsUpdate(user.id, {
			minion_rangedAttackStyle: attackStyle as attackStyles_enum
		});

		return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}, attack style to ${attackStyle}.`;
	}

	if (_combatSkill === combats_enum.magic) {
		//check so the actual settings match viable options
		await mahojiUserSettingsUpdate(user.id, {
			minion_magicAttackStyle: attackStyle as attackStyles_enum
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

		return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill} ${
			_combatSpell ? `and combat spell to ${_combatSpell}` : ''
		}.`;
	}

	return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}.`;
}
