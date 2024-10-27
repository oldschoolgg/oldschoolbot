import { Bank } from 'oldschooljs';

import itemID from '../../util/itemID';
import type { Createable } from '../createables';

export const gracefulOutfitCreatables: Createable[] = [
	// Normal
	{
		name: 'Graceful',
		inputItems: {
			[itemID('Mark of grace')]: 260
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		}
	},
	{
		name: 'Graceful hood',
		inputItems: {
			[itemID('Mark of grace')]: 35
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		}
	},
	{
		name: 'Graceful top',
		inputItems: {
			[itemID('Mark of grace')]: 55
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		}
	},
	{
		name: 'Graceful legs',
		inputItems: {
			[itemID('Mark of grace')]: 60
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		}
	},
	{
		name: 'Graceful gloves',
		inputItems: {
			[itemID('Mark of grace')]: 30
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		}
	},
	{
		name: 'Graceful boots',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		}
	},
	{
		name: 'Graceful cape',
		inputItems: {
			[itemID('Mark of grace')]: 40
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		}
	},
	{
		name: 'Revert graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 208
		}
	},
	{
		name: 'Revert graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 28
		}
	},
	{
		name: 'Revert graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 44
		}
	},
	{
		name: 'Revert graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 48
		}
	},
	{
		name: 'Revert graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 24
		}
	},
	{
		name: 'Revert graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 32
		}
	},
	{
		name: 'Revert graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1
		},
		outputItems: {
			[itemID('Mark of grace')]: 32
		}
	},
	// Hallowed Sepulchre
	{
		name: 'Dark Graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Dark dye')]: 6
		},
		outputItems: {
			[itemID('Dark graceful hood')]: 1,
			[itemID('Dark graceful top')]: 1,
			[itemID('Dark graceful legs')]: 1,
			[itemID('Dark graceful gloves')]: 1,
			[itemID('Dark graceful boots')]: 1,
			[itemID('Dark graceful cape')]: 1
		}
	},
	{
		name: 'Dark Graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful hood')]: 1
		}
	},
	{
		name: 'Dark graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful top')]: 1
		}
	},
	{
		name: 'Dark graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful legs')]: 1
		}
	},
	{
		name: 'Dark graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful gloves')]: 1
		}
	},
	{
		name: 'Dark graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful boots')]: 1
		}
	},
	{
		name: 'Dark graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Dark dye': 1
		}),
		outputItems: {
			[itemID('Dark graceful cape')]: 1
		}
	},
	// Arceuus
	{
		name: 'Arceuus graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Arceuus graceful hood')]: 1,
			[itemID('Arceuus graceful top')]: 1,
			[itemID('Arceuus graceful legs')]: 1,
			[itemID('Arceuus graceful gloves')]: 1,
			[itemID('Arceuus graceful boots')]: 1,
			[itemID('Arceuus graceful cape')]: 1
		}
	},
	{
		name: 'Arceuus graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful hood')]: 1
		}
	},
	{
		name: 'Arceuus graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful top')]: 1
		}
	},
	{
		name: 'Arceuus graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful legs')]: 1
		}
	},
	{
		name: 'Arceuus graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful gloves')]: 1
		}
	},
	{
		name: 'Arceuus graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful boots')]: 1
		}
	},
	{
		name: 'Arceuus graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Arceuus graceful cape')]: 1
		}
	},
	{
		name: 'Revert arceuus graceful',
		inputItems: {
			[itemID('Arceuus graceful hood')]: 1,
			[itemID('Arceuus graceful top')]: 1,
			[itemID('Arceuus graceful legs')]: 1,
			[itemID('Arceuus graceful gloves')]: 1,
			[itemID('Arceuus graceful boots')]: 1,
			[itemID('Arceuus graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful hood',
		inputItems: {
			[itemID('Arceuus graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful top',
		inputItems: {
			[itemID('Arceuus graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful legs',
		inputItems: {
			[itemID('Arceuus graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful gloves',
		inputItems: {
			[itemID('Arceuus graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful boots',
		inputItems: {
			[itemID('Arceuus graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert arceuus graceful cape',
		inputItems: {
			[itemID('Arceuus graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	// Piscarilius
	{
		name: 'Piscarilius graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Piscarilius graceful hood')]: 1,
			[itemID('Piscarilius graceful top')]: 1,
			[itemID('Piscarilius graceful legs')]: 1,
			[itemID('Piscarilius graceful gloves')]: 1,
			[itemID('Piscarilius graceful boots')]: 1,
			[itemID('Piscarilius graceful cape')]: 1
		}
	},
	{
		name: 'Piscarilius graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful hood')]: 1
		}
	},
	{
		name: 'Piscarilius graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful top')]: 1
		}
	},
	{
		name: 'Piscarilius graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful legs')]: 1
		}
	},
	{
		name: 'Piscarilius graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful gloves')]: 1
		}
	},
	{
		name: 'Piscarilius graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful boots')]: 1
		}
	},
	{
		name: 'Piscarilius graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Piscarilius graceful cape')]: 1
		}
	},
	{
		name: 'Revert Piscarilius graceful',
		inputItems: {
			[itemID('Piscarilius graceful hood')]: 1,
			[itemID('Piscarilius graceful top')]: 1,
			[itemID('Piscarilius graceful legs')]: 1,
			[itemID('Piscarilius graceful gloves')]: 1,
			[itemID('Piscarilius graceful boots')]: 1,
			[itemID('Piscarilius graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful hood',
		inputItems: {
			[itemID('Piscarilius graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful top',
		inputItems: {
			[itemID('Piscarilius graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful legs',
		inputItems: {
			[itemID('Piscarilius graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful gloves',
		inputItems: {
			[itemID('Piscarilius graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful boots',
		inputItems: {
			[itemID('Piscarilius graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful cape',
		inputItems: {
			[itemID('Piscarilius graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	// Lovakengj
	{
		name: 'Lovakengj graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Lovakengj graceful hood')]: 1,
			[itemID('Lovakengj graceful top')]: 1,
			[itemID('Lovakengj graceful legs')]: 1,
			[itemID('Lovakengj graceful gloves')]: 1,
			[itemID('Lovakengj graceful boots')]: 1,
			[itemID('Lovakengj graceful cape')]: 1
		}
	},
	{
		name: 'Lovakengj graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful hood')]: 1
		}
	},
	{
		name: 'Lovakengj graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful top')]: 1
		}
	},
	{
		name: 'Lovakengj graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful legs')]: 1
		}
	},
	{
		name: 'Lovakengj graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful gloves')]: 1
		}
	},
	{
		name: 'Lovakengj graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful boots')]: 1
		}
	},
	{
		name: 'Lovakengj graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Lovakengj graceful cape')]: 1
		}
	},
	{
		name: 'Revert Lovakengj graceful',
		inputItems: {
			[itemID('Lovakengj graceful hood')]: 1,
			[itemID('Lovakengj graceful top')]: 1,
			[itemID('Lovakengj graceful legs')]: 1,
			[itemID('Lovakengj graceful gloves')]: 1,
			[itemID('Lovakengj graceful boots')]: 1,
			[itemID('Lovakengj graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful hood',
		inputItems: {
			[itemID('Lovakengj graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful top',
		inputItems: {
			[itemID('Lovakengj graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful legs',
		inputItems: {
			[itemID('Lovakengj graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful gloves',
		inputItems: {
			[itemID('Lovakengj graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful boots',
		inputItems: {
			[itemID('Lovakengj graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful cape',
		inputItems: {
			[itemID('Lovakengj graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	// Shayzien
	{
		name: 'Shayzien graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Shayzien graceful hood')]: 1,
			[itemID('Shayzien graceful top')]: 1,
			[itemID('Shayzien graceful legs')]: 1,
			[itemID('Shayzien graceful gloves')]: 1,
			[itemID('Shayzien graceful boots')]: 1,
			[itemID('Shayzien graceful cape')]: 1
		}
	},
	{
		name: 'Shayzien graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful hood')]: 1
		}
	},
	{
		name: 'Shayzien graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful top')]: 1
		}
	},
	{
		name: 'Shayzien graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful legs')]: 1
		}
	},
	{
		name: 'Shayzien graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful gloves')]: 1
		}
	},
	{
		name: 'Shayzien graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful boots')]: 1
		}
	},
	{
		name: 'Shayzien graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Shayzien graceful cape')]: 1
		}
	},
	{
		name: 'Revert Shayzien graceful',
		inputItems: {
			[itemID('Shayzien graceful hood')]: 1,
			[itemID('Shayzien graceful top')]: 1,
			[itemID('Shayzien graceful legs')]: 1,
			[itemID('Shayzien graceful gloves')]: 1,
			[itemID('Shayzien graceful boots')]: 1,
			[itemID('Shayzien graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful hood',
		inputItems: {
			[itemID('Shayzien graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful top',
		inputItems: {
			[itemID('Shayzien graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful legs',
		inputItems: {
			[itemID('Shayzien graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful gloves',
		inputItems: {
			[itemID('Shayzien graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful boots',
		inputItems: {
			[itemID('Shayzien graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Shayzien graceful cape',
		inputItems: {
			[itemID('Shayzien graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	// Hosidius
	{
		name: 'Hosidius graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Hosidius graceful hood')]: 1,
			[itemID('Hosidius graceful top')]: 1,
			[itemID('Hosidius graceful legs')]: 1,
			[itemID('Hosidius graceful gloves')]: 1,
			[itemID('Hosidius graceful boots')]: 1,
			[itemID('Hosidius graceful cape')]: 1
		}
	},
	{
		name: 'Hosidius graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful hood')]: 1
		}
	},
	{
		name: 'Hosidius graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful top')]: 1
		}
	},
	{
		name: 'Hosidius graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful legs')]: 1
		}
	},
	{
		name: 'Hosidius graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful gloves')]: 1
		}
	},
	{
		name: 'Hosidius graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful boots')]: 1
		}
	},
	{
		name: 'Hosidius graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Hosidius graceful cape')]: 1
		}
	},
	{
		name: 'Revert Hosidius graceful',
		inputItems: {
			[itemID('Hosidius graceful hood')]: 1,
			[itemID('Hosidius graceful top')]: 1,
			[itemID('Hosidius graceful legs')]: 1,
			[itemID('Hosidius graceful gloves')]: 1,
			[itemID('Hosidius graceful boots')]: 1,
			[itemID('Hosidius graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful hood',
		inputItems: {
			[itemID('Hosidius graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful top',
		inputItems: {
			[itemID('Hosidius graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful legs',
		inputItems: {
			[itemID('Hosidius graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful gloves',
		inputItems: {
			[itemID('Hosidius graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful boots',
		inputItems: {
			[itemID('Hosidius graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},

		noCl: true
	},
	{
		name: 'Revert Hosidius graceful cape',
		inputItems: {
			[itemID('Hosidius graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},

		noCl: true
	},
	// Great Kourend
	{
		name: 'Kourend graceful',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 90
		},
		outputItems: {
			[itemID('Kourend graceful hood')]: 1,
			[itemID('Kourend graceful top')]: 1,
			[itemID('Kourend graceful legs')]: 1,
			[itemID('Kourend graceful gloves')]: 1,
			[itemID('Kourend graceful boots')]: 1,
			[itemID('Kourend graceful cape')]: 1
		}
	},
	{
		name: 'Kourend graceful hood',
		inputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful hood')]: 1
		}
	},
	{
		name: 'Kourend graceful top',
		inputItems: {
			[itemID('Graceful top')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful top')]: 1
		}
	},
	{
		name: 'Kourend graceful legs',
		inputItems: {
			[itemID('Graceful legs')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful legs')]: 1
		}
	},
	{
		name: 'Kourend graceful gloves',
		inputItems: {
			[itemID('Graceful gloves')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful gloves')]: 1
		}
	},
	{
		name: 'Kourend graceful boots',
		inputItems: {
			[itemID('Graceful boots')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful boots')]: 1
		}
	},
	{
		name: 'Kourend graceful cape',
		inputItems: {
			[itemID('Graceful cape')]: 1,
			[itemID('Mark of grace')]: 15
		},
		outputItems: {
			[itemID('Kourend graceful cape')]: 1
		}
	},
	{
		name: 'Revert Kourend graceful',
		inputItems: {
			[itemID('Kourend graceful hood')]: 1,
			[itemID('Kourend graceful top')]: 1,
			[itemID('Kourend graceful legs')]: 1,
			[itemID('Kourend graceful gloves')]: 1,
			[itemID('Kourend graceful boots')]: 1,
			[itemID('Kourend graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1,
			[itemID('Graceful top')]: 1,
			[itemID('Graceful legs')]: 1,
			[itemID('Graceful gloves')]: 1,
			[itemID('Graceful boots')]: 1,
			[itemID('Graceful cape')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful hood',
		inputItems: {
			[itemID('Kourend graceful hood')]: 1
		},
		outputItems: {
			[itemID('Graceful hood')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful top',
		inputItems: {
			[itemID('Kourend graceful top')]: 1
		},
		outputItems: {
			[itemID('Graceful top')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful legs',
		inputItems: {
			[itemID('Kourend graceful legs')]: 1
		},
		outputItems: {
			[itemID('Graceful legs')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful gloves',
		inputItems: {
			[itemID('Kourend graceful gloves')]: 1
		},
		outputItems: {
			[itemID('Graceful gloves')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful boots',
		inputItems: {
			[itemID('Kourend graceful boots')]: 1
		},
		outputItems: {
			[itemID('Graceful boots')]: 1
		},
		noCl: true
	},
	{
		name: 'Revert Kourend graceful cape',
		inputItems: {
			[itemID('Kourend graceful cape')]: 1
		},
		outputItems: {
			[itemID('Graceful cape')]: 1
		},
		noCl: true
	},
	// Colossal Wyrm Agility (Varlamore graceful)
	{
		name: 'Varlamore graceful outfit',
		inputItems: new Bank({
			'Graceful crafting kit': 1,
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1
		}),
		outputItems: new Bank({
			'Varlamore graceful hood': 1,
			'Varlamore graceful top': 1,
			'Varlamore graceful legs': 1,
			'Varlamore graceful gloves': 1,
			'Varlamore graceful boots': 1,
			'Varlamore graceful cape': 1
		})
	},
	{
		name: 'Revert Varlamore graceful outfit',
		inputItems: new Bank({
			'Varlamore graceful hood': 1,
			'Varlamore graceful top': 1,
			'Varlamore graceful legs': 1,
			'Varlamore graceful gloves': 1,
			'Varlamore graceful boots': 1,
			'Varlamore graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1
		}),
		noCl: true
	}
];
