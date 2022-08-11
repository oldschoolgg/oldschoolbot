//import { OffenceGearStat } from './../../gear/types';
import { KlasaUser } from 'klasa';
import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';

import { UserSettings } from '../../settings/types/UserSettings';

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
};

export async function trainCommand(user: KlasaUser, _combatSkill: string | undefined, _attackStyleAndType: string | undefined, _combatSpell: string | undefined) {
	if (user.minionIsBusy) {
		return "You can't change your combat style in the middle of a trip.";
	}
	const oldCombatSkill = user.settings.get(UserSettings.Minion.CombatSkill);
	if (!_combatSkill || typeof _combatSkill !== 'string') {
		return `Your current combat skill is ${oldCombatSkill}. Available combat skill options are: Melee, Ranged, Magic, Auto, NoCombat.`
	}

	if (!_attackStyleAndType) {
		for (const currentEnum of Object.keys(CombatsEnum)) {
			if (currentEnum.toLowerCase() === _combatSkill.toLowerCase()) {
				await mahojiUserSettingsUpdate(user.id, {
					minion_combatSkill: currentEnum as CombatsEnum
				});
				break;
			}
		}

		user.log(`Changed combat skill to ${_combatSkill}`);

		return `${user.minionName} changed main combat skill from ${oldCombatSkill} to ${_combatSkill}.`;
	}

	return `You're now training: ${_attackStyleAndType}. When you do PvM, you will receive XP in these skills.`;
}
