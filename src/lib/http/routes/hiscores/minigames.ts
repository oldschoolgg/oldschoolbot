import { Static, Type } from '@sinclair/typebox';
import { getConnection } from 'typeorm';

import { Minigames } from '../../../../extendables/User/Minigame';
import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';

const QuerySchema = Type.Object(
	{
		minigame: Type.String({ minLength: 1, maxLength: 20 }),
		ironmen: Type.Boolean()
	},
	{ additionalProperties: false }
);

export const minigamesGetRoute = (server: FastifyServer) =>
	server.route<{ Querystring: Static<typeof QuerySchema> }>({
		method: 'GET',
		url: '/hiscores/minigame',
		schema: {
			querystring: QuerySchema
		},
		async handler(request, reply) {
			const minigame = Minigames.find(m => m.key === request.query.minigame)!;
			if (!minigame) {
				return reply.badRequest();
			}

			const minToShow = minigame.key === 'ChampionsChallenge' ? 1 : 10;

			let where = ` WHERE ${minigame.column} > ${minToShow}`;
			if (request.query.ironmen) {
				where += ` AND is_iron = true`;
			}

			const res = await getConnection().query(
				`SELECT "user"."badges", "user"."minion.ironman" as is_iron, "new_user"."username", ${minigame.column}
				 FROM minigames
				 INNER JOIN "new_users" "new_user" ON minigames.user_id = "new_user"."id"
				 INNER JOIN "users" "user" ON minigames.user_id = "user"."id"
				 ${where}
				 ORDER BY ${minigame.column} DESC
				 LIMIT 100;`
			);

			reply.send(res);
		},
		config: {
			requiresAuth: false,
			...rateLimit(10, '30 seconds')
		}
	});
