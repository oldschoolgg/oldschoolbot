import { Emoji } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, it } from 'vitest';

import { crackerCommand } from '@/mahoji/lib/abstracted_commands/crackerCommand.js';
import { mockClient } from '../util.js';

describe('BSO Christmas cracker command', async () => {
	const client = await mockClient();

	it('can award all unique partyhats via the cracker command', async ({ expect }) => {
		const UNIQUE_PARTY_HATS = ['Black partyhat', 'Pink partyhat', 'Rainbow partyhat'];

		const seen = new Set<string>();
		const ATTEMPTS = 5000;

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

		for (let i = 0; i < ATTEMPTS; i++) {
			await crackerCommand({
				ownerID: owner.id,
				otherPersonID: otherPerson.id,
				otherPersonAPIUser: { bot: false, id: otherPerson.id, username: otherPerson.username } as any,
				interaction
			});

			for (const [item] of owner.bank.items()) {
				seen.add(item.name);
			}
			for (const [item] of otherPerson.bank.items()) {
				seen.add(item.name);
			}
			if (UNIQUE_PARTY_HATS.every(hat => seen.has(hat))) break;
		}

		const missing = UNIQUE_PARTY_HATS.filter(hat => !seen.has(hat));
		expect(missing.length, `Missing partyhats from BSO cracker command: ${missing.join(', ')}`).toBe(0);
	});

	it('allows ironman to open a cracker on themselves', async ({ expect }) => {
		const ironman = await client.mockUser({
			bank: new Bank().add('Christmas cracker', 1)
		})
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

		const hasPartyhat = ironman.bank.items().some(([item]) => item.name.includes('partyhat'));
		expect(hasPartyhat).toBe(true);
	});
});
