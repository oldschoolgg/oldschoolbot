import { Gear } from '../../structures/Gear';

const gracefulHoods = [
	'Graceful hood',
	'Arceuus graceful hood',
	'Piscarilius graceful hood',
	'Lovakengj graceful hood',
	'Shayzien graceful hood',
	'Hosidius graceful hood',
	'Kourend graceful hood',
	'Brimhaven graceful hood',
	'Dark graceful hood'
];

const gracefulTops = [
	'Graceful top',
	'Arceuus graceful top',
	'Piscarilius graceful top',
	'Lovakengj graceful top',
	'Shayzien graceful top',
	'Hosidius graceful top',
	'Kourend graceful top',
	'Brimhaven graceful top',
	'Dark graceful top'
];

const gracefulLegs = [
	'Graceful legs',
	'Arceuus graceful legs',
	'Piscarilius graceful legs',
	'Lovakengj graceful legs',
	'Shayzien graceful legs',
	'Hosidius graceful legs',
	'Kourend graceful legs',
	'Brimhaven graceful legs',
	'Dark graceful legs'
];

const gracefulFeet = [
	'Graceful boots',
	'Arceuus graceful boots',
	'Piscarilius graceful boots',
	'Lovakengj graceful boots',
	'Shayzien graceful boots',
	'Hosidius graceful boots',
	'Kourend graceful boots',
	'Brimhaven graceful boots',
	'Dark graceful boots'
];

const gracefulHands = [
	'Graceful gloves',
	'Arceuus graceful gloves',
	'Piscarilius graceful gloves',
	'Lovakengj graceful gloves',
	'Shayzien graceful gloves',
	'Hosidius graceful gloves',
	'Kourend graceful gloves',
	'Brimhaven graceful gloves',
	'Dark graceful gloves'
];

const gracefulCapes = [
	'Graceful cape',
	'Arceuus graceful cape',
	'Piscarilius graceful cape',
	'Lovakengj graceful cape',
	'Shayzien graceful cape',
	'Hosidius graceful cape',
	'Kourend graceful cape',
	'Brimhaven graceful cape',
	'Dark graceful cape',
	'Agility cape',
	'Agility cape (t)',
	'Max cape'
];

export function hasGracefulEquipped(setup: Gear) {
	return [gracefulHoods, gracefulTops, gracefulLegs, gracefulFeet, gracefulHands, gracefulCapes].every(type =>
		setup.hasEquipped(type, false)
	);
}
