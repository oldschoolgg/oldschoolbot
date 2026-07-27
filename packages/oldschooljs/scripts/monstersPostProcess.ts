import { writeFileSync } from 'node:fs';
import { clone } from 'remeda';

import monsters from '../src/assets/monsters_data.json' with { type: 'json' };

const monstersCopy = clone(monsters);

for (const [_id, monster] of Object.entries(monsters) as [string, any][]) {
	delete monster.wikiURL;
	delete monster.wikiName;
	delete monster.examineText;
	for (const arrKey of ['assignableSlayerMasters', 'attributes', 'category', 'attackType']) {
		if (Array.isArray(monster[arrKey]) && monster[arrKey].length === 0) {
			delete monster[arrKey];
		}
	}
}

const didChange = JSON.stringify(monstersCopy) !== JSON.stringify(monsters);
if (didChange) {
	writeFileSync('./src/assets/monsters_data.json', JSON.stringify(monsters, null, 4));
}
