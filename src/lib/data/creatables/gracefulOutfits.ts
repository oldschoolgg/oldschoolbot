import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const gracefulOutfitCreatables: Createable[] = [
	// Normal
	{
		name: 'Graceful',
		inputItems: new Bank({
			'Mark of grace': 260
		}),
		outputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1
		})
	},
	{
		name: 'Graceful hood',
		inputItems: new Bank({
			'Mark of grace': 35
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		})
	},
	{
		name: 'Graceful top',
		inputItems: new Bank({
			'Mark of grace': 55
		}),
		outputItems: new Bank({
			'Graceful top': 1
		})
	},
	{
		name: 'Graceful legs',
		inputItems: new Bank({
			'Mark of grace': 60
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		})
	},
	{
		name: 'Graceful gloves',
		inputItems: new Bank({
			'Mark of grace': 30
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		})
	},
	{
		name: 'Graceful boots',
		inputItems: new Bank({
			'Mark of grace': 40
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		})
	},
	{
		name: 'Graceful cape',
		inputItems: new Bank({
			'Mark of grace': 40
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		})
	},
	{
		name: 'Revert graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 208
		})
	},
	{
		name: 'Revert graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 28
		})
	},
	{
		name: 'Revert graceful top',
		inputItems: new Bank({
			'Graceful top': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 44
		})
	},
	{
		name: 'Revert graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 48
		})
	},
	{
		name: 'Revert graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 24
		})
	},
	{
		name: 'Revert graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 32
		})
	},
	{
		name: 'Revert graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1
		}),
		outputItems: new Bank({
			'Mark of grace': 32
		})
	},
	// Hallowed Sepulchre
	{
		name: 'Dark graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Dark dye': 6
		}),
		outputItems: new Bank({
			'Dark graceful hood': 1,
			'Dark graceful top': 1,
			'Dark graceful legs': 1,
			'Dark graceful gloves': 1,
			'Dark graceful boots': 1,
			'Dark graceful cape': 1
		})
	},
	{
		name: 'Dark graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful hood': 1
		})
	},
	{
		name: 'Dark graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful top': 1
		})
	},
	{
		name: 'Dark graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful legs': 1
		})
	},
	{
		name: 'Dark graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful gloves': 1
		})
	},
	{
		name: 'Dark graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful boots': 1
		})
	},
	{
		name: 'Dark graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Dark dye': 1
		}),
		outputItems: new Bank({
			'Dark graceful cape': 1
		})
	},
	{
		name: 'Revert dark graceful',
		inputItems: new Bank({
			'Dark graceful hood': 1,
			'Dark graceful top': 1,
			'Dark graceful legs': 1,
			'Dark graceful gloves': 1,
			'Dark graceful boots': 1,
			'Dark graceful cape': 1
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
	},
	{
		name: 'Revert dark graceful hood',
		inputItems: new Bank({
			'Dark graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert dark graceful top',
		inputItems: new Bank({
			'Dark graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert dark graceful legs',
		inputItems: new Bank({
			'Dark graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert dark graceful gloves',
		inputItems: new Bank({
			'Dark graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert dark graceful boots',
		inputItems: new Bank({
			'Dark graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert dark graceful cape',
		inputItems: new Bank({
			'Dark graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Arceuus
	{
		name: 'Arceuus graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Arceuus graceful hood': 1,
			'Arceuus graceful top': 1,
			'Arceuus graceful legs': 1,
			'Arceuus graceful gloves': 1,
			'Arceuus graceful boots': 1,
			'Arceuus graceful cape': 1
		})
	},
	{
		name: 'Arceuus graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful hood': 1
		})
	},
	{
		name: 'Arceuus graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful top': 1
		})
	},
	{
		name: 'Arceuus graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful legs': 1
		})
	},
	{
		name: 'Arceuus graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful gloves': 1
		})
	},
	{
		name: 'Arceuus graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful boots': 1
		})
	},
	{
		name: 'Arceuus graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Arceuus graceful cape': 1
		})
	},
	{
		name: 'Revert arceuus graceful',
		inputItems: new Bank({
			'Arceuus graceful hood': 1,
			'Arceuus graceful top': 1,
			'Arceuus graceful legs': 1,
			'Arceuus graceful gloves': 1,
			'Arceuus graceful boots': 1,
			'Arceuus graceful cape': 1
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
	},
	{
		name: 'Revert arceuus graceful hood',
		inputItems: new Bank({
			'Arceuus graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert arceuus graceful top',
		inputItems: new Bank({
			'Arceuus graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert arceuus graceful legs',
		inputItems: new Bank({
			'Arceuus graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert arceuus graceful gloves',
		inputItems: new Bank({
			'Arceuus graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert arceuus graceful boots',
		inputItems: new Bank({
			'Arceuus graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert arceuus graceful cape',
		inputItems: new Bank({
			'Arceuus graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Piscarilius
	{
		name: 'Piscarilius graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Piscarilius graceful hood': 1,
			'Piscarilius graceful top': 1,
			'Piscarilius graceful legs': 1,
			'Piscarilius graceful gloves': 1,
			'Piscarilius graceful boots': 1,
			'Piscarilius graceful cape': 1
		})
	},
	{
		name: 'Piscarilius graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful hood': 1
		})
	},
	{
		name: 'Piscarilius graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful top': 1
		})
	},
	{
		name: 'Piscarilius graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful legs': 1
		})
	},
	{
		name: 'Piscarilius graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful gloves': 1
		})
	},
	{
		name: 'Piscarilius graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful boots': 1
		})
	},
	{
		name: 'Piscarilius graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Piscarilius graceful cape': 1
		})
	},
	{
		name: 'Revert Piscarilius graceful',
		inputItems: new Bank({
			'Piscarilius graceful hood': 1,
			'Piscarilius graceful top': 1,
			'Piscarilius graceful legs': 1,
			'Piscarilius graceful gloves': 1,
			'Piscarilius graceful boots': 1,
			'Piscarilius graceful cape': 1
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
	},
	{
		name: 'Revert Piscarilius graceful hood',
		inputItems: new Bank({
			'Piscarilius graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful top',
		inputItems: new Bank({
			'Piscarilius graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful legs',
		inputItems: new Bank({
			'Piscarilius graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful gloves',
		inputItems: new Bank({
			'Piscarilius graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful boots',
		inputItems: new Bank({
			'Piscarilius graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Piscarilius graceful cape',
		inputItems: new Bank({
			'Piscarilius graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Lovakengj
	{
		name: 'Lovakengj graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Lovakengj graceful hood': 1,
			'Lovakengj graceful top': 1,
			'Lovakengj graceful legs': 1,
			'Lovakengj graceful gloves': 1,
			'Lovakengj graceful boots': 1,
			'Lovakengj graceful cape': 1
		})
	},
	{
		name: 'Lovakengj graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful hood': 1
		})
	},
	{
		name: 'Lovakengj graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful top': 1
		})
	},
	{
		name: 'Lovakengj graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful legs': 1
		})
	},
	{
		name: 'Lovakengj graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful gloves': 1
		})
	},
	{
		name: 'Lovakengj graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful boots': 1
		})
	},
	{
		name: 'Lovakengj graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Lovakengj graceful cape': 1
		})
	},
	{
		name: 'Revert Lovakengj graceful',
		inputItems: new Bank({
			'Lovakengj graceful hood': 1,
			'Lovakengj graceful top': 1,
			'Lovakengj graceful legs': 1,
			'Lovakengj graceful gloves': 1,
			'Lovakengj graceful boots': 1,
			'Lovakengj graceful cape': 1
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
	},
	{
		name: 'Revert Lovakengj graceful hood',
		inputItems: new Bank({
			'Lovakengj graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful top',
		inputItems: new Bank({
			'Lovakengj graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful legs',
		inputItems: new Bank({
			'Lovakengj graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful gloves',
		inputItems: new Bank({
			'Lovakengj graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful boots',
		inputItems: new Bank({
			'Lovakengj graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Lovakengj graceful cape',
		inputItems: new Bank({
			'Lovakengj graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Shayzien
	{
		name: 'Shayzien graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Shayzien graceful hood': 1,
			'Shayzien graceful top': 1,
			'Shayzien graceful legs': 1,
			'Shayzien graceful gloves': 1,
			'Shayzien graceful boots': 1,
			'Shayzien graceful cape': 1
		})
	},
	{
		name: 'Shayzien graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful hood': 1
		})
	},
	{
		name: 'Shayzien graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful top': 1
		})
	},
	{
		name: 'Shayzien graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful legs': 1
		})
	},
	{
		name: 'Shayzien graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful gloves': 1
		})
	},
	{
		name: 'Shayzien graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful boots': 1
		})
	},
	{
		name: 'Shayzien graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Shayzien graceful cape': 1
		})
	},
	{
		name: 'Revert Shayzien graceful',
		inputItems: new Bank({
			'Shayzien graceful hood': 1,
			'Shayzien graceful top': 1,
			'Shayzien graceful legs': 1,
			'Shayzien graceful gloves': 1,
			'Shayzien graceful boots': 1,
			'Shayzien graceful cape': 1
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
	},
	{
		name: 'Revert Shayzien graceful hood',
		inputItems: new Bank({
			'Shayzien graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Shayzien graceful top',
		inputItems: new Bank({
			'Shayzien graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Shayzien graceful legs',
		inputItems: new Bank({
			'Shayzien graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Shayzien graceful gloves',
		inputItems: new Bank({
			'Shayzien graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Shayzien graceful boots',
		inputItems: new Bank({
			'Shayzien graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Shayzien graceful cape',
		inputItems: new Bank({
			'Shayzien graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Hosidius
	{
		name: 'Hosidius graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Hosidius graceful hood': 1,
			'Hosidius graceful top': 1,
			'Hosidius graceful legs': 1,
			'Hosidius graceful gloves': 1,
			'Hosidius graceful boots': 1,
			'Hosidius graceful cape': 1
		})
	},
	{
		name: 'Hosidius graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful hood': 1
		})
	},
	{
		name: 'Hosidius graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful top': 1
		})
	},
	{
		name: 'Hosidius graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful legs': 1
		})
	},
	{
		name: 'Hosidius graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful gloves': 1
		})
	},
	{
		name: 'Hosidius graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful boots': 1
		})
	},
	{
		name: 'Hosidius graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Hosidius graceful cape': 1
		})
	},
	{
		name: 'Revert Hosidius graceful',
		inputItems: new Bank({
			'Hosidius graceful hood': 1,
			'Hosidius graceful top': 1,
			'Hosidius graceful legs': 1,
			'Hosidius graceful gloves': 1,
			'Hosidius graceful boots': 1,
			'Hosidius graceful cape': 1
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
	},
	{
		name: 'Revert Hosidius graceful hood',
		inputItems: new Bank({
			'Hosidius graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Hosidius graceful top',
		inputItems: new Bank({
			'Hosidius graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Hosidius graceful legs',
		inputItems: new Bank({
			'Hosidius graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Hosidius graceful gloves',
		inputItems: new Bank({
			'Hosidius graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Hosidius graceful boots',
		inputItems: new Bank({
			'Hosidius graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Hosidius graceful cape',
		inputItems: new Bank({
			'Hosidius graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Great Kourend
	{
		name: 'Kourend graceful',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Graceful top': 1,
			'Graceful legs': 1,
			'Graceful gloves': 1,
			'Graceful boots': 1,
			'Graceful cape': 1,
			'Mark of grace': 90
		}),
		outputItems: new Bank({
			'Kourend graceful hood': 1,
			'Kourend graceful top': 1,
			'Kourend graceful legs': 1,
			'Kourend graceful gloves': 1,
			'Kourend graceful boots': 1,
			'Kourend graceful cape': 1
		})
	},
	{
		name: 'Kourend graceful hood',
		inputItems: new Bank({
			'Graceful hood': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful hood': 1
		})
	},
	{
		name: 'Kourend graceful top',
		inputItems: new Bank({
			'Graceful top': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful top': 1
		})
	},
	{
		name: 'Kourend graceful legs',
		inputItems: new Bank({
			'Graceful legs': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful legs': 1
		})
	},
	{
		name: 'Kourend graceful gloves',
		inputItems: new Bank({
			'Graceful gloves': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful gloves': 1
		})
	},
	{
		name: 'Kourend graceful boots',
		inputItems: new Bank({
			'Graceful boots': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful boots': 1
		})
	},
	{
		name: 'Kourend graceful cape',
		inputItems: new Bank({
			'Graceful cape': 1,
			'Mark of grace': 15
		}),
		outputItems: new Bank({
			'Kourend graceful cape': 1
		})
	},
	{
		name: 'Revert Kourend graceful',
		inputItems: new Bank({
			'Kourend graceful hood': 1,
			'Kourend graceful top': 1,
			'Kourend graceful legs': 1,
			'Kourend graceful gloves': 1,
			'Kourend graceful boots': 1,
			'Kourend graceful cape': 1
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
	},
	{
		name: 'Revert Kourend graceful hood',
		inputItems: new Bank({
			'Kourend graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Kourend graceful top',
		inputItems: new Bank({
			'Kourend graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Kourend graceful legs',
		inputItems: new Bank({
			'Kourend graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Kourend graceful gloves',
		inputItems: new Bank({
			'Kourend graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Kourend graceful boots',
		inputItems: new Bank({
			'Kourend graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Kourend graceful cape',
		inputItems: new Bank({
			'Kourend graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Colossal Wyrm Agility (Varlamore graceful)
	{
		name: 'Varlamore graceful',
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
		name: 'Revert Varlamore graceful',
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
	},
	{
		name: 'Revert Varlamore graceful hood',
		inputItems: new Bank({
			'Varlamore graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Varlamore graceful top',
		inputItems: new Bank({
			'Varlamore graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Varlamore graceful legs',
		inputItems: new Bank({
			'Varlamore graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Varlamore graceful gloves',
		inputItems: new Bank({
			'Varlamore graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Varlamore graceful boots',
		inputItems: new Bank({
			'Varlamore graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Varlamore graceful cape',
		inputItems: new Bank({
			'Varlamore graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	},
	// Agility Arena (Brimhaven graceful)
	{
		name: 'Revert Brimhaven graceful',
		inputItems: new Bank({
			'Brimhaven graceful hood': 1,
			'Brimhaven graceful top': 1,
			'Brimhaven graceful legs': 1,
			'Brimhaven graceful gloves': 1,
			'Brimhaven graceful boots': 1,
			'Brimhaven graceful cape': 1
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
	},
	{
		name: 'Revert Brimhaven graceful hood',
		inputItems: new Bank({
			'Brimhaven graceful hood': 1
		}),
		outputItems: new Bank({
			'Graceful hood': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Brimhaven graceful top',
		inputItems: new Bank({
			'Brimhaven graceful top': 1
		}),
		outputItems: new Bank({
			'Graceful top': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Brimhaven graceful legs',
		inputItems: new Bank({
			'Brimhaven graceful legs': 1
		}),
		outputItems: new Bank({
			'Graceful legs': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Brimhaven graceful gloves',
		inputItems: new Bank({
			'Brimhaven graceful gloves': 1
		}),
		outputItems: new Bank({
			'Graceful gloves': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Brimhaven graceful boots',
		inputItems: new Bank({
			'Brimhaven graceful boots': 1
		}),
		outputItems: new Bank({
			'Graceful boots': 1
		}),
		noCl: true
	},
	{
		name: 'Revert Brimhaven graceful cape',
		inputItems: new Bank({
			'Brimhaven graceful cape': 1
		}),
		outputItems: new Bank({
			'Graceful cape': 1
		}),
		noCl: true
	}
];
