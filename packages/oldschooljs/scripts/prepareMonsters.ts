import { writeFileSync } from 'node:fs';
import fetch from 'node-fetch';

import { Monsters } from '../src';
import {
	Element,
	type MonsterAttackType,
	type MonsterAttribute,
	type MonsterData,
	type MonsterSlayerMaster
} from '../src/meta/monsterData';

import { omitBy } from 'remeda';
import * as wtf from 'wtf_wikipedia';

const monsterMap: { [key: string]: MonsterData } = {};

interface Monster {
	id: number;
	name: string;
	incomplete: boolean;
	members: boolean;
	release_date: string | null;
	combat_level: number;
	size: number;
	hitpoints: number;
	max_hit: number;
	attack_type: MonsterAttackType[];
	attack_speed: number | null;
	aggressive: boolean;
	poisonous: boolean;
	immune_poison: boolean;
	immune_venom: boolean;
	attributes: MonsterAttribute[] | null;
	category: string[];
	slayer_monster: boolean;
	slayer_level: number;
	slayer_xp: number;
	slayer_masters: MonsterSlayerMaster[];
	duplicate: boolean;
	examine: string;
	icon: any;
	wiki_name: string;
	wiki_url: string;
	attack_level: number;
	strength_level: number;
	defence_level: number;
	magic_level: number;
	ranged_level: number;
	attack_stab: number;
	attack_slash: number;
	attack_crush: number;
	attack_magic: number;
	attack_ranged: number;
	defence_stab: number;
	defence_slash: number;
	defence_crush: number;
	defence_magic: number;
	defence_ranged_light: number;
	defence_ranged_standard: number;
	defence_ranged_heavy: number;
	elemental_weakness_type: number;
	elemental_weakness_percent: number;
	attack_accuracy: number;
	melee_strength: number;
	ranged_strength: number;
	magic_damage: number;
}

const transformData = (data: any): MonsterData => {
	let {
		members,
		combat,
		hitpoints,
		'attack style': attackStyle,
		aggressive,
		poisonous,
		immunepoison,
		immunevenom,
		cat,
		examine,
		name,
		slaylvl,
		slayxp,
		assignedby,
		att,
		str,
		def,
		mage,
		range,
		amagic,
		arange,
		dstab,
		dslash,
		dcrush,
		dmagic,
		dlight,
		dstandard,
		dheavy,
		elementalweaknesstype,
		elementalweaknesspercent,
		attributes
	} = data;
	attributes ??= [];
	if (!Array.isArray(attributes)) {
		attributes = [attributes];
	}

	const attackSpeed = data['attack speed'] ?? data['attack speed1'] ?? data['attack speed2'] ?? null;

	let combatLevel = combat ? Number(combat) : 0;
	if (!combatLevel) combatLevel = 0;

	return {
		members: members?.toLowerCase() === 'yes',
		combatLevel,
		hitpoints,
		attackType: attackStyle?.toLowerCase().split(', '),
		attackSpeed: attackSpeed === 'No' ? null : Number(attackSpeed),
		aggressive: aggressive?.toLowerCase() === 'yes',
		poisonous: poisonous?.toLowerCase().includes('yes'),
		immuneToPoison: immunepoison?.toLowerCase() === 'yes',
		immuneToVenom: immunevenom?.toLowerCase() === 'yes',
		attributes: attributes,
		category: cat?.toLowerCase().split(', '),
		examineText: examine,
		wikiName: name,
		wikiURL: `https://oldschool.runescape.wiki/w/${name.replace(/ /g, '_')}`,
		attackLevel: Number(att ?? 0),
		strengthLevel: Number(str ?? 0),
		defenceLevel: Number(def ?? 0),
		magicLevel: Number(mage ?? 0),
		rangedLevel: Number(range ?? 0),
		attackStab: 0,
		attackSlash: 0,
		attackCrush: 0,
		attackMagic: Number(amagic ?? 0),
		attackRanged: Number(arange ?? 0),
		defenceStab: Number(dstab ?? 0),
		defenceSlash: Number(dslash ?? 0),
		defenceCrush: Number(dcrush ?? 0),
		defenceMagic: Number(dmagic ?? 0),
		defenceRangedLight: Number(dlight ?? 0),
		defenceRangedStandard: Number(dstandard ?? 0),
		defenceRangedHeavy: Number(dheavy ?? 0),
		elementalWeakness: Element[elementalweaknesstype as keyof typeof Element]
			? Element[elementalweaknesstype as keyof typeof Element]
			: undefined,
		elementalPercent: elementalweaknesspercent ? Number(elementalweaknesspercent) : undefined,
		attackAccuracy: 0,
		meleeStrength: 0,
		rangedStrength: 0,
		magicDamage: 0,
		isSlayerMonster: !!slaylvl,
		slayerLevelRequired: slaylvl,
		slayerXP: slayxp,
		assignableSlayerMasters: assignedby?.split(',').map(master => master.trim().toLowerCase())
	};
};

export default async function prepareMonsters(): Promise<void> {
	const allMonsters: { [key: string]: Monster } = await (async () => {
		try {
			const response = await fetch(
				'https://raw.githubusercontent.com/DayV-git/osrsreboxed-db/979d38c4f0c1f9fe255fef040dbace2cb2715a6e/docs/monsters-complete.json'
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching monsters data:', error);
			throw error;
		}
	})();
	const monIDs = new Set(Monsters.map(mon => mon.id));

	for (const mon of Object.values(allMonsters).filter(mon => monIDs.has(mon.id))) {
		// @ts-ignore ignore
		mon.drops = undefined;

		const newMonster: MonsterData = {
			members: mon.members,
			combatLevel: mon.combat_level,
			hitpoints: mon.hitpoints,
			maxHit: mon.max_hit,
			attackType: mon.attack_type,
			attackSpeed: mon.attack_speed,
			aggressive: mon.aggressive,
			poisonous: mon.poisonous,
			immuneToPoison: mon.immune_poison,
			immuneToVenom: mon.immune_venom,
			attributes: mon.attributes ?? [],
			category: mon.category,
			examineText: mon.examine,
			wikiName: mon.wiki_name,
			wikiURL: mon.wiki_url,

			attackLevel: mon.attack_level,
			strengthLevel: mon.strength_level,
			defenceLevel: mon.defence_level,
			magicLevel: mon.magic_level,
			rangedLevel: mon.ranged_level,

			attackStab: mon.attack_stab ?? 0,
			attackSlash: mon.attack_slash ?? 0,
			attackCrush: mon.attack_crush ?? 0,
			attackMagic: mon.attack_magic ?? 0,
			attackRanged: mon.attack_ranged ?? 0,
			defenceStab: mon.defence_stab ?? 0,
			defenceSlash: mon.defence_slash ?? 0,
			defenceCrush: mon.defence_crush ?? 0,
			defenceMagic: mon.defence_magic ?? 0,
			defenceRangedLight: mon.defence_ranged_light ?? 0,
			defenceRangedStandard: mon.defence_ranged_standard ?? 0,
			defenceRangedHeavy: mon.defence_ranged_heavy ?? 0,
			elementalWeakness: mon.elemental_weakness_type > 0 ? mon.elemental_weakness_type : undefined,
			elementalPercent: mon.elemental_weakness_percent > 0 ? mon.elemental_weakness_percent : undefined,
			attackAccuracy: mon.attack_accuracy ?? 0,
			meleeStrength: mon.melee_strength ?? 0,
			rangedStrength: mon.ranged_strength ?? 0,
			magicDamage: mon.magic_damage ?? 0,

			isSlayerMonster: mon.slayer_monster,
			slayerLevelRequired: mon.slayer_level ?? 0,
			slayerXP: mon.slayer_xp ?? 0,
			assignableSlayerMasters: mon.slayer_masters ?? []
		};
		monsterMap[mon.id] = newMonster;
		if (mon.name.toLowerCase() !== Monsters.get(mon.id)?.name.toLowerCase()) {
			console.warn(`Warning: Name of ${mon.name} does not match ${Monsters.get(mon.id)?.name}`);
		}
	}

	for (const mon of Object.values(Monsters).filter(
		mon => !Object.keys(monsterMap).find(i => i === mon.id.toString()) && mon.table //mon.table check ignores pickpocket npcs
	)) {
		console.log(`Preparing ${mon.name} manually`);
		monsterMap[mon.id] = transformData(mon);
		const lookupName = mon.monsterName ?? mon.name;
		const doc = await wtf.fetch(`https://oldschool.runescape.wiki/${lookupName.toLowerCase().replace(/ /g, '_')}`);
		const json = (Array.isArray(doc) ? doc[0] : doc)?.json() as { sections: any[] };
		if (!json) {
			console.error(`Failed to fetch ${mon.name}`);
			continue;
		}
		const sections = json.sections
			.map(s => s.infoboxes)
			.flat(100)
			.filter(s => s && Boolean(s.name) && (Boolean(s.examine) || Boolean(s.examine1)))
			.map(s =>
				omitBy(s, (value, key) =>
					['version', 'image', 'release', 'examine', 'update'].some(str => key.startsWith(str))
				)
			);
		for (let i = 0; i < sections.length; i++) {
			const section = sections[i];
			const allIDs: any[] = [];
			for (const [key, val] of Object.entries(section) as any[]) {
				if (key.startsWith('id') && key.length !== 2) {
					allIDs.push(val.text);
					continue;
				}
				section[key] = val.number ?? val.text ?? val;
			}
			section.allIDs = allIDs
				.map(idOrIdArr => (idOrIdArr.includes(',') ? idOrIdArr.split(',') : idOrIdArr))
				.flat(100)
				.map(id => Number(id.trim()))
				.sort((a, b) => a - b);
		}
		const parsed = transformData(
			sections.find(s => s.name.toLowerCase() === mon.name.toLowerCase()) ?? sections[0]
		);
		monsterMap[mon.id] = parsed;
	}

	const lintedJSON = JSON.stringify(
		monsterMap,
		(_key, value) => {
			if (Array.isArray(value)) {
				return JSON.stringify(value).replace(/,/g, ', ');
			}
			return value;
		},
		'\t'
	)
		.replace(/"\[/g, '[')
		.replace(/\]"/g, ']')
		.replace(/\\"/g, '"');

	writeFileSync('./src/data/monsters_data.json', `${lintedJSON}\n`);

	console.log('Prepared Monsters. Check any new monsters quickly to see that the data looks okay.');
}
