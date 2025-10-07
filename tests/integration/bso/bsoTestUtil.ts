import { materialTypes } from '@/lib/bso/skills/invention/index.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';
import { MTame } from '@/lib/bso/structures/MTame.js';
import { TameSpeciesID } from '@/lib/bso/tames/tames.js';
import { runTameTask } from '@/lib/bso/tames/tameTasks.js';

import { tame_growth } from '@prisma/client';
import { type EMonster, Monsters } from 'oldschooljs';
import { clone } from 'remeda';
import { expect } from 'vitest';

import { type SkillNameType, SkillsArray } from '@/lib/skilling/types.js';
import type { SkillsRequired } from '@/lib/types/index.js';
import type { MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { stealCommand } from '@/mahoji/commands/steal.js';
import { tamesCommand } from '@/mahoji/commands/tames.js';
import type { TestUser } from '../util.js';

export const BSOTestUtil = {
	giveMaterials: async (user: TestUser) => {
		const materials = new MaterialBank();
		for (const mat of materialTypes) materials.add(mat, 10_000);
		await user.update({
			materials_owned: materials.bank
		});
	},
	async tamePVMTrip(user: TestUser, monsterID: number) {
		const tames = await user.fetchTames();
		const tame = tames.find(t => t.species.id === TameSpeciesID.Igne)!;
		const commandResult = await user.runCommand(tamesCommand, {
			kill: {
				name: Monsters.get(monsterID)!.name
			}
		});
		const activity = await prisma.tameActivity.findFirst({
			where: {
				user_id: user.id
			},
			include: {
				tame: true
			}
		});
		if (activity) {
			await runTameTask(activity, tame);
		}
		await user.sync();
		return {
			commandResult,
			activity
		};
	},
	async giveIgneTame(user: MUser) {
		const tame = await prisma.tame.create({
			data: {
				user_id: user.id,
				species_id: TameSpeciesID.Igne,
				max_artisan_level: 100,
				max_combat_level: 100,
				max_gatherer_level: 100,
				max_support_level: 100,
				growth_stage: tame_growth.adult
			}
		});
		await user.update({
			selected_tame: tame.id
		});
		return new MTame(tame);
	},
	async pickpocket(
		user: TestUser,
		monster: EMonster,
		{ quantity, shouldFail = false }: { shouldFail?: boolean; quantity?: number } = {}
	) {
		const previousBank = user.bank.clone();
		const currentXP = clone(user.skillsAsXP);
		const commandResult = await user.runCommand(
			stealCommand,
			{ name: Monsters.get(monster)!.name, quantity },
			true
		);
		if (shouldFail) {
			expect(commandResult).not.toContain('is now going to');
		}
		const activityResult = (await user.runActivity()) as MonsterActivityTaskOptions | undefined;
		const newXP = clone(user.skillsAsXP);
		const xpGained: SkillsRequired = {} as SkillsRequired;
		for (const skill of SkillsArray) xpGained[skill] = 0;
		for (const skill of Object.keys(newXP) as (keyof SkillsRequired)[]) {
			xpGained[skill as SkillNameType] = newXP[skill] - currentXP[skill];
		}

		return { commandResult, xpGained, previousBank, activityResult };
	}
};
