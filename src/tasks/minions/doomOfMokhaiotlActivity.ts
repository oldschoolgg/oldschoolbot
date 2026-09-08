import { Bank, EMonster, type ItemBank, Items } from 'oldschooljs';

import {
	calculateDoomXP,
	DOOM_UNIQUE_ITEMS,
	normaliseDoomWaveCompletions,
	rollDoomRegularLoot
} from '@/lib/doomOfMokhaiotl.js';
import { trackLoot } from '@/lib/lootTrack.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const doomOfMokhaiotlTask: MinionTask = {
	type: 'DoomOfMokhaiotl',
	async run(data: DoomTaskOptions, { user, handleTripFinish }) {
		const { channelId, targetDelve, duration, trips, refund, refundAmmo } = data;
		const tripData = trips;
		const aggregatedLoot = new Bank();
		let aggregatedDeepDelves = 0;
		let aggregatedWavesCleared = 0;
		let aggregatedDeepest = 0;
		let aggregatedAyakCharges = 0;

		for (const trip of tripData) {
			const wavesCleared = trip.dead ? trip.lastWave - 1 : trip.lastWave;
			aggregatedDeepest = Math.max(aggregatedDeepest, wavesCleared);
			aggregatedWavesCleared += wavesCleared;
			aggregatedDeepDelves += Math.max(0, wavesCleared - 7);
			aggregatedAyakCharges += trip.ayak ?? 0;
			if (!trip.dead) {
				for (let delve = 1; delve <= trip.lastWave; delve++) {
					aggregatedLoot.add(rollDoomRegularLoot(delve));
				}
				if (trip.loot) aggregatedLoot.add(trip.loot);
			}
		}

		const currentStats = await user.fetchStats();
		const prevDeepest = Number(currentStats.doom_deepest_delve ?? 0);
		const prevDeepDelves = Number(currentStats.doom_deep_delves ?? 0);
		const prevTotal = Number(currentStats.doom_total_delves ?? 0);
		const waveCompletions = normaliseDoomWaveCompletions(
			(currentStats as { doom_wave_completions?: unknown }).doom_wave_completions
		);

		const newDeepest = Math.max(prevDeepest, aggregatedDeepest);
		const newDeepDelves = prevDeepDelves + aggregatedDeepDelves;
		const newTotal = prevTotal + aggregatedWavesCleared;
		const doomKcEarned = aggregatedDeepDelves;
		for (const trip of tripData) {
			const wavesCleared = trip.dead ? trip.lastWave - 1 : trip.lastWave;
			for (let wave = 1; wave <= wavesCleared; wave++) {
				waveCompletions[wave] = (waveCompletions[wave] ?? 0) + 1;
			}
		}

		const monsterScores = { ...((currentStats.monster_scores ?? {}) as ItemBank) };
		if (doomKcEarned > 0) {
			monsterScores[EMonster.DOOM_OF_MOKHAIOTL] = (monsterScores[EMonster.DOOM_OF_MOKHAIOTL] ?? 0) + doomKcEarned;
		}

		await user.statsUpdate({
			doom_deepest_delve: newDeepest,
			doom_deep_delves: newDeepDelves,
			doom_total_delves: newTotal,
			doom_wave_completions: waveCompletions,
			monster_scores: monsterScores
		} as Parameters<typeof user.statsUpdate>[0]);

		await user.update({
			ayak_charges: { increment: aggregatedAyakCharges }
		});

		let xpMessage = '';
		if (aggregatedWavesCleared > 0) {
			xpMessage = await user.addXPBank(
				calculateDoomXP({
					duration,
					targetDelve: Math.max(1, aggregatedDeepest),
					totalWavesCleared: aggregatedWavesCleared,
					minimal: true
				})
			);
		}

		const refundedSupplies = new Bank().add(refund ?? {});
		const refundedAmmo = new Bank().add(refundAmmo ?? {});
		const refundedItems = refundedSupplies.clone().add(refundedAmmo);
		if (refundedItems.length > 0) {
			if (refundedSupplies.length > 0) {
				await user.addItemsToBank({ items: refundedSupplies, collectionLog: false });
			}
			if (refundedAmmo.length > 0) {
				const rangeGear = user.gear.range.raw();
				const [ammo, quantity] = refundedAmmo.items()[0]!;
				if (refundedAmmo.length === 1 && rangeGear.ammo?.item === ammo.id) {
					rangeGear.ammo.quantity += quantity;
					await user.updateGear([{ setup: 'range', gear: rangeGear }]);
				} else {
					await user.addItemsToBank({ items: refundedAmmo, collectionLog: false });
				}
			}
			await Promise.all([
				user.statsBankRemove('doom_cost', refundedItems),
				ClientSettings.removeFromBankSetting('doom_cost', refundedItems)
			]);
		}

		if (tripData.length === 1 && tripData[0].dead) {
			const kcSummary = buildKcSummary(newDeepest, newDeepDelves, newTotal);
			const refundMessage =
				refundedItems.length > 0
					? `\n**Refunded supplies:** ${refundedItems}`
					: '\n**Refunded supplies:** None.';

			return handleTripFinish({
				user,
				channelId,
				message: `${user} Your minion died at delve **${tripData[0].diedAt ?? tripData[0].lastWave}** and lost all loot.${refundMessage}\n${kcSummary}${xpMessage ? `\n${xpMessage}` : ''}`,
				data
			});
		}

		const loot = aggregatedLoot;

		const { previousCL, itemsAdded } = await user.transactItems({
			itemsToAdd: loot,
			collectionLog: true
		});

		const stoppedOnUnique = tripData.some(trip => !trip.dead && trip.loot && trip.lastWave < targetDelve);
		const anyDeath = tripData.some(trip => trip.dead);

		const uniqueNames = DOOM_UNIQUE_ITEMS.filter((id: number) => loot.has(id))
			.map((id: number) => Items.itemNameFromId(id))
			.join(', ');

		const completionLine = `${
			stoppedOnUnique
				? `Your minion stopped after receiving a unique: **${uniqueNames}**.`
				: anyDeath
					? `Your minion attempted **${tripData.length}x** Doom of Mokhaiotl trips up to delve **${targetDelve}**.`
					: `Your minion completed **${tripData.length}x** Doom of Mokhaiotl trips up to delve **${aggregatedDeepest}**.`
		}${uniqueNames.length > 0 ? `\n**Uniques received:** ${uniqueNames}` : ''}`;

		announceLoot({
			user,
			monsterID: EMonster.DOOM_OF_MOKHAIOTL,
			monsterName: 'Doom of Mokhaiotl',
			progress: {
				name: 'Doom of Mokhaiotl Total Delves',
				value: newTotal
			},
			loot: itemsAdded,
			notifyDrops: DOOM_UNIQUE_ITEMS
		});

		await ClientSettings.updateBankSetting('doom_loot', itemsAdded);
		await user.statsBankUpdate('doom_loot', itemsAdded);
		await trackLoot({
			totalLoot: itemsAdded,
			id: 'doom_of_mokhaiotl',
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: aggregatedWavesCleared,
			users: [{ id: user.id, loot: itemsAdded, duration }]
		});

		const kcSummary = buildKcSummary(newDeepest, newDeepDelves, newTotal);
		const tripSummary = `\n${tripData
			.map(
				(trip, index) =>
					`Trip ${index + 1}: ${trip.dead ? `died at delve **${trip.diedAt ?? trip.lastWave}**` : `reached delve **${trip.lastWave}**`}${
						trip.loot ? ' and received a unique' : ''
					}`
			)
			.join('\n')}`;
		const refundMessage = refundedItems.length > 0 ? `\n**Refunded supplies:** ${refundedItems}` : '';
		const content = `${user} ${completionLine}${tripSummary}${
			itemsAdded.length === 0 ? "\n\nYou didn't get any loot. Sorry. 😞\n" : ''
		}${refundMessage}\n${kcSummary}${xpMessage ? `\n${xpMessage}` : ''}`;

		if (itemsAdded.length === 0) {
			return handleTripFinish({
				user,
				channelId,
				message: content,
				data,
				loot: itemsAdded
			});
		}

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Doom of Mokhaiotl - ${tripData.length}x Delve ${targetDelve}`,
			user,
			previousCL
		});

		return handleTripFinish({
			user,
			channelId,
			message: {
				content,
				files: [image]
			},
			data,
			loot: itemsAdded
		});
	}
};

function buildKcSummary(deepestDelve: number, deepDelves: number, totalDelves: number): string {
	return `Deepest Delve: **${deepestDelve}** | Deep Delves: **${deepDelves}** | Total Delves: **${totalDelves}**`;
}
