import './base.js';

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { omit } from 'remeda';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { allStashUnitTiers } from '@/lib/clues/stashUnits.js';
import { CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { BOT_TYPE } from '@/lib/constants.js';
import { allCollectionLogs } from '@/lib/data/Collections.js';
import { Eatables } from '@/lib/data/eatables.js';
import { similarItems } from '@/lib/data/similarItems.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import Potions from '@/lib/minions/data/potions.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { Minigames } from '@/lib/settings/minigames.js';
import Agility from '@/lib/skilling/skills/agility.js';
import Cooking from '@/lib/skilling/skills/cooking/cooking.js';
import Crafting from '@/lib/skilling/skills/crafting/index.js';
import Farming from '@/lib/skilling/skills/farming/index.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import Fletching from '@/lib/skilling/skills/fletching/index.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import Magic from '@/lib/skilling/skills/magic/index.js';
import Mining from '@/lib/skilling/skills/mining.js';
import Prayer from '@/lib/skilling/skills/prayer.js';
import Runecraft from '@/lib/skilling/skills/runecraft.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';
import Thieving from '@/lib/skilling/skills/thieving/index.js';
import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';
import { serializeSnapshotItem, Util } from './scriptUtil.js';

const rootDir = path.join('data', BOT_TYPE.toLowerCase());

function writeSkillingJson(file: string, value: unknown) {
	const out = path.join(rootDir, 'skills', file);
	writeFileSync(out, `${JSON.stringify(value, null, 4)}\n`, 'utf-8');
}

function writeRootJson(file: string, value: unknown) {
	const out = path.join(rootDir, file);
	writeFileSync(out, `${JSON.stringify(value, null, 4)}\n`, 'utf-8');
}

writeSkillingJson(
	'woodcutting-logs.json',
	Woodcutting.Logs.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'hunter-creatures.json',
	Hunter.Creatures.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'crafting-craftables.json',
	Crafting.Craftables.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'agility-courses.json',
	Agility.Courses.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'cooking-cookables.json',
	Cooking.Cookables.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(i => ({ ...i, burntCookable: i.burntCookable ? Util.ItemName(i.burntCookable) : null }))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'fishing-fishables.json',
	Fishing.Fishes.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'mining-ores.json',
	Mining.Ores.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'smithing-smithables-bars.json',
	[...Smithing.SmithableItems, ...Smithing.Bars]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeSkillingJson(
	'prayer-ashes-bones.json',
	[...Prayer.Ashes, ...Prayer.Bones].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'runecraft-runes-tiaras.json',
	[...Runecraft.Runes, ...Runecraft.Tiaras].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'fletching-fletchables.json',
	[...Fletching.Fletchables].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'thieving-stealabes.json',
	[...Thieving.stealables].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'farming-plants.json',
	[...Farming.Plants].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'herblore-mixables.json',
	[...Herblore.Mixables].sort((a, b) => a.item.name.localeCompare(b.item.name)).map(serializeSnapshotItem)
);

writeSkillingJson(
	'magic-castables.json',
	[...Magic.Castables, ...Magic.Enchantables].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem)
);

writeRootJson(
	'clue-tiers.json',
	[...ClueTiers]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(tier => {
			return {
				...omit(tier, ['reqs', 'allItems', 'stashUnits', 'implings']),
				allItems: Util.ItemArr(tier.allItems),
				implings: tier.implings ? Util.ItemArr(tier.implings) : []
			};
		})
		.map(serializeSnapshotItem)
);

writeRootJson(
	'stash-units.json',
	serializeSnapshotItem(
		allStashUnitTiers.reduce<Record<string, unknown>>((acc, cur) => {
			acc[cur.tier] = { ...cur, units: cur.units.map(u => ({ ...u, items: Util.ItemArr(u.items) })) };
			return acc;
		}, {})
	)
);

writeRootJson(
	'similar-items.json',
	[...similarItems.entries()]
		.map(i => ({
			main_item: Util.ItemName(i[0]),
			similar_items: Util.ItemArr([i[0], ...i[1]].filter(i => ![25869].includes(i)))
		}))
		.sort((a, b) => a.main_item.localeCompare(b.main_item))
);

writeRootJson('eatables.json', [...Eatables].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem));

writeRootJson('potions.json', [...Potions].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem));

writeRootJson(
	'combat-achievements.json',
	Object.values(CombatAchievements)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
);

writeRootJson(
	'minigames.json',
	[...Minigames].sort((a, b) => a.name.localeCompare(b.name))
);

writeRootJson(
	'killable-monsters.json',
	[...killableMonsters]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem)
		.map((m: KillableMonster) => {
			const obj: any = {
				...omit(m, ['equippedItemBoosts', 'itemInBankBoosts', 'aliases'])
			};

			if (m.itemInBankBoosts) {
				obj.itemInBankBoosts = m.itemInBankBoosts?.map(ib => Object.entries(ib));
			}
			if (m.equippedItemBoosts) {
				obj.equippedItemBoosts = m.equippedItemBoosts?.map(eb => [
					eb.gearSetup,
					eb.required ?? false,
					eb.items.map(item => Object.values(item))
				]);
			}

			return obj;
		})
);

writeRootJson('collection-log.json', serializeSnapshotItem(allCollectionLogs));
