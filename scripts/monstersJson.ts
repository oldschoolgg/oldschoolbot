import { readFileSync, writeFileSync } from 'node:fs';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { md5sum } from '@oldschoolgg/toolkit/util';
import { DateTime } from 'luxon';
import { Bank, Items } from 'oldschooljs';

import { BOT_TYPE } from '@/lib/constants';
import killableMonsters from '@/lib/minions/data/killableMonsters';

export function createMonstersJson() {
	const stopwatch = new Stopwatch();
	const monstersJsonFile = [];

	for (const monster of killableMonsters) {
		monstersJsonFile.push({
			id: monster.id,
			name: monster.name,
			base_kill_time_ms: monster.timeToFinish,
			respawn_time_ms: monster.respawnTime,

			is_wildy: monster.wildy ?? false,
			is_slayer_only: monster.slayerOnly ?? false,
			can_be_pked: monster.canBePked ?? false,
			is_wildy_multi: monster.wildyMulti ?? false,
			pk_base_death_chance: monster.pkBaseDeathChance,
			items_required:
				monster.itemsRequired?.map(i =>
					typeof i === 'number' ? Items.itemNameFromId(i) : i.map(id => Items.itemNameFromId(id))
				) ?? [],
			qp_required: monster.qpRequired ?? 0,
			item_in_bank_boosts: monster.itemInBankBoosts?.map(group => new Bank(group).toNamedBank()) ?? [],

			can_barrage: monster.canBarrage ?? false,
			can_chin: monster.canChinning ?? false,
			can_cannon: monster.canCannon ?? false,
			cannon_multi: monster.cannonMulti ?? false
		});
	}

	monstersJsonFile.sort((a, b) => a.name.localeCompare(b.name));

	const filePath = `data/${BOT_TYPE.toLowerCase()}/monsters.json`;
	const previousHash = JSON.parse(readFileSync(filePath, 'utf-8')).hash || '';

	const hash = md5sum(JSON.stringify(monstersJsonFile));
	if (hash === previousHash) {
		console.log('Monsters JSON file is up to date');
		return;
	}
	writeFileSync(
		filePath,
		`${JSON.stringify(
			{
				hash,
				date: DateTime.utc().toISO(),
				data: monstersJsonFile
			},
			null,
			'	'
		)}\n`
	);
	stopwatch.check('Finished monsters file.');
}
