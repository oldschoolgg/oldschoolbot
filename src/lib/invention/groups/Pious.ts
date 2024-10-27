import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

export const Pious: DisassemblySourceGroup = {
	name: 'Pious',
	items: [
		{
			item: [
				"Monk's robe (t)",
				"Monk's robe",
				"Monk's robe (g)",
				"Monk's robe top",
				"Monk's robe top (g)",
				"Monk's robe top (t)"
			].map(getOSItem),
			lvl: 10
		},
		{
			item: ['Holy blessing', 'War blessing', 'Unholy blessing', 'Peaceful blessing', 'Ancient blessing'].map(
				getOSItem
			),
			lvl: 70,
			flags: new Set(['treasure_trails'])
		},
		{
			item: [
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
			].map(getOSItem),
			lvl: 70,
			flags: new Set(['treasure_trails'])
		},
		{
			item: ['Holy sandals', 'Holy wraps'].map(getOSItem),
			lvl: 80
		},
		{
			item: ['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3'].map(getOSItem),
			lvl: 80
		},
		{
			item: ['Zamorak hilt', 'Saradomin hilt', 'Bandos hilt', 'Armadyl hilt', 'Ancient hilt'].map(getOSItem),
			lvl: 90
		},
		{
			item: ['Armadylean components', 'Bandosian components', 'Ancestral components', 'Holy elixir'].map(
				getOSItem
			),
			lvl: 90
		}
	],
	parts: { pious: 80, simple: 20 }
};
