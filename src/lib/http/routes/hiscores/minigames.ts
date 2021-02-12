import { Static, Type } from '@sinclair/typebox';

import { Minigames } from '../../../../extendables/User/Minigame';
import { MinigameTable } from '../../../typeorm/MinigameTable.entity';
import { NewUserTable } from '../../../typeorm/NewUserTable.entity';
import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';

const QuerySchema = Type.Object(
	{
		minigame: Type.String({ minLength: 1, maxLength: 20 })
	},
	{ additionalProperties: false }
);

const minigamesGetRoute = (server: FastifyServer) =>
	server.route<{ Querystring: Static<typeof QuerySchema> }>({
		method: 'GET',
		url: '/hiscores/minigame',
		schema: {
			querystring: QuerySchema
		},
		async handler(request, reply) {
			const minigame = Minigames.find(m => m.key === request.query.minigame)!;
			if (!minigame) {
				throw reply.badRequest();
			}

			const query = MinigameTable.createQueryBuilder('minigames')
				.leftJoin(NewUserTable, 'user', 'user.id = minigames.userID')
				.select(['user.username', `minigames.${request.query.minigame}`])
				.where(`${minigame.column} > 10`)
				.orderBy(`${minigame.column}`, 'DESC')
				.limit(100);

			const res = await query.getRawMany();

			for (const item of res) {
				item[minigame.column] = item[`minigames_${minigame.column}`];
				delete item[`minigames_${minigame.column}`];
				item.username = item.user_username;
				delete item.user_username;
			}

			reply.send({ res });
		},
		config: {
			requiresAuth: false,
			...rateLimit(10, '30 seconds')
		}
	});

export default minigamesGetRoute;
