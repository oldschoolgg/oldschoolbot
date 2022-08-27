import { Item } from 'oldschooljs/dist/meta/types';
import { KlasaUser } from 'klasa';

import { mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';
import { attackStyles_enum } from '.prisma/client';
import { randArrItem } from 'e';

export async function pickStyleFromGearCommand(
	user: KlasaUser,
	_setup: 'melee' | 'range' | 'mage',
	_newWeapon: Item | null,
) {
	if (user.minionIsBusy) {
		return "You can't change your combat style in the middle of a trip.";
	}
	const mahojiUser = await mahojiUsersSettingsFetch(user.id);
	let i = 0;
	let styleArray:number[] = [];

	if (_setup === 'melee') {
		const oldAttackStyle = mahojiUser.minion_meleeAttackStyle;
		const oldAttackType = mahojiUser.minion_meleeAttackType;
		if (_newWeapon === null || _newWeapon.weapon === null || !_newWeapon.weapon) {
			//Unarmed is always crush
			if (oldAttackStyle === null || oldAttackStyle !== (attackStyles_enum.accurate || attackStyles_enum.aggressive || attackStyles_enum.defensive)) {
				await mahojiUserSettingsUpdate(user.id, {
					minion_meleeAttackStyle: 'accurate' as attackStyles_enum
				});
			}
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackType: 'crush'
			});
			return ``;
		}
		for (let stance of _newWeapon.weapon.stances) {
			if (stance === null || (oldAttackStyle !== stance.attack_style)) {
				i++
				continue;
			}
			if (oldAttackType !== stance.attack_type) {
				styleArray.push(i);
				i++;
				continue;
			}
			//Matched
			return ``;
		}
		if (styleArray.length !== 0) {
			const randomedStyle = randArrItem(styleArray);
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackStyle: _newWeapon.weapon.stances[randomedStyle].attack_style as attackStyles_enum
			});
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackType: _newWeapon.weapon.stances[randomedStyle].attack_type
			});
		}
		else {
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackStyle: _newWeapon.weapon.stances[0].attack_style as attackStyles_enum
			});
			await mahojiUserSettingsUpdate(user.id, {
				minion_meleeAttackType: _newWeapon.weapon.stances[0].attack_type
			});
		}
		return ``;
	}

	if (_setup === 'range') {
		const oldAttackStyle = mahojiUser.minion_rangedAttackStyle;
		if (_newWeapon === null || _newWeapon.weapon === null || !_newWeapon.weapon) {
			await mahojiUserSettingsUpdate(user.id, {
				minion_rangedAttackStyle: null
			});
			return;
		}
		for (let stance of _newWeapon.weapon.stances) {
			if (stance === null) {
				i++;
				continue;
			}
			if (oldAttackStyle !== stance.attack_style) {
				styleArray.push(i);
				i++;
				continue;
			}
			//Matched
			return ``;
		}
		if (styleArray.length !== 0) {
			const randomedStyle = randArrItem(styleArray);
			await mahojiUserSettingsUpdate(user.id, {
				minion_rangedAttackStyle: _newWeapon.weapon!.stances[randomedStyle].attack_style as attackStyles_enum
			});
		}
		else {
			await mahojiUserSettingsUpdate(user.id, {
				minion_rangedAttackStyle: _newWeapon.weapon.stances[0].attack_style as attackStyles_enum
			});
		}
		return ``;
	}

	if (_setup === 'mage') {
		const oldAttackStyle = mahojiUser.minion_magicAttackStyle;
		if (_newWeapon === null || _newWeapon.weapon === null || !_newWeapon.weapon) {
			if (oldAttackStyle === null) {
				await mahojiUserSettingsUpdate(user.id, {
					minion_magicAttackStyle: 'standard' as attackStyles_enum
				});						
			}
			return ``;
		}
		if (
			_newWeapon.name.toLowerCase() === 'trident of the seas' ||
			_newWeapon.name.toLowerCase() === 'trident of the seas (e)' ||
			_newWeapon.name.toLowerCase() === 'trident of the swamp' ||
			_newWeapon.name.toLowerCase() === 'trident of the swamp (e)'
		) {
			for (let stance of _newWeapon.weapon.stances) {
				if (stance === null) {
					i++;
					continue;
				}
				if (oldAttackStyle !== stance.attack_style) {
					styleArray.push(i);
					i++;
					continue;
				}
				//Matched
				return ``;

			}
			if (styleArray.length !== 0) {
				const randomedStyle = randArrItem(styleArray);
				await mahojiUserSettingsUpdate(user.id, {
					minion_magicAttackStyle: _newWeapon.weapon!.stances[randomedStyle].attack_style as attackStyles_enum
				});
			}
			else {
				await mahojiUserSettingsUpdate(user.id, {
					minion_magicAttackStyle: _newWeapon.weapon.stances[0].attack_style as attackStyles_enum
				});
			}
			return ``;
		}
		if (oldAttackStyle !== 'standard' && oldAttackStyle !== 'defensive') {
			await mahojiUserSettingsUpdate(user.id, {
				minion_magicAttackStyle: 'standard' as attackStyles_enum
			});	
		}
		return ``;
	}
}
