import { roll, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, Monsters, Openables } from 'oldschooljs';
import SimpleOpenable from 'oldschooljs/dist/structures/SimpleOpenable';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Activity, BitField } from './constants';
import { ChimplingImpling, EternalImpling, InfernalImpling, MysteryImpling } from './simulation/customImplings';
import { SkillsEnum } from './skilling/types';
import {
	ActivityTaskOptions,
	AgilityActivityTaskOptions,
	MonsterActivityTaskOptions,
	PickpocketActivityTaskOptions
} from './types/minions';

const {
	BabyImpling,
	YoungImpling,
	GourmetImpling,
	EarthImpling,
	EssenceImpling,
	EclecticImpling,
	NatureImpling,
	MagpieImpling,
	NinjaImpling,
	CrystalImpling,
	DragonImpling,
	LuckyImpling
} = Openables;

type Impling = [SimpleOpenable, number, number, null | ((activity: ActivityTaskOptions, user: KlasaUser) => boolean)];

export const implings: Impling[] = [
	// [Imp, Weight, Level, Inhibitor]
	[BabyImpling, 126, 17, null],
	[YoungImpling, 85, 22, null],
	[GourmetImpling, 88, 28, null],
	[EarthImpling, 68, 36, null],
	[EssenceImpling, 49, 42, null],
	[EclecticImpling, 44, 50, null],
	[NatureImpling, 63, 58, null],
	[MagpieImpling, 44, 65, null],
	[NinjaImpling, 41, 74, null],
	[
		CrystalImpling,
		16,
		80,
		(activity: ActivityTaskOptions) => {
			if ([Activity.Gauntlet, Activity.Zalcano].includes(activity.type)) return true;
			if (
				activity.type === Activity.MonsterKilling &&
				[Monsters.DarkBeast.id, Monsters.PrifddinasElf.id].includes(
					(activity as MonsterActivityTaskOptions).monsterID
				)
			) {
				return true;
			}
			if (
				activity.type === Activity.Pickpocket &&
				(activity as PickpocketActivityTaskOptions).monsterID === Monsters.PrifddinasElf.id
			) {
				return true;
			}
			if (
				activity.type === Activity.Agility &&
				(activity as AgilityActivityTaskOptions).courseID === 'Prifddinas Rooftop Course'
			) {
				return true;
			}

			return false;
		}
	],
	[DragonImpling, 24, 83, null],
	[
		ChimplingImpling,
		19,
		95,
		(_activity: ActivityTaskOptions, user: KlasaUser) => {
			if (user.owns('Magic banana')) return true;
			return false;
		}
	],
	[LuckyImpling, 14, 89, null],
	[InfernalImpling, 9, 94, null],
	[EternalImpling, 7, 99, null],
	[MysteryImpling, 3, 105, null]
];

export const ImplingTable = new SimpleTable<Impling>();
for (const imp of implings) {
	ImplingTable.add(imp, imp[1]);
}

const IMPLING_CHANCE_PER_MINUTE = 65;

export async function handlePassiveImplings(user: KlasaUser, data: ActivityTaskOptions) {
	const minutes = Math.floor(data.duration / Time.Minute);

	if (minutes < 4) return null;
	const level = user.skillLevel(SkillsEnum.Hunter);

	let bank = new Bank();

	const hasScrollOfTheHunt = user.bitfield.includes(BitField.HasScrollOfTheHunt);
	let chance = IMPLING_CHANCE_PER_MINUTE;
	if (hasScrollOfTheHunt) {
		chance = Math.floor(chance / 2);
	}
	if (user.hasItemEquippedAnywhere('Hunter master cape')) {
		chance = Math.floor(chance / 2);
	}
	const missed: SimpleOpenable[] = [];
	for (let i = 0; i < minutes; i++) {
		const gotImp = roll(1 > 0 ? 5 : chance);
		if (gotImp) {
			const [imp, , levelReq, inhibitor] = ImplingTable.roll()!.item;
			if (inhibitor && !inhibitor(data, user)) continue;

			const chimplingCost = new Bank().add('Magic banana');
			if (
				level < levelReq ||
				(imp === EternalImpling && !user.hasItemEquippedOrInBank('Vasa cloak')) ||
				(imp === ChimplingImpling && !user.owns(chimplingCost))
			) {
				missed.push(imp);
			} else {
				if (imp === ChimplingImpling) await user.removeItemsFromBank(chimplingCost);
				bank.add(imp.id);
			}
		}
	}
	if (bank.length === 0 && missed.length === 0) return null;
	return { bank, missed };
}
