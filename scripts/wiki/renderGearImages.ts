var wtf = require('wtfnode');

import '../../src/lib/bankImage';
import { readFile, writeFile } from 'node:fs/promises';
import { generateGearImage } from "../../src/lib/gear/functions/generateGearImage";
import { Gear } from '../../src/lib/structures/Gear';
import getOSItem from '../../src/lib/util/getOSItem';

export async function renderGearImages() {
    const start = Date.now();
	await bankImageGenerator.ready;
	const end = Date.now();
	console.log(`Loaded bank images in ${end - start}ms`);
	const gearJSON = JSON.parse(await readFile('./docs/public/images/gear/gear.json', 'utf-8'));
	for (const [imageKey, itemIDs] of Object.entries(gearJSON) as [string, number[]][]) {
		const gear = new Gear();
		for (const id of itemIDs) gear.equip(getOSItem(id));
 				const image = await generateGearImage(
					{ user: { bankBackground: 1 }, farmingContract: () => null } as any,
					gear,
					null,
					null
				);
				await writeFile(`./docs/public/images/gear/${imageKey}.png`, image as any);
				console.log(`Generated ${imageKey} gear image`);
	}
	console.log("x");
	console.log("y");
	console.log(`Generated gear images`);
	console.log("z");
	wtf.dump();
	process.exit(0);
	wtf.dump();
}