import { PUMPKINHEAD_ID } from '@/lib/bso/pumpkinHead.js';
import { Ignecarus } from '@/lib/minions/data/killableMonsters/custom/bosses/Ignecarus.js';
import { KalphiteKingMonster } from '@/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing.js';
import KingGoldemar from '@/lib/minions/data/killableMonsters/custom/bosses/KingGoldemar.js';
import { MOKTANG_ID } from '@/lib/minions/data/killableMonsters/custom/bosses/Moktang.js';
import { Naxxus } from '@/lib/minions/data/killableMonsters/custom/bosses/Naxxus.js';
import { VasaMagus } from '@/lib/minions/data/killableMonsters/custom/bosses/VasaMagus.js';
import { customKillableMonsters } from '@/lib/minions/data/killableMonsters/custom/customMonsters.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { NexMonster } from '@/lib/nex.js';

export const bsoKillableMonsters: KillableMonster[] = [...customKillableMonsters];

export const bsoEffectiveMonsters = [
	{
		id: KingGoldemar.id,
		name: 'King Goldemar',
		aliases: ['king goldemar', 'kg']
	},
	{
		id: VasaMagus.id,
		name: 'Vasa Magus',
		aliases: ['vasa', 'vasa magus', 'vm']
	},
	{
		id: Naxxus.id,
		name: 'Naxxus',
		aliases: ['naxx', 'nax', 'naxxus']
	},
	{
		id: Ignecarus.id,
		name: 'Ignecarus',
		aliases: ['igne', 'ignecarus']
	},
	{
		id: PUMPKINHEAD_ID,
		name: 'Pumpkinhead',
		aliases: ['pumpkinhead', 'ph']
	},
	{
		name: 'Moktang',
		aliases: ['moktang'],
		id: MOKTANG_ID
	},
	{
		id: KalphiteKingMonster.id,
		name: 'Kalphite King',
		aliases: ['kalphite king', 'kk']
	},
	{
		id: 46_274,
		name: 'Nex',
		aliases: ['nex']
	}
];

export const bsoAutocompleteMonsters = [
	{
		name: 'Moktang',
		aliases: ['moktang'],
		id: MOKTANG_ID,
		link: '/bso/monsters/bosses/moktang/'
	},
	{
		...VasaMagus,
		link: '/bso/monsters/bosses/vasa-magus/'
	},
	{
		...Ignecarus,
		name: 'Ignecarus (Solo)',
		link: '/bso/monsters/bosses/ignecarus/'
	},
	{
		...Ignecarus,
		name: 'Ignecarus (Mass)',
		link: '/bso/monsters/bosses/ignecarus/'
	},
	{
		...KingGoldemar,
		name: 'King Goldemar (Solo)',
		link: '/bso/monsters/bosses/king-goldemar/'
	},
	{
		...KingGoldemar,
		name: 'King Goldemar (Mass)',
		link: '/bso/monsters/bosses/king-goldemar/'
	},
	{
		...NexMonster,
		name: 'Nex (Solo)',
		link: '/bso/monsters/bosses/nex/'
	},
	{
		...NexMonster,
		name: 'Nex (Mass)',
		link: '/bso/monsters/bosses/nex/'
	},
	{
		...KalphiteKingMonster,
		name: 'Kalphite King (Solo)',
		link: '/bso/monsters/bosses/kalphite-king/'
	},
	{
		...KalphiteKingMonster,
		name: 'Kalphite King (Mass)',
		link: '/bso/monsters/bosses/kalphite-king/'
	},
	{
		...Naxxus,
		name: 'Naxxus',
		link: '/bso/monsters/bosses/naxxus/'
	}
];
