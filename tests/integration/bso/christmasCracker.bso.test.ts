import { PartyhatTable } from '@/lib/bso/holidayItems.js';

import { Emoji } from '@oldschoolgg/toolkit';
import { Bank, resolveItems } from 'oldschooljs';
import { describe, it } from 'vitest';

import { crackerCommand } from '@/mahoji/lib/abstracted_commands/crackerCommand.js';
import { mockClient } from '../util.js';

describe('BSO Christmas cracker command', async () => {
	const client = await mockClient();
	const bsoPartyhats = resolveItems(['Black partyhat', 'Pink partyhat', 'Rainbow partyhat']);
	const allPartyhats = resolveItems(PartyhatTable.allItems);

	it('can award at least one unique partyhat via the cracker command', async ({ expect }) => {
		const ATTEMPTS = 500;

		const owner = await client.mockUser({
			bank: new Bank().add('Christmas cracker', ATTEMPTS)
		});
		const otherPerson = await client.mockUser();

		const interaction = {
			confirmation: async (_msg: string) => true,
			defer: async () => {},
			send: async () => {},
			editReply: async () => {}
		} as unknown as any;

		const combinedBank = owner.bank.clone().add(otherPerson.bank);

		let gotBsoPartyhat = false;
		for (let i = 0; i < ATTEMPTS; i++) {
			await crackerCommand({
				ownerID: owner.id,
				otherPersonID: otherPerson.id,
				otherPersonAPIUser: { bot: false, id: otherPerson.id, username: otherPerson.username } as any,
				interaction
			});

			combinedBank.add(owner.bank).add(otherPerson.bank);

			if (bsoPartyhats.some(hat => combinedBank.has(hat))) {
				gotBsoPartyhat = true;
				break;
			}
		}

		expect(
			gotBsoPartyhat,
			`None of the unique partyhats were obtained: ${bsoPartyhats.join(', ')}. Check to make sure CrackerCommand.ts is calling the bso cracker table`
		).toBe(true);
	});

	it('allows ironman to open a cracker on themselves', async ({ expect }) => {
		const ironman = await client.mockUser({
			bank: new Bank().add('Christmas cracker', 1)
		});
		await ironman.update({ minion_ironman: true });

		const interaction = {
			confirmation: async (_msg: string) => true,
			defer: async () => {},
			send: async () => {},
			editReply: async () => {}
		} as unknown as any;

		const result = await crackerCommand({
			ownerID: ironman.id,
			otherPersonID: ironman.id,
			otherPersonAPIUser: { bot: false, id: ironman.id, username: ironman.username } as any,
			interaction
		});

		expect(result).toContain(Emoji.ChristmasCracker);
	});
});
