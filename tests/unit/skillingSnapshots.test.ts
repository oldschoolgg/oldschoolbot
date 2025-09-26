import { expect, it } from 'vitest';

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
import { BOT_TYPE } from '../../src/lib/constants.js';

it(`${BOT_TYPE} Woodcutting Logs`, () => {
	const result = Woodcutting.Logs.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Hunter Creatures`, () => {
	const result = Hunter.Creatures.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Crafting Craftables`, () => {
	const result = Crafting.Craftables.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Agility Courses`, () => {
	const result = Agility.Courses.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Cooking`, () => {
	const result = Cooking.Cookables.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Fishing`, () => {
	const result = Fishing.Fishes.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Mining`, () => {
	const result = Mining.Ores.sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Smithing`, () => {
	const result = [...Smithing.SmithableItems, ...Smithing.Bars].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Prayer`, () => {
	const result = [...Prayer.Ashes, ...Prayer.Bones].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Runecraft`, () => {
	const result = [...Runecraft.Runes, ...Runecraft.Tiaras].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Fletching`, () => {
	const result = [...Fletching.Fletchables].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Thieving`, () => {
	const result = [...Thieving.stealables].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Farming`, () => {
	const result = [...Farming.Plants].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Herblore`, () => {
	const result = [...Herblore.Mixables].sort((a, b) => a.item.name.localeCompare(b.item.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Magic`, () => {
	const result = [...Magic.Castables, ...Magic.Enchantables].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});
