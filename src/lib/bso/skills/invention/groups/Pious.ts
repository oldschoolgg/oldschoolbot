import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

export const Pious: DisassemblySourceGroup = {
	name: 'Pious',
	items: [
		{
			item: Items.resolveFullItems([
				"Monk's robe (t)",
				"Monk's robe",
				"Monk's robe (g)",
				"Monk's robe top",
				"Monk's robe top (g)",
				"Monk's robe top (t)"
			]),
			lvl: 10
		},
		{
			item: Items.resolveFullItems([
				'Holy blessing',
				'War blessing',
				'Unholy blessing',
				'Peaceful blessing',
				'Ancient blessing'
			]),
			lvl: 70,
			flags: new Set(['treasure_trails'])
		},
		{
			item: Items.resolveFullItems([
				// Mitre
				'Saradomin mitre',
				'Guthix mitre',
				'Zamorak mitre',
				'Armadyl mitre',
				'Bandos mitre',
				'Ancient mitre',
				// Robe legs
				'Saradomin robe legs',
				'Guthix robe legs',
				'Zamorak robe legs',
				'Armadyl robe legs',
				'Bandos robe legs',
				'Ancient robe legs',
				// Robe top
				'Saradomin robe top',
				'Guthix robe top',
				'Zamorak robe top',
				'Armadyl robe top',
				'Bandos robe top',
				'Ancient robe top',
				// Crozier
				'Saradomin crozier',
				'Guthix crozier',
				'Zamorak crozier',
				'Armadyl crozier',
				'Bandos crozier',
				'Ancient crozier',
				// Cloaks
				'Saradomin cloak',
				'Guthix cloak',
				'Zamorak cloak',
				'Armadyl cloak',
				'Bandos cloak',
				'Ancient cloak',
				// Stoles
				'Armadyl stole',
				'Bandos stole',
				'Guthix stole',
				'Saradomin stole',
				'Zamorak stole',
				// Pages
				'Zamorak page 1',
				'Zamorak page 2',
				'Zamorak page 3',
				'Zamorak page 4',
				'Guthix page 1',
				'Guthix page 2',
				'Guthix page 3',
				'Guthix page 4',
				'Armadyl page 1',
				'Armadyl page 2',
				'Armadyl page 3',
				'Armadyl page 4',
				'Bandos page 1',
				'Bandos page 2',
				'Bandos page 3',
				'Bandos page 4',
				'Saradomin page 1',
				'Saradomin page 2',
				'Saradomin page 3',
				'Saradomin page 4',
				'Ancient page 1',
				'Ancient page 2',
				'Ancient page 3',
				'Ancient page 4'
			]),
			lvl: 70,
			flags: new Set(['treasure_trails'])
		},
		{
			item: Items.resolveFullItems(['Holy sandals', 'Holy wraps']),
			lvl: 80
		},
		{
			item: Items.resolveFullItems(['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3']),
			lvl: 80
		},
		{
			item: Items.resolveFullItems([
				'Zamorak hilt',
				'Saradomin hilt',
				'Bandos hilt',
				'Armadyl hilt',
				'Ancient hilt'
			]),
			lvl: 90
		},
		{
			item: Items.resolveFullItems([
				'Armadylean components',
				'Bandosian components',
				'Ancestral components',
				'Holy elixir'
			]),
			lvl: 90
		}
	],
	parts: { pious: 80, simple: 20 }
};
