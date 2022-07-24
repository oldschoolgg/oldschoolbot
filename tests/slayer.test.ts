import { allSlayerTasks } from '../src/lib/slayer/tasks';

describe('slayer.test', () => {
	test('tasks', () => {
		for (const task of allSlayerTasks) {
			expect(task.monsters).toContain(task.monster.id);
		}
	});
});
