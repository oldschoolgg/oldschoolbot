import { stringMatches } from '@oldschoolgg/toolkit';

import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { allSlayerMonsters } from '@/lib/slayer/tasks/index.js';

interface TestPotatoSetSlayerTaskOptions {
	master: string;
	monster: string;
	quantity?: number;
}

export async function handleTestPotatoSetSlayerTask(user: MUser, options: TestPotatoSetSlayerTaskOptions) {
	const usersTask = await user.fetchSlayerInfo();

	const { monster, master } = options;

	const selectedMonster = allSlayerMonsters.find(m => stringMatches(m.name, monster));
	const selectedMaster = slayerMasters.find(
		sm => stringMatches(master, sm.name) || sm.aliases.some(alias => stringMatches(master, alias))
	);
	if (!selectedMaster || !selectedMonster) return 'Invalid slayer master or monster.';

	const quantity = options.quantity ?? 50;

	const assignedTask = selectedMaster.tasks.find(m => m.monster.id === selectedMonster.id)!;

	if (!assignedTask) {
		const possibleMasters = slayerMasters
			.filter(m => m.tasks.some(t => t.monster.id === selectedMonster?.id))
			.map(m => m.name);

		const suggestion =
			possibleMasters.length > 0
				? ` (${possibleMasters.join(', ')} can${possibleMasters.length > 1 ? '' : ' also'} assign this monster.)`
				: '';

		return `${selectedMaster.name} cannot assign ${selectedMonster.name}.${suggestion}`;
	}

	if (usersTask.currentTask?.id) {
		await prisma.slayerTask.update({
			where: {
				id: usersTask.currentTask?.id
			},
			data: {
				quantity,
				quantity_remaining: quantity,
				slayer_master_id: selectedMaster.id,
				monster_id: selectedMonster.id,
				skipped: false
			}
		});
	} else {
		await prisma.slayerTask.create({
			data: {
				user_id: user.id,
				quantity,
				quantity_remaining: quantity,
				slayer_master_id: selectedMaster.id,
				monster_id: selectedMonster.id,
				skipped: false
			}
		});
	}

	await user.update({
		slayer_last_task: selectedMonster.id
	});

	return `You set your slayer task to ${selectedMonster.name} using ${selectedMaster.name}.`;
}
