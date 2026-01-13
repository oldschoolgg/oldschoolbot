import { Bank, EMonster, Misc } from 'oldschooljs';

import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import type { ZalcanoActivityTaskOptions } from '@/lib/types/minions.js';
import { ashSanctifierEffect } from '@/lib/util/ashSanctifier.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const zalcanoTask: MinionTask = {
	type: 'Zalcano',
	async run(data: ZalcanoActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, performance, isMVP } = data;

		const { newKC } = await user.incrementKC(EMonster.ZALCANO, quantity);
		const hasKourendHard = user.hasDiary('kourend&kebos.hard');
		const hasKourendElite = user.hasDiary('kourend&kebos.elite');
		const loot = new Bank();

		let runecraftXP = 0;
		let smithingXP = 0;
		let miningXP = 0;

		for (let i = 0; i < quantity; i++) {
			loot.add(
				Misc.Zalcano.kill({
					team: [{ isMVP, performancePercentage: performance, id: '1' }]
				})['1']
			);
			runecraftXP += rng.randInt(100, 170);
			smithingXP += rng.randInt(250, 350);
			miningXP += rng.randInt(1100, 1400);
		}

		const xpRes: string[] = [];
		xpRes.push(
			await user.addXP({
				skillName: 'mining',
				amount: miningXP,
				duration,
				source: 'Zalcano'
			})
		);

		xpRes.push(await user.addXP({ skillName: 'smithing', amount: smithingXP, duration, source: 'Zalcano' }));
		xpRes.push(await user.addXP({ skillName: 'runecraft', amount: runecraftXP, duration, source: 'Zalcano' }));

		let str = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Zalcano. Your Zalcano KC is now ${newKC}.\n\n **XP Gains:** ${xpRes.join(
			', '
		)}\n`;

		const updateBank = new UpdateBank();
		updateBank.itemLootBank.add(loot);
		if (hasKourendHard) {
			const result = ashSanctifierEffect({
				hasKourendElite,
				updateBank,
				gearBank: user.gearBank,
				bitfield: user.bitfield,
				duration
			});
			if (result) {
				str += result.message;
			}
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: updateBank.itemLootBank
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Zalcano`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot: itemsAdded });
	}
};
