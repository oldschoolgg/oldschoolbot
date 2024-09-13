import type { UserStats } from '@prisma/client';
import { Time, increaseNumByPercent, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import type { SlayerContext } from '../../tasks/minions/monsterActivity';
import type { BitField } from '../constants';
import { slayerMaskHelms } from '../data/slayerMaskHelms';
import type { KillableMonster } from '../minions/types';
import { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
import type { GearBank } from '../structures/GearBank';
import type { UpdateBank } from '../structures/UpdateBank';
import type { ItemBank } from '../types';
import { clAdjustedDroprate } from '../util';
import { bonecrusherEffect, clueUpgraderEffect, portableTannerEffect } from './inventionEffects';

export type MidPVMEffectArgs = {
	gearBank: GearBank;
	updateBank: UpdateBank;
	messages: string[];
	disabledInventions: number[];
	duration: number;
	bitfield: BitField[] | readonly BitField[];
	slayerContext: SlayerContext;
	quantity: number;
	monster: KillableMonster;
	cl: Bank;
	userStats: UserStats;
	slayerUnlocks: SlayerTaskUnlocksEnum[];
};

export function oriEffect({
	gearBank,
	quantity,
	duration,
	messages
}: Pick<MidPVMEffectArgs, 'gearBank' | 'quantity' | 'duration' | 'messages'>) {
	if (!gearBank.usingPet('Ori')) return quantity;
	let newQuantity = quantity;

	if (duration > Time.Minute * 5) {
		// Original boost for 5+ minute task:
		newQuantity = Math.ceil(increaseNumByPercent(quantity, 25));
	} else {
		// 25% chance at extra kill otherwise:
		for (let i = 0; i < quantity; i++) {
			if (roll(4)) {
				newQuantity++;
			}
		}
	}
	messages.push(`${newQuantity - quantity}x kills bonus kills from Ori.`);
	return newQuantity;
}

export function rollForBSOThings(args: MidPVMEffectArgs) {
	const { monster, duration, cl, updateBank, messages } = args;
	bonecrusherEffect(args);
	portableTannerEffect(args);
	clueUpgraderEffect({ ...args, type: 'pvm' });
	slayerMasksHelms(args);

	if (monster.id === Monsters.Vorkath.id && roll(6000)) {
		updateBank.itemLootBank.add(23_941);
	}

	const minutes = Math.ceil(duration / Time.Minute);
	const osjsMon = Monsters.get(monster.id);
	if (osjsMon?.data.attributes.includes(MonsterAttribute.Dragon)) {
		const dropRate = clAdjustedDroprate(cl, 'Klik', 8500, 1.5);
		for (let i = 0; i < minutes; i++) {
			if (roll(dropRate)) {
				updateBank.itemLootBank.add('Klik');
				break;
			}
		}
	}

	if (monster.id === 290) {
		for (let i = 0; i < minutes; i++) {
			if (roll(6000)) {
				updateBank.itemLootBank.add('Dwarven ore');
				break;
			}
		}
	}

	if (monster.name.toLowerCase() === 'zulrah') {
		for (let i = 0; i < minutes; i++) {
			if (roll(5500)) {
				updateBank.itemLootBank.add('Brock');
				break;
			}
		}
	}

	if (updateBank.itemLootBank.has('Brock')) {
		messages.push('<:brock:787310793183854594> On the way to Zulrah, you found a Badger that wants to join you.');
	}

	if (updateBank.itemLootBank.has('Klik')) {
		messages.push('<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.');
	}
}

export function slayerMasksHelms({
	monster,
	slayerContext,
	slayerUnlocks,
	updateBank,
	gearBank,
	userStats,
	messages
}: MidPVMEffectArgs) {
	if (
		!slayerContext.isOnTask ||
		!slayerContext.effectiveSlayed ||
		!slayerUnlocks.includes(SlayerTaskUnlocksEnum.Maskuerade)
	)
		return;
	const bankToAdd = new Bank().add(monster.id, slayerContext.effectiveSlayed);
	const maskHelmForThisMonster = slayerMaskHelms.find(i => i.monsters.includes(monster.id));
	const matchingMaskOrHelm =
		maskHelmForThisMonster &&
		gearBank.hasEquippedOrInBank([maskHelmForThisMonster.mask.id, maskHelmForThisMonster.helm.id])
			? maskHelmForThisMonster
			: null;
	const oldMaskScores = new Bank(userStats.on_task_with_mask_monster_scores as ItemBank);
	const newMaskScores = oldMaskScores.clone().add(bankToAdd);
	if (maskHelmForThisMonster && !gearBank.hasEquippedOrInBank(maskHelmForThisMonster.mask.id)) {
		for (let i = 0; i < slayerContext.effectiveSlayed; i++) {
			if (roll(maskHelmForThisMonster.maskDropRate)) {
				updateBank.itemLootBank.add(maskHelmForThisMonster.mask.id);
				messages.push(`You unlocked the ${maskHelmForThisMonster.mask.name} mask!`);
				break;
			}
		}
	}
	updateBank.userStats.on_task_monster_scores = new Bank(userStats.on_task_monster_scores as ItemBank)
		.add(bankToAdd)
		.toJSON();
	updateBank.userStats.on_task_with_mask_monster_scores = matchingMaskOrHelm ? newMaskScores.toJSON() : undefined;
}
