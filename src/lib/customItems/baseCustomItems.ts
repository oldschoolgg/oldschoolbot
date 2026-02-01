import { EquipmentSlot } from '@oldschoolgg/gear';

import { setCustomItem } from '@/lib/customItems/util.js';

setCustomItem(
	24_214,
	'Abyssal cape',
	'Infernal cape',
	{
		tradeable: true,
		tradeable_on_ge: true,
		equipment: {
			attack_stab: 12,
			attack_slash: 12,
			attack_crush: 12,
			attack_magic: 6,
			attack_ranged: 6,
			defence_stab: 36,
			defence_slash: 36,
			defence_crush: 36,
			defence_magic: 36,
			defence_ranged: 36,
			melee_strength: 24,
			ranged_strength: 0,
			magic_damage: 0,
			prayer: 10,
			slot: EquipmentSlot.Cape,
			requirements: null
		}
	},
	100_000_000
);
