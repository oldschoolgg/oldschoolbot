import { randomSnowflake } from '@oldschoolgg/toolkit';
import { activity_type_enum } from '@prisma/client';
import { randInt, Time } from 'e';
import { describe, test } from 'vitest';

import { convertStoredActivityToFlatActivity } from '../../src/lib/settings/prisma';
import { tasks } from '../../src/lib/Task';
import { createTestUser, mockClient } from './util';

const activities = [
	{
		type: activity_type_enum.Agility,
		data: {
			courseID: 'Gnome Stronghold Agility Course',
			quantity: 10,
			alch: null
		}
	}
];

describe('Activities Mega-test', async () => {
	await mockClient();
	const user = await createTestUser();

	test('Activities', async () => {
		for (const a of activities) {
			const task = tasks.find(i => i.type === a.type)!;
			const converted = convertStoredActivityToFlatActivity({
				...a,
				id: randInt(1, 100_000),
				start_date: new Date(Date.now() - Time.Minute * 30),
				finish_date: new Date(),
				user_id: BigInt(user.id),
				channel_id: BigInt(randomSnowflake()),
				duration: Time.Minute * 30,
				completed: false,
				group_activity: false
			});
			await task.run(converted);
		}
	});
});
