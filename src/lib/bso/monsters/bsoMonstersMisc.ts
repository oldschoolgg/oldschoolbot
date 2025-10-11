import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { Ignecarus } from '@/lib/bso/monsters/bosses/Ignecarus.js';
import { KalphiteKingMonster } from '@/lib/bso/monsters/bosses/KalphiteKing.js';
import { KingGoldemar } from '@/lib/bso/monsters/bosses/KingGoldemar.js';
import { Naxxus } from '@/lib/bso/monsters/bosses/Naxxus.js';
import { VasaMagus } from '@/lib/bso/monsters/bosses/VasaMagus.js';
import { NexMonster } from '@/lib/bso/monsters/nex.js';
import { PUMPKINHEAD_ID } from '@/lib/bso/pumpkinHead.js';

export const bsoEffectiveMonsters = [
	{
		id: EBSOMonster.KING_GOLDEMAR,
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
		id: EBSOMonster.MOKTANG
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
		id: EBSOMonster.MOKTANG,
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
