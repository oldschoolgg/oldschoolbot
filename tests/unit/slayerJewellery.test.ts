import { describe, expect, test } from 'vitest';

import {
	resolveSlayerJewelleryChoice,
	type SlayerBraceletCharges,
	type SlayerJewelleryConfig,
	simulateSlayerBraceletEffects
} from '@/lib/slayer/slayerJewellery.js';

const baseKillCredit = () => 1;

const defaultRoll = () => true;

describe('Slayer jewellery effects', () => {
	test('no charges means no procs', () => {
		const braceletCharges: SlayerBraceletCharges = { slaughter: 0, expeditious: 0 };

		const result = simulateSlayerBraceletEffects({
			quantityKilled: 3,
			quantityRemaining: 5,
			braceletCharges,
			braceletChoice: 'expeditious',
			baseKillCredit,
			rollChance: defaultRoll
		});

		expect(result.procs.expeditious).toBe(0);
		expect(result.effectiveSlayed).toBe(3);
		expect(result.quantityLeft).toBe(2);
	});

	test('charges are spent when procs are forced', () => {
		const braceletCharges: SlayerBraceletCharges = { slaughter: 2, expeditious: 0 };

		const result = simulateSlayerBraceletEffects({
			quantityKilled: 2,
			quantityRemaining: 2,
			braceletCharges,
			braceletChoice: 'slaughter',
			baseKillCredit,
			rollChance: defaultRoll
		});

		expect(result.procs.slaughter).toBe(2);
		expect(result.chargesRemaining.slaughter).toBe(0);
		expect(result.quantityLeft).toBe(2);
	});

	test('expeditious bracelet does not grant extra loot or XP rolls', () => {
		const braceletCharges: SlayerBraceletCharges = { slaughter: 0, expeditious: 5 };

		const result = simulateSlayerBraceletEffects({
			quantityKilled: 1,
			quantityRemaining: 10,
			braceletCharges,
			braceletChoice: 'expeditious',
			baseKillCredit,
			rollChance: defaultRoll
		});

		expect(result.effectiveSlayed).toBe(2);
		expect(result.quantitySlayed).toBe(1);
		expect(result.quantityLeft).toBe(8);
	});

	test('slaughter bracelet keeps task count the same on proc', () => {
		const braceletCharges: SlayerBraceletCharges = { slaughter: 5, expeditious: 0 };

		const result = simulateSlayerBraceletEffects({
			quantityKilled: 1,
			quantityRemaining: 5,
			braceletCharges,
			braceletChoice: 'slaughter',
			baseKillCredit,
			rollChance: defaultRoll
		});

		expect(result.effectiveSlayed).toBe(0);
		expect(result.quantityLeft).toBe(5);
		expect(result.quantitySlayed).toBe(1);
	});

	test('task-specific jewellery overrides global setting', () => {
		const config: SlayerJewelleryConfig = { all: 'expeditious', bloodveld: 'slaughter' };

		expect(resolveSlayerJewelleryChoice('Bloodveld', config)).toBe('slaughter');
	});
});
