import type { CombatAchievement } from './combatAchievements';

export const easyCombatAchievements: CombatAchievement[] = [
	{
		name: 'Noxious Foe',
		type: 'kill_count',
		desc: 'Kill an Aberrant Spectre.',
		id: 1,
		kcReq: {
			monsterID: 2,
			qty: 1
		}
	},
	{
		name: 'Barrows Novice',
		type: 'kill_count',
		desc: 'Open the Barrows chest 10 times.',
		id: 2,
		kcReq: {
			monsterID: 1673,
			qty: 10
		}
	},
	{
		name: 'Defence? What Defence?',
		type: 'restriction',
		desc: 'Kill any Barrows Brother using only magical damage.',
		id: 3,
		chance: () => {}
	},
	{
		name: 'Big, Black and Fiery',
		type: 'kill_count',
		desc: 'Kill a Black Dragon.',
		id: 4,
		kcReq: {
			monsterID: 252,
			qty: 1
		}
	},
	{
		name: 'The Demonic Punching Bag',
		type: 'kill_count',
		desc: 'Kill a Bloodveld.',
		id: 5,
		kcReq: {
			monsterID: 484,
			qty: 1
		}
	},
	{
		name: 'Preparation Is Key',
		type: 'perfection',
		desc: 'Kill Bryophyta without suffering any poison damage.',
		id: 6
	},
	{
		name: 'Fighting as Intended II',
		type: 'restriction',
		desc: 'Kill Bryophyta on a free to play world.',
		id: 7
	},
	{
		name: 'Bryophyta Novice',
		type: 'kill_count',
		desc: 'Kill Bryophyta once.',
		id: 8,
		kcReq: {
			monsterID: 8195,
			qty: 1
		}
	},
	{
		name: 'A Slow Death',
		type: 'restriction',
		desc: 'Kill Bryophyta with either poison or venom being the final source of damage.',
		id: 9
	},
	{
		name: 'Protection from Moss',
		type: 'mechanical',
		desc: 'Kill Bryophyta with the Protect from Magic prayer active.',
		id: 10
	},
	{
		name: 'Deranged Archaeologist Novice',
		type: 'kill_count',
		desc: 'Kill the Deranged Archaeologist 10 times.',
		id: 11,
		kcReq: {
			monsterID: 7806,
			qty: 10
		}
	},
	{
		name: 'The Walking Volcano',
		type: 'kill_count',
		desc: 'Kill a Fire Giant.',
		id: 12,
		kcReq: {
			monsterID: 2075,
			qty: 1
		}
	},
	{
		name: 'Giant Mole Novice',
		type: 'kill_count',
		desc: 'Kill the Giant Mole 10 times.',
		id: 13,
		kcReq: {
			monsterID: 5779,
			qty: 10
		}
	},
	{
		name: 'A Greater Foe',
		type: 'kill_count',
		desc: 'Kill a Greater Demon.',
		id: 14,
		kcReq: {
			monsterID: 2025,
			qty: 1
		}
	},
	{
		name: 'Not So Great After All',
		type: 'restriction',
		desc: 'Finish off a Greater Demon with a demonbane weapon.',
		id: 15
	},
	{
		name: "A Demon's Best Friend",
		type: 'kill_count',
		desc: 'Kill a Hellhound.',
		id: 16,
		kcReq: {
			monsterID: 104,
			qty: 1
		}
	},
	{
		name: 'King Black Dragon Novice',
		type: 'kill_count',
		desc: 'Kill the King Black Dragon 10 times.',
		id: 17,
		kcReq: {
			monsterID: 6502,
			qty: 10
		}
	},
	{
		name: 'A Scaley Encounter',
		type: 'kill_count',
		desc: 'Kill a Lizardman Shaman.',
		id: 18,
		kcReq: {
			monsterID: 6766,
			qty: 1
		}
	},
	{
		name: 'Shayzien Protector',
		type: 'perfection',
		desc: 'Kill a Lizardman Shaman in Molch which has not dealt damage to anyone. (excluding its Spawns)',
		id: 19
	},
	{
		name: 'Into the Den of Giants',
		type: 'kill_count',
		desc: 'Kill a Hill Giant, Moss Giant and Fire Giant in the Giant Cave within the Shayzien region.',
		id: 20
	},
	{
		name: 'Obor Novice',
		type: 'kill_count',
		desc: 'Kill Obor once.',
		id: 21,
		kcReq: {
			monsterID: 7416,
			qty: 1
		}
	},
	{
		name: 'Fighting as Intended',
		type: 'restriction',
		desc: 'Kill Obor on a free to play world.',
		id: 22
	},
	{
		name: 'Sleeping Giant',
		type: 'mechanical',
		desc: 'Kill Obor whilst he is immobilized.',
		id: 23
	},
	{
		name: 'Sarachnis Novice',
		type: 'kill_count',
		desc: 'Kill Sarachnis 10 times.',
		id: 24,
		kcReq: {
			monsterID: 8713,
			qty: 10
		}
	},
	{
		name: 'Master of Buckets',
		type: 'mechanical',
		desc: 'Extinguish at least 5 fires during a single Tempoross fight.',
		id: 25
	},
	{
		name: 'Calm Before the Storm',
		type: 'mechanical',
		desc: 'Repair either a mast or a totem pole.',
		id: 26
	},
	{
		name: 'Fire in the Hole!',
		type: 'mechanical',
		desc: 'Attack Tempoross from both sides by loading both cannons on both ships.',
		id: 27
	},
	{
		name: 'Tempoross Novice',
		type: 'kill_count',
		desc: 'Subdue Tempoross 5 times.',
		id: 28,
		minigameReq: {
			minigame: 'tempoross',
			qty: 5
		}
	},
	{
		name: 'Handyman',
		type: 'mechanical',
		desc: 'Repair a brazier which has been destroyed by the Wintertodt.',
		id: 29
	},
	{
		name: 'Cosy',
		type: 'restriction',
		desc: 'Subdue the Wintertodt with four pieces of warm equipment equipped.',
		id: 30
	},
	{
		name: 'Mummy!',
		type: 'mechanical',
		desc: 'Heal a pyromancer after they have fallen.',
		id: 31
	},
	{
		name: 'Wintertodt Novice',
		type: 'kill_count',
		desc: 'Subdue the Wintertodt 5 times.',
		id: 32,
		minigameReq: {
			minigame: 'wintertodt',
			qty: 5
		}
	},
	{
		name: 'A Slithery Encounter',
		type: 'kill_count',
		desc: 'Kill a Wyrm.',
		id: 33,
		kcReq: {
			monsterID: 8610,
			qty: 1
		}
	}
];
