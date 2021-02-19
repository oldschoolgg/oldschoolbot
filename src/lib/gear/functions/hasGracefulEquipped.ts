import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasGracefulEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems([
			'Graceful hood',
			'Arceuus graceful hood',
			'Piscarilius graceful hood',
			'Lovakengj graceful hood',
			'Shayzien graceful hood',
			'Hosidius graceful hood',
			'Kourend graceful hood',
			'Brimhaven graceful hood',
			'Dark graceful hood'
		]),
		body: resolveItems([
			'Graceful top',
			'Arceuus graceful top',
			'Piscarilius graceful top',
			'Lovakengj graceful top',
			'Shayzien graceful top',
			'Hosidius graceful top',
			'Kourend graceful top',
			'Brimhaven graceful top',
			'Dark graceful top'
		]),
		legs: resolveItems([
			'Graceful legs',
			'Arceuus graceful legs',
			'Piscarilius graceful legs',
			'Lovakengj graceful legs',
			'Shayzien graceful legs',
			'Hosidius graceful legs',
			'Kourend graceful legs',
			'Brimhaven graceful legs',
			'Dark graceful legs'
		]),
		feet: resolveItems([
			'Graceful boots',
			'Arceuus graceful boots',
			'Piscarilius graceful boots',
			'Lovakengj graceful boots',
			'Shayzien graceful boots',
			'Hosidius graceful boots',
			'Kourend graceful boots',
			'Brimhaven graceful boots',
			'Dark graceful boots'
		]),
		hands: resolveItems([
			'Graceful gloves',
			'Arceuus graceful gloves',
			'Piscarilius graceful gloves',
			'Lovakengj graceful gloves',
			'Shayzien graceful gloves',
			'Hosidius graceful gloves',
			'Kourend graceful gloves',
			'Brimhaven graceful gloves',
			'Dark graceful gloves'
		]),
		cape: resolveItems([
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
			'Agility master cape'
		])
	});
}
