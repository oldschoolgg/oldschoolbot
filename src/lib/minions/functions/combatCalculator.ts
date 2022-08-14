import { randArrItem } from 'e';
import { KlasaUser } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import Ancient from '../../skilling/skills/combat/magic/castables/Ancient';
import Standard from '../../skilling/skills/combat/magic/castables/Standard';
import { KillableMonster } from '../types';
import { GearStat } from './../../gear/types';
import { Castable, SkillsEnum } from './../../skilling/types';
import autoPrayerPicker from './autoPrayerPicker';
import mageCalculator from './mageCalculator';
import meleeCalculator from './meleeCalculator';
import rangeCalculator from './rangeCalculator';
import { CombatsEnum } from './trainCommand';

// No Lunar at this point, vengence etc isn't useful here.
const castables: Castable[] = [...Standard, ...Ancient];

export default async function combatCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number | undefined
): Promise<[number, number, number, number, number, number, string[]]> {
	let combatSkill = user.settings.get(UserSettings.Minion.CombatSkill);

	if (combatSkill === CombatsEnum.NoCombat) throw "Nocombat shouldn't get here, Error in kill command.";

	if (combatSkill === CombatsEnum.Auto) {
		const defaultMonsterStyle = monster.defaultStyleToUse;
		const style = defaultMonsterStyle!;

		if (
			defaultMonsterStyle === GearStat.AttackCrush ||
			defaultMonsterStyle === GearStat.AttackSlash ||
			defaultMonsterStyle === GearStat.AttackStab
		) {
			combatSkill = CombatsEnum.Melee;
			//	await user.client.commands.get('autoequip')!.run(, [combatSkill, 'attack', style, null, true]);
			const weapon = user.getGear('melee').equippedWeapon();
			if (weapon === null || weapon.weapon === null) {
				throw 'No weapon is equipped.';
			}
			let i = 0;
			let styleArray = [];
			for (let stance of weapon.weapon!.stances) {
				if (stance === null) {
					i++;
					continue;
				}
				if (stance.attack_type!.toLowerCase() === style.toLowerCase()) {
					styleArray.push(i);
				}
				i++;
			}
			// Random and store both attack_style and attack_type
			await user.settings.update(
				UserSettings.Minion.MeleeAttackStyle,
				weapon.weapon!.stances[randArrItem(styleArray)].attack_style
			);
		}

		if (defaultMonsterStyle === GearStat.AttackRanged) {
			combatSkill = CombatsEnum.Ranged;
			//		await user.client.commands.get('autoequip')!.run(msg, [combatSkill, 'attack', style, null, true]);
			const weapon = user.getGear('range').equippedWeapon();
			if (weapon === null || weapon.weapon === null) {
				throw 'No weapon is equipped.';
			}
			// Pick random, rapid might not always exist and update both attack style and attack type
			for (let stance of weapon.weapon!.stances) {
				if (stance === null) {
					continue;
				}
				if (stance.combat_style.toLowerCase() === 'rapid') {
					await user.settings.update(UserSettings.Minion.RangedAttackStyle, stance.attack_style);
					break;
				}
			}
		}

		if (defaultMonsterStyle === GearStat.AttackMagic) {
			combatSkill = CombatsEnum.Magic;
			//		await user.client.commands.get('autoequip')!.run(msg, [combatSkill, 'attack', style, null, true]);
			await user.settings.update(UserSettings.Minion.MagicAttackStyle, 'standard');
			// This needs to try check avilable runes somehow
			let CombatSpells = castables.filter(
				_spell =>
					_spell.category.toLowerCase() === 'combat' &&
					_spell.baseMaxHit &&
					user.skillLevel(SkillsEnum.Magic) >= _spell.level
			);
			CombatSpells = CombatSpells.sort((a, b) => b.level - a.level);
			await user.settings.update(UserSettings.Minion.CombatSpell, CombatSpells[0].name);
		}

		if (combatSkill === CombatsEnum.Auto) throw 'No defaultMonsterStyle matched';
		await autoPrayerPicker(user, combatSkill);
	}

	if (combatSkill === null) {
		throw 'No combat skill been set in combatsetup.';
	}

	// Handle multistyle combat here somehow.
	switch (combatSkill) {
		case CombatsEnum.Melee:
			return meleeCalculator(monster, user, quantity);
		case CombatsEnum.Ranged:
			return rangeCalculator(monster, user, quantity);
		case CombatsEnum.Magic:
			return mageCalculator(monster, user, quantity);
	}
}
