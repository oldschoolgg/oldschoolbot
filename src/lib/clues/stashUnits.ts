import { Bank } from 'oldschooljs';

import { allTeamCapes } from 'oldschooljs/dist/data/itemConstants';
import { deepResolveItems, resolveItems } from 'oldschooljs/dist/util/util';
import {
	barrowsItemArr,
	boaters,
	bobShirts,
	croziers,
	godBooks,
	headbands,
	mitres,
	runeHeraldicHelms,
	runeHeraldicShields,
	stoles
} from '../data/CollectionsExport';
import type { ClueTier } from './clueTiers';

export interface IStashUnit {
	id: number;
	items: (number | number[])[];
	desc: string;
}
export interface StashUnitTier {
	tier: ClueTier['name'];
	cost: Bank;
	constructionLevel: number;
	xp: number;
	units: IStashUnit[];
}

export const beginnerStashes: StashUnitTier = {
	tier: 'Beginner',
	cost: new Bank().add('Plank', 2).add('Bronze nails', 10),
	constructionLevel: 12,
	xp: 150,
	units: [
		{ id: 1, desc: "Gypsy Aris's tent", items: resolveItems(['Gold ring', 'Gold necklace']) },
		{ id: 2, desc: "Bob's Brilliant Axes in Lumbridge", items: resolveItems(['Leather boots', 'Bronze axe']) },
		{ id: 3, desc: 'Iffie Nitter in Varrock', items: resolveItems(["Chef's hat", 'Red cape']) }
	]
};

export const easyStashes: StashUnitTier = {
	tier: 'Easy',
	cost: new Bank().add('Plank', 2).add('Bronze nails', 10),
	constructionLevel: 27,
	xp: 150,
	units: [
		{
			id: 4,
			desc: 'Near a shed in Lumbridge Swamp (entrance to Zanaris)',
			items: resolveItems(['Bronze dagger', 'Iron full helm', 'Gold ring'])
		},
		{
			id: 5,
			desc: 'Draynor Village market (next to a bench)',
			items: resolveItems(['Studded chaps', 'Iron kiteshield', 'Steel longsword'])
		},
		{
			id: 6,
			desc: "Outside the Legends' Guild gates (east)",
			items: resolveItems(['Iron platelegs', 'Emerald amulet', 'Oak longbow'])
		},
		{
			id: 7,
			desc: 'Near the Entrana ferry in Port Sarim',
			items: resolveItems(['Coif', 'Steel plateskirt', 'Sapphire necklace'])
		},
		{
			id: 8,
			desc: 'Draynor Manor by the fountain (south)',
			items: resolveItems(['Iron platebody', 'Studded chaps', 'Bronze full helm'])
		},
		{
			id: 9,
			desc: 'Crossroads north of Draynor Village',
			items: resolveItems(['Iron chainbody', 'Sapphire ring', 'Longbow'])
		},
		{
			id: 10,
			desc: 'Varrock Palace Library (in the south-east corner)',
			items: resolveItems(['Green robe top', 'Ham robe', 'Iron warhammer'])
		},
		{
			id: 11,
			desc: 'Outside the Falador Party Room entrance',
			items: resolveItems(['Steel full helm', 'Steel platebody', 'Iron plateskirt'])
		},
		{
			id: 12,
			desc: 'Catherby beehive field',
			items: resolveItems(['Desert shirt', 'Green robe bottoms', 'Steel axe'])
		},
		{
			id: 13,
			desc: 'Road junction north of Rimmington',
			items: resolveItems(['Green hat', 'Cream robe top', 'Leather chaps'])
		},
		{
			id: 14,
			desc: "Outside Keep Le Faye (west of the entrance, north of Legends' Guild)",
			items: resolveItems(['Coif', 'Iron platebody', 'Leather gloves'])
		},
		{
			id: 15,
			desc: 'Outside the Digsite Exam Centre (next to the urn)',
			items: resolveItems(['White apron', 'Green boots', 'Leather gloves'])
		},
		{
			id: 16,
			desc: "Mubariz's room at the Emir's Arena (inside the ticket office, west of the arena)",
			items: resolveItems(['Iron chainbody', 'Leather chaps', 'Coif'])
		},
		{
			id: 17,
			desc: "Near Herquin's Gems shop in Falador (outside)",
			items: resolveItems(['Mithril pickaxe', 'Black platebody', 'Iron kiteshield'])
		},
		{ id: 18, desc: "Aubury's shop in Varrock (inside)", items: resolveItems(['Air tiara', 'Staff of water']) },
		{
			id: 19,
			desc: "On the bridge to the Misthalin Wizards' Tower",
			items: resolveItems(['Iron med helm', 'Emerald ring', 'White apron'])
		},
		{
			id: 20,
			desc: 'Limestone mine (Silvarea mine, east of the Lumber Yard)',
			items: resolveItems(['Bronze platelegs', 'Steel pickaxe', 'Steel med helm'])
		},
		{
			id: 21,
			desc: 'Mudskipper Point (south-west of the fairy ring AIQ)',
			items: resolveItems(['Black cape', 'Leather chaps', 'Steel mace'])
		},
		{
			id: 22,
			desc: 'Al Kharid scorpion mine',
			items: resolveItems(['Desert shirt', 'Leather gloves', 'Leather boots'])
		},
		{
			id: 23,
			desc: 'Wheat field near the Lumbridge windmill',
			items: resolveItems(['Blue robe top', 'Turquoise robe bottoms', 'Oak shortbow'])
		},
		{
			id: 24,
			desc: 'Rimmington mine (centre)',
			items: resolveItems(['Gold necklace', 'Gold ring', 'Bronze spear'])
		},
		{ id: 25, desc: 'Upstairs in Ardougne windmill', items: resolveItems(['Blue robe top', 'Ham robe', 'Tiara']) },
		{
			id: 26,
			desc: 'Taverley Stone Circle',
			items: resolveItems(['Blue wizard hat', 'Bronze 2h sword', 'Ham boots'])
		},
		{
			id: 27,
			desc: 'Near the parrots in Ardougne Zoo (near Parroty Pete)',
			items: resolveItems(['Studded body', 'Bronze platelegs', 'Staff'])
		},
		{
			id: 28,
			desc: 'Outside the Fishing Guild entrance',
			items: resolveItems(['Emerald ring', 'Sapphire amulet', 'Bronze chainbody'])
		},
		{
			id: 29,
			desc: 'Road junction south of Sinclair Mansion',
			items: resolveItems(['Leather cowl', 'Iron scimitar', 'Blue wizard robe'])
		},
		{
			id: 30,
			desc: "Near the Sawmill operator's booth",
			items: resolveItems(['Hardleather body', 'Leather chaps', 'Bronze axe'])
		},
		{
			id: 31,
			desc: 'Outside Varrock Palace courtyard (next to the entrance)',
			items: resolveItems(['Black axe', 'Coif', 'Ruby ring'])
		},
		{
			id: 32,
			desc: 'South of the Grand Exchange',
			items: resolveItems(['Pink skirt', 'Pink robe top', 'Body tiara'])
		}
	]
};

export const mediumStashes: StashUnitTier = {
	tier: 'Medium',
	cost: new Bank().add('Oak plank', 2).add('Bronze nails', 10),
	constructionLevel: 42,
	xp: 250,
	units: [
		{
			id: 33,
			desc: 'Centre of Canifis',
			items: resolveItems(['Green robe top', 'Mithril platelegs', 'Iron 2h sword'])
		},
		{
			id: 34,
			desc: 'East of Barbarian Village bridge',
			items: resolveItems(['Purple gloves', 'Steel kiteshield', 'Mithril full helm'])
		},
		{
			id: 35,
			desc: 'Castle Wars bank',
			items: deepResolveItems(['Ruby amulet', 'Mithril scimitar', allTeamCapes.map(i => i.id)])
		},
		{
			id: 36,
			desc: 'Gnome Stronghold balancing rope',
			items: resolveItems(['Steel kiteshield', "Green d'hide chaps", 'Ring of forging'])
		},
		{
			id: 37,
			desc: 'Observatory',
			items: resolveItems(['Mithril chainbody', "Green d'hide chaps", 'Ruby amulet'])
		},
		{
			id: 38,
			desc: 'Digsite',
			items: resolveItems(['Green hat', 'Snakeskin boots', 'Iron pickaxe'])
		},
		// {
		// 	id: 39,
		// 	desc: 'Shantay Pass',
		// 	items: deepResolveItems([
		// 		resolveItems([
		// 			'Bruise blue snelm (pointed)',
		// 			'Myre snelm (pointed)',
		// 			"Blood'n'tar snelm (pointed)",
		// 			'Ochre snelm (pointed)'
		// 		]),
		// 		'Staff of air',
		// 		'Bronze sq shield'
		// 	])
		// },
		{
			id: 40,
			desc: 'Outside Catherby bank',
			items: resolveItems(['Maple longbow', "Green d'hide chaps", 'Iron med helm'])
		},
		{
			id: 41,
			desc: "Outside Harry's Fishing Shop in Catherby",
			items: resolveItems(['Adamant sq shield', 'Bone dagger', 'Mithril platebody'])
		},
		{
			id: 42,
			desc: "North of Evil Dave's house in Edgeville",
			items: resolveItems(['Brown apron', 'Leather boots', 'Leather gloves'])
		},
		{
			id: 43,
			desc: 'Entrance of the Arceuus library',
			items: resolveItems(["Blue d'hide vambraces", 'Adamant boots', 'Adamant dagger'])
		},
		{
			id: 44,
			desc: 'North of Mount Karuulm',
			items: resolveItems(['Adamant warhammer', 'Mithril boots', 'Ring of life'])
		},
		{
			id: 45,
			desc: 'Mausoleum off the Morytania coast',
			items: resolveItems(['Mithril plateskirt', 'Maple longbow'])
		},
		{
			id: 46,
			desc: 'South of the shrine in Tai Bwo Wannai Village',
			items: resolveItems(["Green d'hide chaps", 'Ring of dueling (8)', 'Mithril med helm'])
		},
		{
			id: 47,
			desc: 'Barbarian Outpost obstacle course (centre)',
			items: deepResolveItems(['Steel platebody', 'Maple shortbow', allTeamCapes.map(i => i.id)])
		},
		{
			id: 48,
			desc: "Outside Yanille bank (by the entrance to the Wizards' Guild)",
			items: resolveItems(['Brown apron', 'Adamant med helm', 'Snakeskin chaps'])
		},
		{
			id: 49,
			desc: 'Ogre cage in the Ardougne Training Camp',
			items: resolveItems(["Green d'hide body", "Green d'hide chaps", 'Steel sq shield'])
		},
		{
			id: 50,
			desc: "Hickton's Archery Emporium",
			items: resolveItems(['Blue boots', 'Hardleather body', 'Silver sickle'])
		},
		{
			id: 51,
			desc: 'Lumbridge Swamp Caves',
			items: resolveItems(['Staff of air', 'Bronze full helm', 'Amulet of power'])
		},
		{
			id: 52,
			desc: "Outside the Seers' Village courthouse",
			items: resolveItems(['Adamant halberd', 'Mystic robe bottom', 'Diamond ring'])
		},
		{
			id: 53,
			desc: 'TzHaar weapons store',
			items: resolveItems(['Steel longsword', "Blue d'hide body", 'Mystic gloves'])
		},
		{
			id: 54,
			desc: 'North of the Shayzien Combat Ring',
			items: resolveItems(['Adamant platebody', 'Adamant full helm', 'Adamant platelegs'])
		},
		{
			id: 55,
			desc: 'Outside Draynor Village jail',
			items: resolveItems(['Adamant sword', 'Sapphire amulet', 'Adamant plateskirt'])
		}
	]
};

export const hardStashes: StashUnitTier = {
	tier: 'Hard',

	cost: new Bank().add('Teak plank', 2).add('Bronze nails', 10),
	constructionLevel: 55,
	xp: 400,
	units: [
		{
			id: 56,
			desc: 'Chaos Temple in the south-eastern Wilderness',
			items: resolveItems(['Rune platelegs', 'Iron platebody', "Blue d'hide vambraces"])
		},
		{
			id: 57,
			desc: 'Top floor of the Lighthouse',
			items: resolveItems(["Blue d'hide body", "Blue d'hide vambraces"])
		},
		{
			id: 58,
			desc: "Noterazzo's shop in the Wilderness",
			items: resolveItems(['Adamant sq shield', "Blue d'hide vambraces", 'Rune pickaxe'])
		},
		{
			id: 59,
			desc: 'Mountain Camp goat enclosure',
			items: resolveItems(['Rune full helm', "Blue d'hide chaps", 'Fire battlestaff'])
		},
		{ id: 60, desc: 'Shilo Village bank', items: resolveItems(['Mystic hat', 'Bone spear', 'Rune platebody']) },
		{
			id: 61,
			desc: 'North-east corner of the Kharazi Jungle',
			items: deepResolveItems([resolveItems(runeHeraldicShields), resolveItems(stoles)])
		},
		{
			id: 62,
			desc: 'In the middle of Jiggig',
			items: deepResolveItems(['Rune spear', 'Rune platelegs', resolveItems(runeHeraldicHelms)])
		},
		{
			id: 63,
			desc: 'Hosidius Mess (inside, north-east corner)',
			items: resolveItems(['Rune halberd', 'Rune platebody', 'Amulet of strength'])
		},
		{
			id: 64,
			desc: 'Fishing Guild bank',
			items: resolveItems(['Elemental shield', "Blue d'hide chaps", 'Rune warhammer'])
		},
		{
			id: 65,
			desc: 'Outside the great pyramid of Sophanem',
			items: resolveItems(['Ring of life', 'Amulet of glory', 'Adamant 2h sword'])
		},
		{
			id: 66,
			desc: 'West side of the Karamja banana plantation',
			items: resolveItems(['Diamond ring', 'Amulet of power'])
		},
		{
			id: 67,
			desc: 'Gnome Glider on White Wolf Mountain',
			items: resolveItems(['Mithril platelegs', 'Ring of life', 'Rune axe'])
		},
		{
			id: 68,
			desc: 'Inside the Digsite Exam Centre',
			items: resolveItems(['Mystic fire staff', 'Diamond bracelet', 'Rune boots'])
		},
		{
			id: 69,
			desc: 'Volcano in the north-eastern Wilderness',
			items: deepResolveItems([resolveItems(headbands), resolveItems(croziers)])
		},
		{
			id: 70,
			desc: 'Agility Pyramid',
			items: deepResolveItems(['Mystic robe top', resolveItems(runeHeraldicShields)])
		}
	]
};

export const eliteStashes: StashUnitTier = {
	tier: 'Elite',
	cost: new Bank().add('Mahogany plank', 2).add('Bronze nails', 10),
	constructionLevel: 77,
	xp: 600,
	units: [
		{ id: 71, desc: 'Chapel in West Ardougne (inside)', items: resolveItems(['Dragon spear', "Red d'hide chaps"]) },
		{
			id: 72,
			desc: 'Near a ladder in the Wilderness Lava Maze',
			items: resolveItems(["Black d'hide chaps", 'Spotted cape', 'Rolling pin'])
		},
		{ id: 73, desc: "Warriors' Guild bank", items: resolveItems(['Black salamander']) },
		{
			id: 74,
			desc: 'South-east corner of the Fishing Platform',
			items: resolveItems(['Barrows gloves', 'Dragon med helm', 'Amulet of glory'])
		},
		{
			id: 75,
			desc: 'On top of Trollheim Mountain',
			items: resolveItems(['Lava battlestaff', "Black d'hide vambraces", 'Mind shield'])
		},
		{
			id: 76,
			desc: 'Entrance of the cavern under the whirlpool',
			items: deepResolveItems(['Granite shield', 'Splitbark body', resolveItems(runeHeraldicHelms)])
		},
		{
			id: 77,
			desc: 'Shayzien War Tent',
			items: deepResolveItems(['Mystic robe bottom', 'Rune kiteshield', resolveItems(bobShirts)])
		},
		{
			id: 78,
			desc: 'Near the gem stall in Ardougne Market',
			items: resolveItems(['Castle wars bracelet(3)', 'Dragonstone amulet', 'Ring of forging'])
		},
		{
			id: 79,
			desc: 'Near the Charcoal furnace south of Hosidius',
			items: resolveItems(["Farmer's strawhat", 'Shayzien body (5)', 'Pyromancer robe'])
		},
		{
			id: 80,
			desc: 'Near a runite rock in the Fremennik Isles',
			items: resolveItems(['Rune boots', 'Proselyte hauberk', 'Dragonstone ring'])
		},
		{
			id: 81,
			desc: 'Entrance of the cave of Damis',
			items: deepResolveItems(['Rune crossbow', 'Climbing boots', resolveItems(mitres)])
		},
		{
			id: 82,
			desc: 'South-east corner of the Monastery',
			items: deepResolveItems([resolveItems(godBooks)])
		},
		{
			id: 83,
			desc: 'Outside the Slayer Tower gargoyle room',
			items: resolveItems(['Seercull', 'Combat bracelet', 'Helm of neitiznot'])
		},
		{
			id: 84,
			desc: 'Fountain of Heroes',
			items: resolveItems(['Splitbark legs', 'Dragon boots', 'Rune longsword'])
		},
		{
			id: 85,
			desc: 'Half-way down Trollweiss Mountain (Trollweiss flowers after sledding down)',
			items: resolveItems(["Blue d'hide vambraces", 'Dragon spear', 'Rune plateskirt'])
		},
		{
			id: 86,
			desc: "Outside the Legends' Guild door (west of the fountain)",
			items: resolveItems(['Cape of legends', 'Dragon battleaxe', 'Amulet of glory'])
		},
		{
			id: 87,
			desc: 'Outside the bar by the Fight Arena',
			items: deepResolveItems([
				resolveItems([
					'Pirate bandana (red)',
					'Pirate bandana (white)',
					'Pirate bandana (brown)',
					'Pirate bandana (blue)'
				]),
				'Dragon necklace',
				'Magic longbow'
			])
		}
	]
};

export const masterStashes: StashUnitTier = {
	tier: 'Master',
	cost: new Bank().add('Mahogany plank', 2).add('Bronze nails', 10).add('Gold leaf'),
	constructionLevel: 88,
	xp: 1500,
	units: [
		{
			id: 88,
			desc: 'South-east corner of Lava Dragon Isle',
			items: resolveItems([
				'Dragon med helm',
				'Toktz-ket-xil',
				'Rune platebody',
				'Brine sabre',
				'Amulet of glory'
			])
		},
		{
			id: 89,
			desc: 'Barrows chest',
			items: deepResolveItems([
				barrowsItemArr.map(i => i[0]),
				barrowsItemArr.map(i => i[1]),
				barrowsItemArr.map(i => i[2]),
				barrowsItemArr.map(i => i[3])
			])
		},
		{
			id: 90,
			desc: 'On top of the Northern wall of Castle Drakan',
			items: deepResolveItems([boaters, 'Splitbark body', 'Dragon sq shield'])
		},
		{ id: 91, desc: 'Soul Altar', items: resolveItems(['Dragon pickaxe', 'Helm of neitiznot', 'Rune boots']) },
		{
			id: 92,
			desc: 'Entrana Chapel',
			items: resolveItems(["Black d'hide body", "Black d'hide chaps", "Black d'hide vambraces"])
		},
		{ id: 93, desc: "Tent in Lord Iorwerth's encampment", items: resolveItems(['Crystal bow']) },
		{
			id: 94,
			desc: 'Centre of the Catacombs of Kourend',
			items: resolveItems(['Arclight', 'Amulet of the damned (full)'])
		},
		{ id: 95, desc: "Outside K'ril Tsutsaroth's room", items: resolveItems(['Zamorak full helm', 'Shadow sword']) },
		{ id: 96, desc: 'Outside the Wilderness axe hut', items: resolveItems(['Flared trousers']) },
		{
			id: 97,
			desc: 'Death Altar (north-east corner)',
			items: resolveItems(['Death tiara', 'Cape of legends', 'Ring of wealth'])
		},
		{ id: 98, desc: 'North-western corner of the Enchanted Valley', items: resolveItems(['Dragon axe']) },
		{
			id: 99,
			desc: 'Near the pier in Zul-Andra (next to a tree)',
			items: resolveItems(['Dragon 2h sword', 'Bandos boots', 'Obsidian cape'])
		},
		{
			id: 100,
			desc: 'Well of Voyage',
			items: resolveItems(["Iban's staff", 'Mystic robe top (dark)', 'Mystic robe bottom (dark)'])
		},
		{
			id: 101,
			desc: '7th Chamber of Jalsavrah (Pyramid Plunder)',
			items: resolveItems([
				"Pharaoh's sceptre",
				'Menaphite purple hat',
				'Menaphite purple top',
				'Menaphite purple robe'
			])
		},
		{
			id: 102,
			desc: "Warriors' Guild bank",
			items: resolveItems(['Dragon battleaxe', 'Dragon defender', 'Slayer helmet'])
		},
		{ id: 103, desc: 'TzHaar gem store', items: resolveItems(['Fire cape', 'Toktz-xil-ul']) },
		{
			id: 104,
			desc: "Outside the Mudknuckles' hut",
			items: resolveItems(['Bandos platebody', 'Bandos cloak', 'Bandos godsword'])
		},
		{
			id: 105,
			desc: "King Black Dragon's lair",
			items: resolveItems(["Black d'hide body", "Black d'hide vambraces", 'Black dragon mask'])
		},
		{ id: 106, desc: 'By the bear cage in Varrock Palace gardens', items: resolveItems(['Zamorak godsword']) },
		{
			id: 107,
			desc: 'Top floor of the Yanille Watchtower',
			items: resolveItems(['Bull roarer', 'Dragon plateskirt', 'Climbing boots', 'Dragon chainbody'])
		},
		{
			id: 108,
			desc: 'Behind Miss Schism in Draynor Village',
			items: resolveItems(['Abyssal whip', 'Cape of legends', 'Spined chaps'])
		}
		// {
		// 	id: 109,
		// 	desc: 'North of Prifddinas by several maple trees',
		// 	items: resolveItems(["Bryophyta's staff", 'Nature tiara'])
		// }
	]
};

export const allStashUnitTiers = [
	beginnerStashes,
	easyStashes,
	mediumStashes,
	hardStashes,
	eliteStashes,
	masterStashes
];

export const allStashUnitsFlat = allStashUnitTiers.flatMap(i => i.units);
