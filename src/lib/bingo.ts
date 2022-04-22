import { Prisma } from '@prisma/client';
import { chunk } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { bingoStart } from '../commands/bso/bingo';
import { brokenPernixOutfit, brokenTorvaOutfit, brokenVirtusOutfit, skillingPetsCL } from './data/CollectionsExport';
import { TanglerootTable } from './minions/data/killableMonsters/custom/Treebeard';
import { prisma } from './settings/prisma';
import { ItemBank } from './types';
import { formatOrdinal } from './util/formatOrdinal';
import { logError } from './util/logError';
import resolveItems from './util/resolveItems';
import { sendToChannelID } from './util/webhook';

const bingoTeams = [
	['136202938505887744', '276464613149900800', '194315025542938624'],
	['350660052991868929', '331292008364900354', '323875981914013697'],
	['440242916032774165', '310150823986593803', '427824578832760836'],
	['411999816156053518', '419851832731369473', '525535476942110730'],
	['290319339104501760', '322894409324822529', '126040633801441280'],
	['493935765064122378', '104551194667524096', '808799538956599336'],
	['393636676003561472', '194597029379309569', '248262276803461121'],
	['361120305420304384', '228878604317097984', '201880429853147147'],
	['358333625378406403', '239225147590967296', '92956276249604096'],
	['279320058889502720', '685963896854544389', '250049573505073163'],
	['215877371235008513', '308033432154406922', '187957828571496448'],
	['68214286689771520', '353644786630000642', '608069537497088030'],
	['425134194436341760', '284831523738353664', '260682857352134658'],
	['730643743648252024', '188513561079840769', '192621282452439041'],
	['319396464402890753', '951937489923346533', '132723366153945088'],
	['193474528410599424', '262438473670066177', '254956923332329474'],
	['531564250125041677', '478218551518560256', '251851600358932480'],
	['95649778498543616', '335473139159138315', '102130767512997888'],
	['306771286745415682', '447793398628483084', '297764065604927488'],
	['209825195131797504', '322917364238778388', '200084631985455104'],
	['304316646007504896', '780306566090850324', '179759695727296513'],
	['703298838995402853', '415408084354072587', '197140024565694464'],
	['261936941531004928', '460917410401222656', '411995921769824268'],
	['255767128051810305', '452740992777453568', '393536851467567124'],
	['106134029408960512', '285556862701797377', '231341658837352448'],
	['343926918468337664', '553025355670355976', '493460691064193024'],
	['363917147052834819', '246646642311299072', '198993057323024384'],
	['575384997465423872', '538600275221413900', '447254943964069895'],
	['240876820000538624', '222950219623563264', '526792340535377941'],
	['251396361902227456', '208057410387050506', '463222293133393921'],
	['871475856650956830', '811039985235001346', '949372959657717820'],
	['527897038935949323', '582882502113230861', '404719372368609312'],
	['481438127630581800', '327900412676014082', '244872016237166593'],
	['161628552922529792', '138095861929345024', '462440911243051038'],
	['304309559068196867', '572568072397783041', '343104695209951255'],
	['216746703900901376', '453056004473618442', '667782583349805057'],
	['210646122430070785', '132647937091043329', '161936783993602049'],
	['167802428257861632', '436615944132100097', '259227822550155264'],
	['177503887673131008', '105033302313803776', '186698296667013136'],
	['185891765910372353', '254212039059177474', '776793776323690527'],
	['552994655177015318', '305158671057420300', '138818531490791425'],
	['209914909603921920', '392069071077900289', '363503095507845125'],
	['347760427989598219', '429503166061608972', '899857665801465927'],
	['131104669383524353', '787412377502220321', '193965146186579968']
];

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

export const bingoTiles: BingoTile[] = [
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
			'Jar of decay',
			'Jar of dirt',
			'Jar of dreams',
			'Jar of eyes',
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
	sendToChannelID(user.client as KlasaClient, '965529168588734464', {
		content: `${user} just finished the '${tile.name}' tile! This is their ${after.tilesCompletedCount}/${bingoTiles.length} finished tile.`
	});
	sendToChannelID(user.client as KlasaClient, '965546522353737788', {
		content: `Someone just finished their ${formatOrdinal(after.tilesCompletedCount)} tile!`
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

export async function calculateBingoTeamDetails(oneTeamMember: string | string[]) {
	const team = Array.isArray(oneTeamMember) ? oneTeamMember : bingoTeams.find(_team => _team.includes(oneTeamMember));
	if (!team) return null;

	const collectionLogs = (
		await prisma.user.findMany({
			where: {
				id: {
					in: team
				}
			},
			select: {
				temp_cl: true
			}
		})
	).map(i => i.temp_cl) as ItemBank[];

	const totalCL = new Bank();
	for (const cl of collectionLogs) totalCL.add(cl);

	return {
		progress: determineBingoProgress(totalCL),
		team
	};
}
export async function bingoTeamLeaderboard() {
	const allUsers = (
		await prisma.user.findMany({
			where: {
				id: {
					in: bingoTeams.flat(2)
				}
			},
			select: {
				id: true,
				temp_cl: true
			}
		})
	).map(i => ({ cl: i.temp_cl as any as ItemBank, id: i.id }));

	const result: {
		progress: ReturnType<typeof determineBingoProgress>;
		team: string[];
		finishedGoldenTiles: boolean;
	}[] = [];
	for (const team of bingoTeams) {
		const data = allUsers.filter(i => team.includes(i.id))!;
		let totalCL = new Bank();
		for (const t of data) totalCL.add(t.cl);
		const progress = determineBingoProgress(totalCL);
		result.push({
			progress,
			team,
			finishedGoldenTiles: [2, 3, 5, 14, 17, 18, 21].every(id => progress.tilesCompleted.includes(id))
		});
	}

	return result.sort((a, b) => b.progress.tilesCompletedCount - a.progress.tilesCompletedCount);
}
