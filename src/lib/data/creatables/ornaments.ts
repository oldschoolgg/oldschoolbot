import { resolveBank, resolveNameBank } from 'oldschooljs/dist/util';

import { Createable } from '../createables';

export const ornamentKits: Createable[] = [
	{
		name: 'Dragon defender (t)',
		inputItems: resolveNameBank({ 'Dragon defender': 1, 'Dragon defender ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Dragon defender (t)': 1 })
	},
	{
		name: 'Revert dragon defender (t)',
		inputItems: resolveNameBank({ 'Dragon defender (t)': 1 }),
		outputItems: resolveNameBank({ 'Dragon defender': 1, 'Dragon defender ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Rune defender (t)',
		inputItems: resolveNameBank({ 'Rune defender': 1, 'Rune defender ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Rune defender (t)': 1 })
	},
	{
		name: 'Revert rune defender (t)',
		inputItems: resolveNameBank({ 'Rune defender (t)': 1 }),
		outputItems: resolveNameBank({ 'Rune defender': 1, 'Rune defender ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Dragon pickaxe (or)',
		inputItems: resolveNameBank({ 'Dragon pickaxe': 1, 'Zalcano shard': 1 }),
		outputItems: resolveNameBank({ 'Dragon pickaxe (or)': 1 })
	},
	{
		name: 'Revert dragon pickaxe (or)',
		inputItems: resolveNameBank({ 'Dragon pickaxe (or)': 1 }),
		outputItems: resolveNameBank({ 'Dragon pickaxe': 1, 'Zalcano shard': 1 }),
		noCl: true
	},
	{
		name: 'Dragon sq shield (g)',
		inputItems: resolveNameBank({ 'Dragon sq shield ornament kit': 1, 'Dragon sq shield': 1 }),
		outputItems: resolveNameBank({ 'Dragon sq shield (g)': 1 })
	},
	{
		name: 'Revert dragon sq shield (g)',
		inputItems: resolveNameBank({ 'Dragon sq shield (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon sq shield ornament kit': 1, 'Dragon sq shield': 1 }),
		noCl: true
	},
	{
		name: 'Dragon full helm (g)',
		inputItems: resolveNameBank({ 'Dragon full helm ornament kit': 1, 'Dragon full helm': 1 }),
		outputItems: resolveNameBank({ 'Dragon full helm (g)': 1 })
	},
	{
		name: 'Revert dragon full helm (g)',
		inputItems: resolveNameBank({ 'Dragon full helm (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon full helm ornament kit': 1, 'Dragon full helm': 1 }),
		noCl: true
	},
	{
		name: 'Dragon platebody (g)',
		inputItems: resolveNameBank({ 'Dragon platebody ornament kit': 1, 'Dragon platebody': 1 }),
		outputItems: resolveNameBank({ 'Dragon platebody (g)': 1 })
	},
	{
		name: 'Revert dragon platebody (g)',
		inputItems: resolveNameBank({ 'Dragon platebody (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon platebody ornament kit': 1, 'Dragon platebody': 1 }),
		noCl: true
	},
	{
		name: 'Dragon kiteshield (g)',
		inputItems: resolveNameBank({ 'Dragon kiteshield ornament kit': 1, 'Dragon kiteshield': 1 }),
		outputItems: resolveNameBank({ 'Dragon kiteshield (g)': 1 })
	},
	{
		name: 'Revert dragon kiteshield (g)',
		inputItems: resolveNameBank({ 'Dragon kiteshield (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon kiteshield ornament kit': 1, 'Dragon kiteshield': 1 }),
		noCl: true
	},
	{
		name: 'Dragon boots (g)',
		inputItems: resolveNameBank({ 'Dragon boots ornament kit': 1, 'Dragon boots': 1 }),
		outputItems: resolveNameBank({ 'Dragon boots (g)': 1 })
	},
	{
		name: 'Revert dragon boots (g)',
		inputItems: resolveNameBank({ 'Dragon boots (g)': 1 }),
		outputItems: resolveNameBank({ 'Dragon boots ornament kit': 1, 'Dragon boots': 1 }),
		noCl: true
	},
	{
		name: 'Dragon scimitar (or)',
		inputItems: resolveNameBank({ 'Dragon scimitar ornament kit': 1, 'Dragon scimitar': 1 }),
		outputItems: resolveNameBank({ 'Dragon scimitar (or)': 1 })
	},
	{
		name: 'Revert dragon scimitar (or)',
		inputItems: resolveNameBank({ 'Dragon scimitar (or)': 1 }),
		outputItems: resolveNameBank({ 'Dragon scimitar ornament kit': 1, 'Dragon scimitar': 1 }),
		noCl: true
	},
	{
		name: 'Dragon platelegs (g)',
		inputItems: resolveNameBank({ 'Dragon platelegs': 1, 'Dragon legs/skirt ornament kit': 1 }),
		outputItems: resolveNameBank({ 'Dragon platelegs (g)': 1 })
	},
	{
		name: 'Revert dragon platelegs (g)',
		inputItems: resolveNameBank({ 'Dragon platelegs (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon platelegs': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dragon plateskirt (g)',
		inputItems: resolveNameBank({
			'Dragon plateskirt': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		outputItems: resolveNameBank({ 'Dragon plateskirt (g)': 1 })
	},
	{
		name: 'Revert dragon plateskirt (g)',
		inputItems: resolveNameBank({ 'Dragon plateskirt (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon plateskirt': 1,
			'Dragon legs/skirt ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dragon chainbody (g)',
		inputItems: resolveNameBank({
			'Dragon chainbody': 1,
			'Dragon chainbody ornament kit': 1
		}),
		outputItems: resolveNameBank({ 'Dragon chainbody (g)': 1 })
	},
	{
		name: 'Revert dragon chainbody (g)',
		inputItems: resolveNameBank({ 'Dragon chainbody (g)': 1 }),
		outputItems: resolveNameBank({
			'Dragon chainbody': 1,
			'Dragon chainbody ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Amulet of fury (or)',
		inputItems: resolveNameBank({ 'Amulet of fury': 1, 'Fury ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Amulet of fury (or)': 1
		})
	},
	{
		name: 'Revert amulet of fury (or)',
		inputItems: resolveNameBank({
			'Amulet of fury (or)': 1
		}),
		outputItems: resolveNameBank({ 'Amulet of fury': 1, 'Fury ornament kit': 1 }),
		noCl: true
	},
	// Godswords
	{
		name: 'Zamorak godsword (or)',
		inputItems: resolveNameBank({ 'Zamorak godsword': 1, 'Zamorak godsword ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Zamorak godsword (or)': 1
		})
	},
	{
		name: 'Revert zamorak godsword (or)',
		inputItems: resolveNameBank({
			'Zamorak godsword (or)': 1
		}),
		outputItems: resolveNameBank({ 'Zamorak godsword': 1, 'Zamorak godsword ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Bandos godsword (or)',
		inputItems: resolveNameBank({ 'Bandos godsword': 1, 'Bandos godsword ornament kit': 1 }),
		outputItems: resolveNameBank({
			'Bandos godsword (or)': 1
		})
	},
	{
		name: 'Revert bandos godsword (or)',
		inputItems: resolveNameBank({
			'Bandos godsword (or)': 1
		}),
		outputItems: resolveNameBank({ 'Bandos godsword': 1, 'Bandos godsword ornament kit': 1 }),
		noCl: true
	},
	{
		name: 'Saradomin godsword (or)',
		inputItems: resolveNameBank({
			'Saradomin godsword': 1,
			'Saradomin godsword ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Saradomin godsword (or)': 1
		})
	},
	{
		name: 'Revert saradomin godsword (or)',
		inputItems: resolveNameBank({
			'Saradomin godsword (or)': 1
		}),
		outputItems: resolveNameBank({
			'Saradomin godsword': 1,
			'Saradomin godsword ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Armadyl godsword (or)',
		inputItems: resolveNameBank({
			'Armadyl godsword': 1,
			'Armadyl godsword ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Armadyl godsword (or)': 1
		})
	},
	{
		name: 'Revert armadyl godsword (or)',
		inputItems: resolveNameBank({
			'Armadyl godsword (or)': 1
		}),
		outputItems: resolveNameBank({
			'Armadyl godsword': 1,
			'Armadyl godsword ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Amulet of torture (or)',
		inputItems: resolveNameBank({
			'Amulet of torture': 1,
			'Torture ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Amulet of torture (or)': 1
		})
	},
	{
		name: 'Revert amulet of torture (or)',
		inputItems: resolveNameBank({
			'Amulet of torture (or)': 1
		}),
		outputItems: resolveNameBank({
			'Amulet of torture': 1,
			'Torture ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Necklace of anguish (or)',
		inputItems: resolveNameBank({
			'Necklace of anguish': 1,
			'Anguish ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Necklace of anguish (or)': 1
		})
	},
	{
		name: 'Revert necklace of anguish (or)',
		inputItems: resolveNameBank({
			'Necklace of anguish (or)': 1
		}),
		outputItems: resolveNameBank({
			'Necklace of anguish': 1,
			'Anguish ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Tormented bracelet (or)',
		inputItems: resolveNameBank({
			'Tormented bracelet': 1,
			'Tormented ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Tormented bracelet (or)': 1
		})
	},
	{
		name: 'Revert tormented bracelet (or)',
		inputItems: resolveNameBank({
			'Tormented bracelet (or)': 1
		}),
		outputItems: resolveNameBank({
			'Tormented bracelet': 1,
			'Tormented ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Occult necklace (or)',
		inputItems: resolveNameBank({
			'Occult necklace': 1,
			'Occult ornament kit': 1
		}),
		outputItems: resolveNameBank({
			'Occult necklace (or)': 1
		})
	},
	{
		name: 'Revert occult necklace (or)',
		inputItems: resolveNameBank({
			'Occult necklace (or)': 1
		}),
		outputItems: resolveNameBank({
			'Occult necklace': 1,
			'Occult ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Rune scimitar (guthix)',
		inputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (guthix)': 1
		}),
		outputItems: resolveBank({
			23_330: 1
		})
	},
	{
		name: 'Revert rune scimitar (guthix)',
		inputItems: resolveBank({
			23_330: 1
		}),
		outputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (guthix)': 1
		}),
		noCl: true
	},
	{
		name: 'Rune scimitar (saradomin)',
		inputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (saradomin)': 1
		}),
		outputItems: resolveBank({
			23_332: 1
		})
	},
	{
		name: 'Revert rune scimitar (saradomin)',
		inputItems: resolveBank({
			23_332: 1
		}),
		outputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (saradomin)': 1
		}),
		noCl: true
	},
	{
		name: 'Rune scimitar (zamorak)',
		inputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (zamorak)': 1
		}),
		outputItems: resolveBank({
			23_334: 1
		})
	},
	{
		name: 'Revert rune scimitar (zamorak)',
		inputItems: resolveBank({
			23_334: 1
		}),
		outputItems: resolveNameBank({
			'Rune scimitar': 1,
			'Rune scimitar ornament kit (zamorak)': 1
		}),
		noCl: true
	},
	{
		name: 'Tzhaar-ket-om (t)',
		inputItems: resolveNameBank({
			'Tzhaar-ket-om': 1,
			'Tzhaar-ket-om ornament kit': 1
		}),
		outputItems: resolveBank({
			'Tzhaar-ket-om (t)': 1
		})
	},
	{
		name: 'Revert tzhaar-ket-om (t)',
		inputItems: resolveBank({
			'Tzhaar-ket-om (t)': 1
		}),
		outputItems: resolveNameBank({
			'Tzhaar-ket-om': 1,
			'Tzhaar-ket-om ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Berserker necklace (or)',
		inputItems: resolveNameBank({
			'Berserker necklace': 1,
			'Berserker necklace ornament kit': 1
		}),
		outputItems: resolveBank({
			'Berserker necklace (or)': 1
		})
	},
	{
		name: 'Revert berserker necklace (or)',
		inputItems: resolveBank({
			'Berserker necklace (or)': 1
		}),
		outputItems: resolveNameBank({
			'Berserker necklace': 1,
			'Berserker necklace ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dark infinity hat',
		inputItems: resolveNameBank({
			'Infinity hat': 1,
			'Dark infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Dark infinity hat': 1
		})
	},
	{
		name: 'Revert dark infinity hat',
		inputItems: resolveBank({
			'Dark infinity hat': 1
		}),
		outputItems: resolveNameBank({
			'Infinity hat': 1,
			'Dark infinity colour kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dark infinity top',
		inputItems: resolveNameBank({
			'Infinity top': 1,
			'Dark infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Dark infinity top': 1
		})
	},
	{
		name: 'Revert dark infinity top',
		inputItems: resolveBank({
			'Dark infinity top': 1
		}),
		outputItems: resolveNameBank({
			'Infinity top': 1,
			'Dark infinity colour kit': 1
		}),
		noCl: true
	},
	{
		name: 'Dark infinity bottoms',
		inputItems: resolveNameBank({
			'Infinity bottoms': 1,
			'Dark infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Dark infinity bottoms': 1
		})
	},
	{
		name: 'Revert dark infinity bottoms',
		inputItems: resolveBank({
			'Dark infinity bottoms': 1
		}),
		outputItems: resolveNameBank({
			'Infinity bottoms': 1,
			'Dark infinity colour kit': 1
		}),
		noCl: true
	},
	{
		name: 'Light infinity hat',
		inputItems: resolveNameBank({
			'Infinity hat': 1,
			'Light infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Light infinity hat': 1
		})
	},
	{
		name: 'Revert light infinity hat',
		inputItems: resolveBank({
			'Light infinity hat': 1
		}),
		outputItems: resolveNameBank({
			'Infinity hat': 1,
			'Light infinity colour kit': 1
		}),
		noCl: true
	},
	{
		name: 'Light infinity top',
		inputItems: resolveNameBank({
			'Infinity top': 1,
			'Light infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Light infinity top': 1
		})
	},
	{
		name: 'Revert light infinity top',
		inputItems: resolveBank({
			'Light infinity top': 1
		}),
		outputItems: resolveNameBank({
			'Infinity top': 1,
			'Light infinity colour kit': 1
		}),
		noCl: true
	},
	{
		name: 'Light infinity bottoms',
		inputItems: resolveNameBank({
			'Infinity bottoms': 1,
			'Light infinity colour kit': 1
		}),
		outputItems: resolveBank({
			'Light infinity bottoms': 1
		})
	},
	{
		name: 'Revert light infinity bottoms',
		inputItems: resolveBank({
			'Light infinity bottoms': 1
		}),
		outputItems: resolveNameBank({
			'Infinity bottoms': 1,
			'Light infinity colour kit': 1
		}),
		noCl: true
	}
];
