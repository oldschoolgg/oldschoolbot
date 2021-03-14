import { KlasaUser } from 'klasa';

import { UserSettings } from '../../settings/types/UserSettings';
import { SkillsEnum } from './../../skilling/types';

interface PotionSimple {
	name: string;
	multipler: number;
	addition: number;
}

const attackPotionsPrio: PotionSimple[] = [
	/* Disabled because negative effects
	{
		name: 'Zamorak brew',
		multipler: 1 / 5,
		addition: 2
	},
	*/
	{
		name: 'Super combat potion',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Super attack',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Combat potion',
		multipler: 1 / 10,
		addition: 3
	},
	{
		name: 'Attack potion',
		multipler: 1 / 10,
		addition: 3
	}
];

const strengthPotionsPrio: PotionSimple[] = [
	{
		name: 'Super combat potion',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Super strength',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Combat potion',
		multipler: 1 / 10,
		addition: 3
	},
	{
		name: 'Strength potion',
		multipler: 1 / 10,
		addition: 3
	}
];

const defencePotionsPrio: PotionSimple[] = [
	/* Disabled because negative effects
	{
		name: 'Saradomin brew',
		multipler: 1 / 5,
		addition: 2
	},
	*/
	{
		name: 'Super combat potion',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Bastion potion',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Battlemage potion',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Super defence',
		multipler: 15 / 100,
		addition: 5
	},
	{
		name: 'Combat potion',
		multipler: 1 / 10,
		addition: 3
	},
	{
		name: 'Defence potion',
		multipler: 1 / 10,
		addition: 3
	}
];

const hitpointsPotionsPrio: PotionSimple[] = [
	/* Disabled because negative effects
	{
		name: 'Saradomin brew',
		multipler: 15 / 100,
		addition: 2
	},
	*/
];

const rangePotionsPrio: PotionSimple[] = [
	{
		name: 'Bastion potion',
		multipler: 1 / 10,
		addition: 4
	},
	{
		name: 'Ranging potion',
		multipler: 1 / 10,
		addition: 4
	}
];

const magePotionsPrio: PotionSimple[] = [
	{
		name: 'Battlemage potion',
		multipler: 1,
		addition: 4
	},
	{
		name: 'Magic potion',
		multipler: 1,
		addition: 4
	},
	{
		name: 'Magic essence',
		multipler: 1,
		addition: 3
	}
];

export default function potionBoostCalculator(
	user: KlasaUser,
	combatSkill: SkillsEnum
): [number, string] {
	const pickedPotions = user.settings.get(UserSettings.SelectedPotions);

	switch (combatSkill) {
		case SkillsEnum.Attack:
			for (const attackPotion of attackPotionsPrio) {
				if (pickedPotions.includes(attackPotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Attack) * attackPotion.multipler +
								attackPotion.addition
						) / 2,
						attackPotion.name
					];
				}
			}
			return [0, 'none'];
		case SkillsEnum.Strength:
			for (const strengthPotion of strengthPotionsPrio) {
				if (pickedPotions.includes(strengthPotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Strength) * strengthPotion.multipler +
								strengthPotion.addition
						) / 2,
						strengthPotion.name
					];
				}
			}
			return [0, 'none'];
		case SkillsEnum.Defence:
			for (const defencePotion of defencePotionsPrio) {
				if (pickedPotions.includes(defencePotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Defence) * defencePotion.multipler +
								defencePotion.addition
						) / 2,
						defencePotion.name
					];
				}
			}
			return [0, 'none'];
		case SkillsEnum.Hitpoints:
			for (const hitpointsPotion of hitpointsPotionsPrio) {
				if (pickedPotions.includes(hitpointsPotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Hitpoints) * hitpointsPotion.multipler +
								hitpointsPotion.addition
						) / 2,
						hitpointsPotion.name
					];
				}
			}
			return [0, 'none'];
		case SkillsEnum.Ranged:
			for (const rangePotion of rangePotionsPrio) {
				if (pickedPotions.includes(rangePotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Ranged) * rangePotion.multipler +
								rangePotion.addition
						) / 2,
						rangePotion.name
					];
				}
			}
			return [0, 'none'];
		case SkillsEnum.Magic:
			for (const magePotion of magePotionsPrio) {
				if (pickedPotions.includes(magePotion.name.toLowerCase())) {
					return [
						Math.floor(
							user.skillLevel(SkillsEnum.Magic) * magePotion.multipler +
								magePotion.addition
						) / 2,
						magePotion.name
					];
				}
			}
			return [0, 'none'];
	}

	return [0, 'none'];
}
