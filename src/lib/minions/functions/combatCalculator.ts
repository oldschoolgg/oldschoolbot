import { attackStyles_enum, combats_enum } from '@prisma/client';
import { randArrItem } from 'e';
import { KlasaUser } from 'klasa';
import { autoEquipCommand } from '../../../mahoji/lib/abstracted_commands/gearCommands';

import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';
import Ancient from '../../skilling/skills/combat/magic/castables/Ancient';
import Standard from '../../skilling/skills/combat/magic/castables/Standard';
import { KillableMonster } from '../types';
import { GearStat } from './../../gear/types';
import { Castable, SkillsEnum } from './../../skilling/types';
import autoPrayerPicker from './autoPrayerPicker';
import mageCalculator from './mageCalculator';
import meleeCalculator from './meleeCalculator';
import rangeCalculator from './rangeCalculator';

// No Lunar at this point, vengence etc isn't useful here.
const castables: Castable[] = [...Standard, ...Ancient];

export default async function combatCalculator(
	monster: KillableMonster,
	user: KlasaUser,
	quantity: number | undefined
): Promise<[number, number, number, number, number, number, string[]]> {
	const mahojiUser = await mahojiUsersSettingsFetch(user.id, { minion_combatSkill: true });
	let combatSkill = mahojiUser.minion_combatSkill;

	if (combatSkill === combats_enum.nocombat) throw "Nocombat shouldn't get here, Error in kill command.";

	if (combatSkill === combats_enum.auto) {
		const defaultMonsterStyle = monster.defaultStyleToUse!;

		if (
			defaultMonsterStyle === GearStat.AttackCrush ||
			defaultMonsterStyle === GearStat.AttackSlash ||
			defaultMonsterStyle === GearStat.AttackStab
		) {
			combatSkill = combats_enum.melee;
			await autoEquipCommand(user, 'melee', defaultMonsterStyle);
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
				if (defaultMonsterStyle.toLowerCase().includes(stance.attack_type!.toLowerCase())) {
					styleArray.push(i);
				}
				i++;
			}
			// Random and store both attack_style and attack_type
			const randomedStyle = randArrItem(styleArray);
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackStyle: weapon.weapon!.stances[randomedStyle].attack_style as attackStyles_enum
			});
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackType: weapon.weapon!.stances[randomedStyle].attack_type
			});
		}

		if (defaultMonsterStyle === GearStat.AttackRanged) {
			combatSkill = combats_enum.ranged;
			await autoEquipCommand(user, 'range', defaultMonsterStyle);
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
					await mahojiUserSettingsUpdate(user.id, {
						minion_rangedAttackStyle: 'rapid' as attackStyles_enum
					});
				}
			}
		}

		if (defaultMonsterStyle === GearStat.AttackMagic) {
			combatSkill = combats_enum.magic;
			await autoEquipCommand(user, 'mage', defaultMonsterStyle);
			await mahojiUserSettingsUpdate(user.id, {
				minion_magicAttackStyle: 'standard' as attackStyles_enum
			});
			// This needs to try check avilable runes somehow
			let CombatSpells = castables.filter(
				_spell =>
					_spell.category.toLowerCase() === 'combat' &&
					_spell.baseMaxHit &&
					user.skillLevel(SkillsEnum.Magic) >= _spell.level
			);
			CombatSpells = CombatSpells.sort((a, b) => b.level - a.level);
			await mahojiUserSettingsUpdate(user.id, {
				minion_combatSpell: CombatSpells[0].name
			});
		}

		if (combatSkill === combats_enum.auto) throw 'No defaultMonsterStyle matched';
		await autoPrayerPicker(user, combatSkill);
	}

	if (combatSkill === null) {
		throw 'No combat skill been set in combatsetup.';
	}

	// Handle multistyle combat here somehow.
	switch (combatSkill) {
		case combats_enum.melee:
			return meleeCalculator(monster, user, quantity);
		case combats_enum.ranged:
			return rangeCalculator(monster, user, quantity);
		case combats_enum.magic:
			return mageCalculator(monster, user, quantity);
	}
}
