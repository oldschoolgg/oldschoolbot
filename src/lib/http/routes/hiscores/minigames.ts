import { Static, Type } from '@sinclair/typebox';

import { isMinigameKey } from '../../../../extendables/User/Minigame';
import { MinigameTable } from '../../../typeorm/MinigameTable.entity';
import { NewUserTable } from '../../../typeorm/NewUserTable.entity';
import { toSnakeCase } from '../../../util';
import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';

const QuerySchema = Type.Object(
	{
		minigame: Type.String({ minLength: 1, maxLength: 20 }),
		ironman: Type.Boolean()
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
			if (!isMinigameKey(request.query.minigame)) {
				throw reply.badRequest();
			}

			const key = toSnakeCase(request.query.minigame);

			const res = await MinigameTable.createQueryBuilder('minigames')
				.leftJoin(NewUserTable, 'user', 'user.id = minigames.userID')
				.select(['user.username', `minigames.${request.query.minigame}`])
				.where(`${key} > 10`)
				.orderBy(`${key}`, 'DESC')
				.limit(100)
				.getRawMany();

			for (const item of res) {
				item[key] = item[`minigames_${key}`];
				delete item[`minigames_${key}`];
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
