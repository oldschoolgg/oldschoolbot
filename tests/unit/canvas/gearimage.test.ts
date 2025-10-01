import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EItem } from 'oldschooljs';
import { EGear } from 'oldschooljs/EGear';
import { describe, test } from 'vitest';

import { generateAllGearImage, generateGearImage } from '@/lib/canvas/generateGearImage.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import { constructGearSetup, Gear } from '@/lib/structures/Gear.js';
import { baseSnapshotPath } from '../../testConstants.js';

const COXMaxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Torva platelegs',
	feet: 'Primordial boots',
	'2h': 'Scythe of vitur',
	ring: 'Ultor ring'
});

describe('Gear Images', async () => {
	const gear = COXMaxMeleeGear.clone();
	gear.equip(EGear.DRAGON_ARROW, 100);

	test('Basic Gear Image', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: EItem.PHOENIX
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-basic.png'), gearImage);
	});

	test('No Pet (null petID)', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: null
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-no-pet.png'), gearImage);
	});

	test('No Gear Type (null gearType)', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: null,
			petID: EItem.PHOENIX
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-no-type.png'), gearImage);
	});

	test('Empty Gear Setup', async () => {
		const emptyGear = new Gear();
		const gearImage = await generateGearImage({
			gearSetup: emptyGear,
			gearType: 'other',
			petID: null
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-empty.png'), gearImage);
	});

	test('Different Gear Template', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: EItem.PHOENIX,
			gearTemplate: 1
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-template-1.png'), gearImage);
	});

	test('Custom Background Color', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			petID: EItem.PHOENIX,
			bankBgHexColor: '#FF0000'
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-red-bg.png'), gearImage);
	});

	test('Different Bank Background', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			bankBackgroundId: 5
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-bg-5.png'), gearImage);
	});

	test('Transparent Bank Background', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			bankBackgroundId: 19
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-bg-transparent.png'), gearImage);
	});

	test('Transparent Bank Background With Bg Color', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			bankBackgroundId: 19,
			bankBgHexColor: '#FF0000'
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-bg-transparent-bg-color.png'), gearImage);
	});

	test('Farming Contract Background', async () => {
		const gearImage = await generateGearImage({
			gearSetup: gear,
			gearType: 'melee',
			farmingContract: {
				contract: {
					hasContract: true,
					difficultyLevel: 'easy',
					plantToGrow: 'Yew tree',
					plantTier: 3,
					contractsCompleted: 100
				},
				plant: Farming.Plants.find(p => p.name === 'Yew tree'),
				matchingPlantedCrop: {
					ready: true
				} as any
			}
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-farming-contract.png'), gearImage);
	});

	test('Item with Quantity > 1', async () => {
		const gearWithQuantity = gear.clone();
		gearWithQuantity.equip(EGear.DRAGON_ARROW, 5000); // High quantity to test quantity display

		const gearImage = await generateGearImage({
			gearSetup: gearWithQuantity,
			gearType: 'melee',
			petID: EItem.PHOENIX
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-with-quantity.png'), gearImage);
	});

	test('All Gear Image', async () => {
		const gearImage = await generateAllGearImage({
			gear: {
				melee: gear,
				range: gear,
				mage: gear,
				other: gear,
				fashion: gear,
				skilling: gear,
				wildy: gear,
				misc: gear
			}
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-all.png'), gearImage);
	});

	test('All Gear Image with Pet', async () => {
		const gearImage = await generateAllGearImage({
			gear: {
				melee: gear,
				range: gear,
				mage: gear,
				other: gear,
				fashion: gear,
				skilling: gear,
				wildy: gear,
				misc: gear
			},
			equippedPet: EItem.OLMLET
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-all-with-pet.png'), gearImage);
	});

	test('All Gear Image Different Template', async () => {
		const gearImage = await generateAllGearImage({
			gear: {
				melee: gear,
				range: gear,
				mage: gear,
				other: gear,
				fashion: gear,
				skilling: gear,
				wildy: gear,
				misc: gear
			},
			gearTemplate: 1
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-all-template-1.png'), gearImage);
	});

	test('Transmog Gear', async () => {
		const emptyGear = new Gear();
		emptyGear.hands = { item: EItem.BANANA, quantity: 1 };
		const gearImage = await generateGearImage({
			gearSetup: emptyGear,
			gearType: 'other',
			petID: null
		});
		await writeFile(path.join(baseSnapshotPath, 'gear-transmog.png'), gearImage);
	});
});
