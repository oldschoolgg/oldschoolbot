import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser } from '../util.js';

describe('Steal Command', async () => {
	it('should reject invalid steal targets', async () => {
		const user = await createTestUser();
		const res = await user.runCommand('steal', { name: 'not-real' });
		expect(res).toContain('That is not a valid NPC/Stall to pickpocket or steal from');
	});

	it('should require thieving level for chests', async () => {
		const user = await createTestUser();
		await user.update({ skills_thieving: convertLVLtoXP(1) });
		const res = await user.runCommand('steal', { name: '50 coin chest', quantity: 1 });
		expect(res).toContain('needs 43 Thieving to steal from a 50 coin chest.');
	});

	it('should allow stealing from chests', async () => {
		const user = await createTestUser();
		await user.update({ skills_thieving: convertLVLtoXP(99) });
		const res = await user.runCommand('steal', { name: '10 coin chest', quantity: 5 });
		expect(res).toContain('is now going to steal from a 10 coin chest 5x times');
	});

	it('should require prayer level for Rogues Castle chest', async () => {
		const user = await createTestUser();
		await user.update({ skills_thieving: convertLVLtoXP(99), skills_prayer: convertLVLtoXP(1) });
		const res = await user.runCommand('steal', { name: "Rogues' Castle chest", quantity: 1 });
		expect(res).toContain('needs 43 Prayer to steal from a Rogues\' Castle chest.');
	});

	it('should require potions for Rogues Castle chest', async () => {
		const user = await createTestUser();
		await user.update({ skills_thieving: convertLVLtoXP(99), skills_prayer: convertLVLtoXP(99) });
		const res = await user.runCommand('steal', { name: "Rogues' Castle chest", quantity: 1 });
		expect(res).toContain('to keep Protect from Melee active while stealing from Rogues\' Castle chest.');
	});

	it('should allow pickpocketing NPCs', async () => {
		const user = await createTestUser(new Bank({ Trout: 50 }));
		await user.update({ skills_thieving: convertLVLtoXP(99) });
		const res = await user.runCommand('steal', { name: 'Man', quantity: 5 });
		expect(res).toContain('is now going to pickpocket a Man 5x times');
	});
});
