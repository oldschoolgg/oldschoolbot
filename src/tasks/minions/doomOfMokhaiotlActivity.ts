import { Emoji } from '@oldschoolgg/toolkit';
import { Bank, EMonster, type ItemBank } from 'oldschooljs';

import { calculateDoomXP, DOOM_UNIQUE_ITEMS, normaliseDoomWaveCompletions } from '@/lib/doomOfMokhaiotl.js';
import { trackLoot } from '@/lib/lootTrack.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const doomOfMokhaiotlTask: MinionTask = {
	type: 'DoomOfMokhaiotl',
	async run(data: DoomTaskOptions, { user, handleTripFinish }) {
		const { channelId, targetDelve, duration, delves, loot, refund, refundAmmo } = data;
		let aggregatedDeepDelves = 0;
		let aggregatedWavesCleared = 0;
		let aggregatedDeepest = 0;
		let aggregatedAyakCharges = 0;

		for (const delve of delves) {
			const wavesCleared = delve.dead ? delve.lastWave - 1 : delve.lastWave;
			aggregatedDeepest = Math.max(aggregatedDeepest, wavesCleared);
			aggregatedWavesCleared += wavesCleared;
			aggregatedDeepDelves += Math.max(0, wavesCleared - 7);
			aggregatedAyakCharges += delve.ayak ?? 0;
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
		for (const delve of delves) {
			const wavesCleared = delve.dead ? delve.lastWave - 1 : delve.lastWave;
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

		if (delves.length === 1 && delves[0].dead) {
			const kcSummary = buildKcSummary(newDeepest, newDeepDelves, newTotal);
			const refundMessage =
				refundedItems.length > 0
					? `\n**Refunded supplies:** ${refundedItems}`
					: '\n**Refunded supplies:** None.';

			return handleTripFinish({
				user,
				channelId,
				message: `${user} Your minion died at delve **${delves[0].diedAt ?? delves[0].lastWave}** and lost all loot.${refundMessage}\n${kcSummary}${xpMessage ? `\n${xpMessage}` : ''}`,
				data
			});
		}

		const lootBank = new Bank(loot);

		const { previousCL, itemsAdded } = await user.transactItems({
			itemsToAdd: lootBank,
			collectionLog: true
		});

		const anyDeath = delves.some(delve => delve.dead);

		const uniqueLoot = lootBank.filter(item => DOOM_UNIQUE_ITEMS.includes(item.id));

		let completionLine = `Your minion ${anyDeath ? 'attempted' : 'completed'} **${delves.length}x** Doom of Mokhaiotl delves up to level **${targetDelve}**.\n`;
		if (uniqueLoot.length > 0) {
			completionLine += `\n${Emoji.Special}**Uniques received:** ${uniqueLoot}\n`;
		}
		void announceLoot({
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
		const delveSummary = `\n${delves
			.map(
				(delve, index) =>
					`${
						delve.loot && DOOM_UNIQUE_ITEMS.some(id => new Bank(delve.loot).has(id))
							? `${Emoji.Purple} `
							: ''
					}Delve ${index + 1}: ${delve.dead ? `died at level **${delve.diedAt ?? delve.lastWave}**` : `reached level **${delve.lastWave}**`}`
			)
			.join('\n')}`;
		const refundMessage = refundedItems.length > 0 ? `\n**Refunded supplies:** ${refundedItems}` : '';
		const content = `${user} ${completionLine}${delveSummary}${
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
			title: `Doom of Mokhaiotl - ${delves.length}x Delves`,
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
