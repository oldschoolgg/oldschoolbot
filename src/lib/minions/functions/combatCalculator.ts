import { KlasaMessage } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import Ancient from '../../skilling/skills/combat/magic/castables/Ancient';
import Standard from '../../skilling/skills/combat/magic/castables/Standard';
import { randomItemFromArray } from '../../util';
import { KillableMonster } from '../types';
import { CombatsEnum } from './../../../commands/Minion/combatsetup';
import { GearSetupTypes, GearStat } from './../../gear/types';
import { Castable, SkillsEnum } from './../../skilling/types';
import autoPrayerPicker from './autoPrayerPicker';
import mageCalculator from './mageCalculator';
import meleeCalculator from './meleeCalculator';
import rangeCalculator from './rangeCalculator';

// No Lunar at this point, vengence etc isn't useful here.
const castables: Castable[] = [...Standard, ...Ancient];

export default async function combatCalculator(
	monster: KillableMonster,
	msg: KlasaMessage,
	quantity: number | null
): Promise<[number, number, number, number, number, string[]]> {
	let combatSkill = msg.author.settings.get(UserSettings.Minion.CombatSkill);

	if (combatSkill === CombatsEnum.NoCombat)
		throw `Nocombat shouldn't get here, Error in kill command.`;

	if (combatSkill === CombatsEnum.Auto) {
		const defaultMonsterStyle = monster.defaultStyleToUse;
		const style = defaultMonsterStyle.substr(7);

		if (
			defaultMonsterStyle === GearStat.AttackCrush ||
			defaultMonsterStyle === GearStat.AttackSlash ||
			defaultMonsterStyle === GearStat.AttackStab
		) {
			combatSkill = CombatsEnum.Melee;
			await msg.client.commands
				.get('autoequip')!
				.run(msg, [combatSkill, 'attack', style, null, true]);
			const weapon = msg.author.equippedWeapon(GearSetupTypes.Melee);
			if (weapon === null || weapon.weapon === null) {
				throw `No weapon is equipped.`;
			}
			let i = 0;
			let styleArray = [];
			for (let stance of weapon.weapon.stances) {
				if (stance === null) {
					i++;
					continue;
				}
				if (stance.attack_type.toLowerCase() === style.toLowerCase()) {
					styleArray.push(i);
				}
				i++;
			}
			await msg.author.settings.update(
				UserSettings.Minion.MeleeCombatStyle,
				weapon.weapon.stances[randomItemFromArray(styleArray)].combat_style
			);
		}

		if (defaultMonsterStyle === GearStat.AttackRanged) {
			combatSkill = CombatsEnum.Range;
			await msg.client.commands
				.get('autoequip')!
				.run(msg, [combatSkill, 'attack', style, null, true]);
			const weapon = msg.author.equippedWeapon(GearSetupTypes.Range);
			if (weapon === null || weapon.weapon === null) {
				throw `No weapon is equipped.`;
			}
			for (let stance of weapon.weapon.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === 'rapid') {
					await msg.author.settings.update(
						UserSettings.Minion.RangeCombatStyle,
						stance.combat_style
					);
					break;
				}
			}
		}

		if (defaultMonsterStyle === GearStat.AttackMagic) {
			combatSkill = CombatsEnum.Mage;
			await msg.client.commands
				.get('autoequip')!
				.run(msg, [combatSkill, 'attack', style, null, true]);
			await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, 'standard');

			let CombatSpells = castables.filter(
				_spell =>
					_spell.category.toLowerCase() === 'combat' &&
					_spell.baseMaxHit &&
					msg.author.skillLevel(SkillsEnum.Magic) >= _spell.level
			);
			CombatSpells = CombatSpells.sort((a, b) => b.level - a.level);
			await msg.author.settings.update(UserSettings.Minion.CombatSpell, CombatSpells[0].name);
		}

		if (combatSkill === CombatsEnum.Auto) throw `No defaultMonsterStyle matched`;
		await autoPrayerPicker(msg, combatSkill);
	}

	if (combatSkill === null) {
		throw `No combat skill been set in combatsetup.`;
	}

	// Handle multistyle combat here somehow.
	switch (combatSkill) {
		case CombatsEnum.Melee:
			return meleeCalculator(monster, msg.author, quantity);
		case CombatsEnum.Range:
			return rangeCalculator(monster, msg.author, quantity);
		case CombatsEnum.Mage:
			return mageCalculator(monster, msg.author, quantity);
	}
}
