import { Prisma } from '@prisma/client';
import { chunk } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { bingoStart } from '../commands/bso/bingo';
import { brokenPernixOutfit, brokenTorvaOutfit, brokenVirtusOutfit, skillingPetsCL } from './data/CollectionsExport';
import { TanglerootTable } from './minions/data/killableMonsters/custom/Treebeard';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { logError } from './util/logError';
import resolveItems from './util/resolveItems';
import { sendToChannelID } from './util/webhook';

type BingoTile = (
	| {
			oneOf: number[];
	  }
	| {
			allOf: number[];
	  }
	| {
			customReq: (cl: Bank) => boolean;
	  }
) & {
	id: number;
	name: string;
};

const bingoTiles: BingoTile[] = [
	{
		id: 1,
		name: '1 Torva item AND 1 Pernix Item AND 1 Virtus Item',
		customReq: cl => {
			for (const outfit of [brokenTorvaOutfit, brokenPernixOutfit, brokenVirtusOutfit]) {
				if (!outfit.some(id => cl.has(id))) return false;
			}
			return true;
		}
	},
	{
		id: 2,
		name: '1 Main Hand Drygore Weapon AND 1 Offhand Drygore Weapon',
		customReq: cl => {
			return (
				resolveItems(['Drygore rapier', 'Drygore longsword', 'Drygore mace']).some(id => cl.has(id)) &&
				resolveItems(['Offhand drygore rapier', 'Offhand drygore longsword', 'Offhand drygore mace']).some(id =>
					cl.has(id)
				)
			);
		}
	},
	{
		id: 3,
		name: '1 OSRS Skilling Pet',
		oneOf: skillingPetsCL
	},
	{
		id: 4,
		name: '1 OSRS Boss Pet',
		oneOf: resolveItems([
			'Abyssal orphan',
			'Baby mole',
			'Callisto cub',
			'Hellpuppy',
			'Ikkle hydra',
			'Kalphite princess',
			"Lil' zik",
			'Little nightmare',
			'Noon',
			'Olmlet',
			'Pet zilyana',
			'Pet dark core',
			'Pet dagannoth prime',
			'Pet dagannoth supreme',
			'Pet dagannoth rex',
			'Pet general graardor',
			'Prince black dragon',
			'Pet kraken',
			"Pet kree'arra",
			"Pet k'ril tsutsaroth",
			"Scorpia's offspring",
			'Pet smoke devil',
			'Venenatis spiderling',
			"Vet'ion jr.",
			'Vorki',
			'Pet snakeling',
			'Sraracha'
		])
	},
	{
		id: 5,
		name: '1 Custom Boss Pet',
		oneOf: resolveItems([
			'Brock',
			'Klik',
			'Bloodsoaked feather',
			'Baby kalphite king',
			'Ori',
			'Voidling',
			'Takon',
			'Steve',
			'Queen black dragonling',
			'Jal-MejJak'
		])
	},
	{
		id: 6,
		name: 'Royal dragon kiteshield',
		allOf: resolveItems(['Royal dragon kiteshield'])
	},
	{
		id: 7,
		name: 'Tattered Robes of Vasa OR Magus Scroll',
		oneOf: resolveItems(['Tattered robes of Vasa', 'Magus scroll'])
	},
	{
		id: 8,
		name: 'All 5 Godsword Hilts',
		allOf: resolveItems(['Zamorak hilt', 'Saradomin hilt', 'Bandos hilt', 'Armadyl hilt', 'Ancient hilt'])
	},
	{
		id: 9,
		name: '1 Custom Skilling Pet',
		oneOf: resolveItems([
			'Peky',
			'Shelldon',
			'Zippy',
			'Lil Lamb',
			'Doug',
			'Remy',
			'harry',
			'Wilvus',
			'Scruffy',
			'Zak',
			'Skipper',
			'Plopper',
			'Sandy',
			'Obis'
		])
	},
	{
		id: 10,
		name: 'Zaryte bow OR Virtus crystal',
		oneOf: resolveItems(['Zaryte bow', 'Virtus crystal'])
	},
	{
		id: 11,
		name: 'Dragon Hunter Crossbow OR Dragon claws',
		oneOf: resolveItems(['Dragon hunter crossbow', 'Dragon claws'])
	},
	{
		id: 12,
		name: 'Dragon warhammer',
		allOf: resolveItems(['Dragon warhammer'])
	},
	{
		id: 13,
		name: '1 Ignecarus Unique',
		oneOf: resolveItems(['Dragon egg', 'Ignecarus dragonclaw', 'Ignis ring'])
	},
	{
		id: 14,
		name: 'Ely or Arcane or Spectral or Divine from scratch',
		customReq: (cl: Bank) => {
			if (['Holy elixir', 'Spirit shield', 'Blessed spirit shield'].some(name => !cl.has(name))) {
				return false;
			}
			return ['Arcane sigil', 'Elysian sigil', 'Spectral sigil', 'Divine sigil'].some(name => cl.has(name));
		}
	},
	{
		id: 15,
		name: 'Get ANY Jar drop',
		oneOf: resolveItems([
			'Jar of chemicals',
			'Jar of darkness',
			'Jar of decay',
			'Jar of dirt',
			'Jar of dreams',
			'Jar of eyes',
			'Jar of miasma',
			'Jar of sand',
			'Jar of smoke',
			'Jar of souls',
			'Jar of spirits',
			'Jar of stone',
			'Jar of swamp',
			'Jar of magic'
		])
	},
	{
		id: 16,
		name: 'Mainhand and Offhand Dragon claw',
		allOf: resolveItems(['Dragon claw', 'Offhand dragon claw'])
	},
	{
		id: 17,
		name: 'Any revs weapon OR amulet of avarice OR ancient crystal',
		oneOf: resolveItems([
			"Craw's bow (u)",
			"Thammaron's sceptre (u)",
			"Viggora's chainmace (u)",
			'Amulet of avarice',
			'Ancient crystal'
		])
	},
	{
		id: 18,
		name: 'Abyssal cape',
		allOf: resolveItems(['Abyssal cape'])
	},
	{
		id: 19,
		name: 'Skeletal visage AND Draconic visage AND Wyvern visage',
		allOf: resolveItems(['Skeletal visage', 'Draconic visage', 'Wyvern visage'])
	},
	{
		id: 20,
		name: 'Zalcano shard',
		allOf: resolveItems(['Zalcano shard'])
	},
	{
		id: 21,
		name: 'Tanzanite OR Magma mutagen',
		oneOf: resolveItems(['Magma mutagen', 'Tanzanite mutagen'])
	},
	{
		id: 22,
		name: 'Tome of water OR fire',
		oneOf: resolveItems(['Tome of water (empty)', 'Tome of fire', 'Tome of water', 'Tome of fire (empty)'])
	},
	{
		id: 23,
		name: 'Any Tangleroot from Treebeard',
		oneOf: TanglerootTable.allItems
	},
	{
		id: 24,
		name: 'Squid dye',
		allOf: resolveItems(['Squid dye'])
	},
	{
		id: 25,
		name: 'Enhanced crystal weapon seed!',
		allOf: resolveItems(['Enhanced crystal weapon seed'])
	}
];

export function determineBingoProgress(_cl: ItemBank | Prisma.JsonValue | Bank) {
	const cl = _cl instanceof Bank ? _cl : new Bank(_cl as ItemBank);
	let tilesCompletedCount = 0;
	const tilesCompleted: number[] = [];

	// prettier-ignore
	const bingoTable = 
		['', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '',
		 '', '', '', '', '']

	for (let i = 0; i < bingoTiles.length; i++) {
		const tile = bingoTiles[i];

		let completed = false;
		if ('oneOf' in tile) {
			completed = tile.oneOf.some(id => cl.has([id]));
		} else if ('allOf' in tile) {
			completed = tile.allOf.every(id => cl.has(id));
		} else {
			completed = tile.customReq(cl);
		}

		if (completed) {
			tilesCompletedCount++;
			tilesCompleted.push(tile.id);
		}
		bingoTable[i] = completed ? '✅' : '🛑';
	}

	return {
		tilesCompletedCount,
		bingoTable,
		bingoTableStr: chunk(bingoTable, 5)
			.map(row => `${row.join(' ')}`)
			.join('\n'),
		tilesCompleted
	};
}

export async function onFinishTile(
	user: KlasaUser,
	before: ReturnType<typeof determineBingoProgress>,
	after: ReturnType<typeof determineBingoProgress>,
	newTotalCL: Bank
) {
	const finishedTile = after.tilesCompleted.find(id => !before.tilesCompleted.includes(id));
	if (!finishedTile) {
		logError('No finished tile?', { user_id: user.id });
		return;
	}
	if (!newTotalCL.has('Bingo ticket')) return;
	const tile = bingoTiles.find(i => i.id === finishedTile)!;
	sendToChannelID(user.client as KlasaClient, '965089835100549191', {
		content: `${user} just finished the '${tile.name}' tile! This is their ${after.tilesCompletedCount}/${bingoTiles.length} finished tile.`
	});
}

async function getAllBingoPlayers() {
	const result = await prisma.$queryRawUnsafe<{ id: string; temp_cl: ItemBank }[]>(`SELECT id, temp_cl
FROM users
WHERE "collectionLogBank" ? '122003';`);
	return result
		.map(i => ({ id: i.id, ...determineBingoProgress(i.temp_cl) }))
		.sort((a, b) => b.tilesCompletedCount - a.tilesCompletedCount);
}

export async function csvDumpBingoPlayers() {
	const users = await getAllBingoPlayers();
	return users.map(i => `${i.id}\t${i.tilesCompletedCount}\t${i.tilesCompleted.join(',')}`).join('\n');
}

export async function bingoLeaderboard() {
	const mapped = (await getAllBingoPlayers()).slice(0, 10);
	return `Bingo Leaderboard
${mapped.map((i, index) => `${++index}. <@${i.id}> - ${i.tilesCompletedCount} tiles`).join('\n')}`;
}

export function bingoIsActive() {
	return Date.now() >= bingoStart;
}
