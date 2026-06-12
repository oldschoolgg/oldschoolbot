import { itemContractResetTime } from '@/lib/bso/bsoConstants.js';
import { ItemContracts } from '@/lib/bso/itemContracts.js';

import { noOp } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, itemID } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { mockInteraction } from '../../test-utils/mockInteraction.js';
import { createTestUser } from '../util.js';

describe('Item Contracts', () => {
	test('does not complete the same item contract multiple times when send is spammed', async () => {
		const contractItem = itemID('Coal');
		const user = await createTestUser(new Bank().add(contractItem, 5), {
			current_item_contract: contractItem,
			last_item_contract_date: Date.now() - itemContractResetTime
		});
		const interaction = mockInteraction({ user });

		const results = await Promise.all(
			Array.from({ length: 5 }, () => ItemContracts.handInContract(interaction, user))
		);

		await user.sync();

		expect(results.filter(result => result.includes('You handed in')).length).toBe(1);
		expect(user.user.total_item_contracts).toBe(1);
		expect(user.user.item_contract_streak).toBe(1);
		expect(new Bank(user.user.item_contract_bank as ItemBank).amount(contractItem)).toBe(1);
		expect(user.bank.amount(contractItem)).toBe(4);
	});

	test('does not record a donated item contract if the item transfer fails', async () => {
		const contractItem = itemID('Coal');
		const recipient = await createTestUser(undefined, {
			current_item_contract: contractItem,
			last_item_contract_date: Date.now() - itemContractResetTime
		});
		const donator = await createTestUser(new Bank().add(contractItem));
		const interaction = mockInteraction({ user: donator });
		Object.defineProperty(interaction, 'customId', { value: `DONATE_IC_${recipient.id}` });

		await global.Cache.setUserLockStatus(recipient.id, 'locked');
		const result = await ItemContracts.donateICHandler(interaction);
		await global.Cache.setUserLockStatus(recipient.id, 'unlocked').catch(noOp);

		await Promise.all([recipient.sync(), donator.sync()]);
		const [recipientStats, donatorStats] = await Promise.all([recipient.fetchStats(), donator.fetchStats()]);

		expect(result).toMatchObject({ content: expect.stringContaining('busy') });
		expect(recipient.user.total_item_contracts).toBe(0);
		expect(recipient.user.item_contract_streak).toBe(0);
		expect(recipient.bank.amount(contractItem)).toBe(0);
		expect(donator.bank.amount(contractItem)).toBe(1);
		expect(new Bank(recipientStats.ic_donations_received_bank as ItemBank).amount(contractItem)).toBe(0);
		expect(new Bank(donatorStats.ic_donations_given_bank as ItemBank).amount(contractItem)).toBe(0);
	});
});
