import { Bank } from 'oldschooljs';
import { beforeAll, describe, it } from 'vitest';

import { crackerCommand } from '@/mahoji/lib/abstracted_commands/crackerCommand.js';
import { mockClient } from '../util.js';

describe('BSO Christmas cracker command', () => {
	let client: Awaited<ReturnType<typeof mockClient>>;

	beforeAll(async () => {
		client = await mockClient();
	});

	it('can award all unique partyhats via the cracker command', async ({ expect }) => {
		const UNIQUE_PARTY_HATS = ['Black partyhat', 'Pink partyhat', 'Rainbow partyhat'];

		const seen = new Set<string>();
		const ATTEMPTS = 200_000;

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
});
