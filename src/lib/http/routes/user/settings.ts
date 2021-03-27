import { noOp } from 'e';

import { client } from '../../../..';
import { UserSettings } from '../../../settings/types/UserSettings';
import { ActivityTable } from '../../../typeorm/ActivityTable.entity';
import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';

const userSettingsGetMe = (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/users/me',
		async handler(request, reply) {
			const user = await client.users.fetch(request.auth!.user_id!).catch(noOp);
			if (!user) {
				return reply.notFound('User not found.');
			}

			const { bank } = user.bank({ withGP: true });
			const skills = user.rawSkills;
			const lastDailyTimestamp = user.settings.get(UserSettings.LastDailyTimestamp);

			const activities = await ActivityTable.find({
				order: {
					finishDate: 'DESC'
				},
				take: 100
			});

			reply.send({ bank, skills, lastDailyTimestamp, activities });
		},
		config: {
			...rateLimit(3, '20 seconds'),
			requiresAuth: true
		}
	});

export default userSettingsGetMe;
