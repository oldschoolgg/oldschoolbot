import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { mergeDeep, omitBy } from 'remeda';
import wtf from 'wtf_wikipedia';

import { Monsters } from '../src';

const transformData = (data: any): any => {
	let {
		id,
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
		smwname,
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
		drange,
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
		id: Number(data.id ?? data.id1?.number),
		members: members?.toLowerCase() === 'yes',
		combatLevel,
		hitpoints,
		attackType: attackStyle?.toLowerCase().split(', '),
		attackSpeed: attackSpeed === 'No' ? null : Number(attackSpeed),
		aggressive: aggressive?.toLowerCase() === 'yes',
		poisonous: poisonous?.toLowerCase().includes('yes'),
		immuneToPoison: immunepoison?.toLowerCase() === 'yes',
		immuneToVenom: immunevenom?.toLowerCase() === 'yes',
		attributes: attributes ?? [],
		category: cat?.toLowerCase().split(', '),
		examineText: examine,
		wikiName: name,
		wikiURL: `https://oldschool.runescape.wiki/w/${name}`,
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
		defenceRanged: Number(drange ?? 0),
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

export async function monstersWikiUpdate() {
	if (!existsSync('wiki.xml')) {
		writeFileSync(
			'wiki.xml',
			`https://oldschool.runescape.wiki/w/Special:Export"
			
${Monsters.map(m => m.data?.wikiName)
	.flat(222)
	.join('\n')}`
		);
	}
	const json = wtf(readFileSync('wiki.xml', 'utf-8')).json();
	const sections = json.sections
		.map(s => s.infoboxes)
		.flat(100)
		.filter(s => s && Boolean(s.name) && Boolean(s.examine))
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

	const obj: any = JSON.parse(readFileSync('./src/data/monsters_data.json', 'utf-8'));
	const parsed = sections.map(transformData);

	for (const monData of parsed) {
		const existingMonster = Monsters.find(m => m.id === monData.id);
		if (!existingMonster && !['Chilled jelly', 'Wealthy citizen'].some(s => monData.wikiName.includes(s))) {
			console.log(`No monster found for ${monData.wikiName}`);
			continue;
		}

		const id = existingMonster?.id ?? monData.id;
		if (typeof id === 'undefined' || !Number.isInteger(id)) {
			throw new Error(`No ID found for monster ${monData.wikiName} ${existingMonster?.id} ${monData.id}`);
		}
		obj[id] = mergeDeep(existingMonster?.data ?? {}, monData);
		if (existingMonster) {
			obj[id].examineText = existingMonster.data.examineText;
			obj[id].wikiURL = existingMonster.data.wikiURL;
			obj[id].category = existingMonster.data.category;
			obj[id].attributes = existingMonster.data.attributes;
			obj[id].wikiName = existingMonster.data.wikiName;
			obj[id].slayerLevelRequired = existingMonster.data.slayerLevelRequired;
			obj[id].isSlayerMonster = existingMonster.data.isSlayerMonster;
			obj[id].slayerXP = existingMonster.data.slayerXP;
			obj[id].attackType = existingMonster.data.attackType;
			obj[id].aggressive = existingMonster.data.aggressive;
			obj[id].assignableSlayerMasters = existingMonster.data.assignableSlayerMasters;
		}
		if (!('attackType' in obj[id])) {
			obj[id].attackType = [];
		}
		if (!('category' in obj[id])) {
			obj[id].category = [];
		}
		if (!('slayerLevelRequired' in obj[id])) {
			obj[id].slayerLevelRequired = 0;
		}
		obj[id].id = undefined;
	}
	writeFileSync('src/data/monsters_data.json', JSON.stringify(obj, null, 4));
}
