import { itemID } from 'oldschooljs';

import { type BingoChallenge, bingoBoardSchema } from '@/lib/bingo/bingoTypes.js';

function drop(id: string, name: string, items: string[], quantity?: number): BingoChallenge {
	const base = { id, name, description: `Earn ${name} during the season.`, iconItemID: itemID(items[0]) };
	const targetItemIDs = items.map(i => itemID(i));
	return quantity
		? { ...base, type: 'item_quantity', targetItemIDs, requiredQuantity: quantity }
		: { ...base, type: 'item_drop', targetItemIDs };
}

function set(id: string, name: string, sets: string[][]): BingoChallenge {
	return {
		id,
		name,
		description: `Earn every component of ${name} during the season, across the community.`,
		iconItemID: itemID(sets[0][0]),
		type: 'custom',
		evaluator: 'item_sets',
		itemSets: sets.map(items => items.map(i => [itemID(i)]))
	};
}

// A starter configuration, copied into each season so later edits never change historical boards.
// Administrators can supply a replacement 28-challenge JSON configuration when creating a season.
export function defaultBingoChallenges(): BingoChallenge[] {
	return bingoBoardSchema.parse([
		set('torva', 'Full Torva drops', [
			['Torva full helm (damaged)', 'Torva platebody (damaged)', 'Torva platelegs (damaged)']
		]),
		drop('pet', 'Any skilling pet', [
			'Beaver',
			'Heron',
			'Rock golem',
			'Rocky',
			'Giant squirrel',
			'Rift guardian',
			'Baby chinchompa',
			'Tangleroot'
		]),
		drop('redwoods', '5,000 Redwood logs', ['Redwood logs'], 5000),
		drop('big_fish', 'Big shark / swordfish', ['Big shark', 'Big swordfish']),
		drop('zenyte', 'Zenyte shard', ['Zenyte shard']),
		drop('heart', 'Imbued heart', ['Imbued heart']),
		drop('cox', 'Twisted bow / Kodai / Buckler', ['Twisted bow', 'Kodai insignia', 'Twisted buckler']),
		drop('synapse', 'Tormented synapse', ['Tormented synapse']),
		drop('sigil', 'Any Corp sigil', ['Arcane sigil', 'Spectral sigil', 'Elysian sigil']),
		drop('crabs', '10,000 Raw dark crab', ['Raw dark crab'], 10_000),
		drop('blood', 'Blood shard', ['Blood shard']),
		drop('tome', 'Tome of fire / water', ['Tome of fire (empty)', 'Tome of water (empty)']),
		drop('goggles', 'Gnome goggles', ['Gnome goggles']),
		drop('warhammer', 'Dragon warhammer', ['Dragon warhammer']),
		drop('rev', 'Any Revenant weapon', ["Craw's bow (u)", "Viggora's chainmace (u)", "Thammaron's sceptre (u)"]),
		drop('hilt', 'Any godsword hilt', [
			'Armadyl hilt',
			'Bandos hilt',
			'Saradomin hilt',
			'Zamorak hilt',
			'Ancient hilt'
		]),
		set('barrows', 'One full Barrows set', [
			["Ahrim's hood", "Ahrim's robetop", "Ahrim's robeskirt", "Ahrim's staff"],
			["Dharok's helm", "Dharok's platebody", "Dharok's platelegs", "Dharok's greataxe"],
			["Guthan's helm", "Guthan's platebody", "Guthan's chainskirt", "Guthan's warspear"],
			["Karil's coif", "Karil's leathertop", "Karil's leatherskirt", "Karil's crossbow"],
			["Torag's helm", "Torag's platebody", "Torag's platelegs", "Torag's hammers"],
			["Verac's helm", "Verac's brassard", "Verac's plateskirt", "Verac's flail"]
		]),
		set('voidwaker', 'All Voidwaker pieces', [['Voidwaker blade', 'Voidwaker hilt', 'Voidwaker gem']]),
		drop('visage', 'Any visage', ['Draconic visage', 'Skeletal visage', 'Wyvern visage']),
		drop('bone', 'Curved bone', ['Curved bone']),
		drop('crystal', 'Enhanced weapon seed', ['Enhanced crystal weapon seed']),
		drop('jaw', 'Basilisk jaw', ['Basilisk jaw']),
		drop('axe', 'Broken zombie axe', ['Broken zombie axe']),
		drop('wand', 'Dragon hunter wand', ['Dragon hunter wand']),
		drop('glory', 'Eternal glory', ['Amulet of eternal glory']),
		drop('toa', 'Shadow / Fang', ["Tumeken's shadow (uncharged)", "Osmumten's fang"]),
		drop('tob', 'Scythe / Rapier', ['Scythe of vitur (uncharged)', 'Ghrazi rapier']),
		drop('mace', 'Inquisitor mace', ["Inquisitor's mace"])
	]);
}
