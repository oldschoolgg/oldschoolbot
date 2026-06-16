import { BSOItem } from '@/lib/bso/BSOItem.js';

import type { GearSetup, GearSetupType } from '@oldschoolgg/gear';
import { randArrItem } from 'node-rng';
import { Bank, Items } from 'oldschooljs';

import type { MUserClass } from '@/lib/user/MUser.js';

export const BEACH_COMBING_PET = {
	itemID: BSOItem.PATRICIA,
	name: 'Patricia',
	emoji: '<:starfish:1515651612918677564>',
	baseRate: 6_000,
	clIncreaseMultiplier: 2
} as const;

export const SUMMER_CRATE_S9_EMOJI = '<:s9chest:1515787545970081843>';
export const LYDIA_QUOTES = [
	'The ocean is deep. So is my disappointment',
	'I found myself. I put myself back',
	'The sun is just a giant gas leak with good marketing',
	'Every legend ends with someone becoming beach debris',
	'The tide comes in. The tide goes out. We all become sand eventually',
	'Every shell is just a future fragment'
];

export const LYDIA_BIRTH_MESSAGES = [
	`🥀 The lotion smells faintly of black roses, rainy afternoons, and unresolved feelings.
*Patricia's bright smile melts away.*

Her eyes become distant.
**Ancient.**
Tired.

The tempo of her heart beats in ever longer intervals. thump... thump..... thump......

**..... thump.....**

📖 Like she's already read the ending.
 She gazes toward the horizon.

🐚 *"{Quote}...."*

❄️ Patricia has become Lydia, and somehow the beach feels colder.`,
	`🟣 **Purple energy crackles around the tiny starfish....**
She gasps dramatically!

**Clutches** her chest dramatically.
🎭 Falls to her **knees** dramatically.
....Nothing actually happened yet.

🦇 She just felt it was important to establish the mood.
Moments later her orange fades to a rich violet glow.

🗝️ *"I liked treasure hunting more before it became mainstream."*

🌑 **Lydia emerges from the darkness**.`,

	`The cheerful little starfish squints at the dark purple lotion.
🧴 *"This seems suspiciously on-brand for a cursed beach item,"* she stammers, still excited by the fanciful duality of Sun scream glistening from her breast... Do starfish have breasts?

Too late.
🖤 *The Sun Scream soaks in...*

Her bright orange fades to violet.
Her smile becomes a smirk.
🌧️ Her sparkle becomes existential dread.

She stares at the waves for several minutes...

🌊 *"{Quote}."*

💀 Patricia is gone.
🖤 **Lydia has arrived.**`
];

export function getLydiaQuote() {
	return randArrItem(LYDIA_BIRTH_MESSAGES)!.replace('{Quote}', randArrItem(LYDIA_QUOTES)!);
}
export function getEclipsePetName(user: MUserClass): string {
	const equippedPetID = user.usingPet(BEACH_COMBING_PET.itemID, { returnID: true });
	return equippedPetID ? Items.getOrThrow(equippedPetID).name : BEACH_COMBING_PET.name;
}

export async function convertMysteriousBottleToSeaWater(user: MUserClass): Promise<boolean> {
	const gearUpdates: { setup: GearSetupType; gear: GearSetup }[] = [];

	for (const setup of Object.keys(user.gear) as GearSetupType[]) {
		const rawGear = user.gear[setup].raw();
		let changed = false;
		if (rawGear['shield']?.item === BSOItem.MYSTERIOUS_BOTTLE) {
			rawGear['shield'].item = BSOItem.BOTTLE_OF_SEA_WATER;
			changed = true;
		}
		if (changed) {
			gearUpdates.push({ setup, gear: rawGear });
			break;
		}
	}

	if (gearUpdates.length === 0) {
		return false;
	}
	await user.addItemsToCollectionLog({ itemsToAdd: new Bank().add(BSOItem.BOTTLE_OF_SEA_WATER) });
	await user.updateGear(gearUpdates);
	return true;
}
