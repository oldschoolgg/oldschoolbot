import { calcPerHour, Emoji, Events, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, Monsters, resolveItems } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import type { DoomOfMokhaiotlOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

function doomDeathChance(delveLevel: number, kc: number) {
	const proficiency = Math.min(1, 1 - Math.exp(-kc / 31));
	const unskilledChance = 2 + delveLevel * 2;
	return Math.max(1, unskilledChance * (1 - proficiency * 0.75));
}

const doomPurpleItems = resolveItems(['Mokhaiotl cloth', 'Eye of ayak', 'Avernic treads', 'Dom']);

export const doomOfMokhaiotlTask: MinionTask = {
	type: 'DoomOfMokhaiotl',
	async run(data: DoomOfMokhaiotlOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, delveLevel } = data;
		const previousKC = await user.getKC(Monsters.DoomOfMokhaiotl.id);
		const deathChance = doomDeathChance(delveLevel, previousKC);
		const loot = new Bank();
		let deaths = 0;

		for (let i = 0; i < quantity; i++) {
			if (rng.percentChance(deathChance)) {
				deaths++;
				continue;
			}
			loot.add(Monsters.DoomOfMokhaiotl.kill(1, { rng, delveLevel } as any));
		}

		const successfulRuns = quantity - deaths;
		const { newKC } =
			successfulRuns > 0
				? await user.incrementKC(Monsters.DoomOfMokhaiotl.id, successfulRuns)
				: { newKC: previousKC };
		if (successfulRuns > 0) {
			await user.addMonsterXP({
				monsterID: Monsters.DoomOfMokhaiotl.id,
				quantity: successfulRuns,
				duration,
				isOnTask: false,
				taskQuantity: null
			});
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: Monsters.DoomOfMokhaiotl.name,
			type: 'Monster',
			changeType: 'loot',
			kc: successfulRuns,
			duration,
			users: [{ id: user.id, loot: itemsAdded, duration }]
		});

		if (itemsAdded.has('Dom')) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${user.minionName}, just received **Dom** from Doom of Mokhaiotl on their ${formatOrdinal(
					newKC
				)} KC!`
			);
		}

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${successfulRuns}x Doom of Mokhaiotl`,
			user,
			previousCL
		});

		const purple = doomPurpleItems.some(itemID => itemsAdded.has(itemID));
		const message = `${purple ? `${Emoji.Purple} ` : ''}${user}, ${user.minionName} finished ${quantity}x Doom of Mokhaiotl delve run${
			quantity === 1 ? '' : 's'
		} to delve ${delveLevel}. They succeeded ${successfulRuns}x and died ${deaths}x (**${deathChance.toFixed(
			2
		)}% death chance**). Your Doom of Mokhaiotl KC is now ${newKC}. (${calcPerHour(
			successfulRuns,
			duration
		).toFixed(1)}/hr)`;

		return handleTripFinish({
			user,
			channelId,
			message: { content: message, files: [image] },
			data,
			loot: itemsAdded
		});
	}
};
