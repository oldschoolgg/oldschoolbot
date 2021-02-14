import { Static, Type } from '@sinclair/typebox';
import { getConnection } from 'typeorm';

import { skillsValues } from '../../../skilling/skills';
import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';

const QuerySchema = Type.Object(
	{
		skill: Type.String({ minLength: 1, maxLength: 20 })
	},
	{ additionalProperties: false }
);

export const skillsGetRoute = (server: FastifyServer) =>
	server.route<{ Querystring: Static<typeof QuerySchema> }>({
		method: 'GET',
		url: '/hiscores/skill',
		schema: {
			querystring: QuerySchema
		},
		async handler(request, reply) {
			const skill = skillsValues.find(s => s.id === request.query.skill);
			if (!skill) {
				return reply.badRequest();
			}

			const key = `"skills.${skill.id}"`;

			const res = await getConnection().query(
				`SELECT "new_user"."username", ${key} as ${skill.id}
				 FROM "users" "user"
				 INNER JOIN "new_users" "new_user" ON "new_user"."id" = "user"."id"
				 WHERE ${key} > 10 
				 ORDER BY ${key} DESC 
				 LIMIT 100;`
			);

			reply.send({ res });
		},
		config: {
			requiresAuth: false,
			...rateLimit(10, '30 seconds')
		}
	});
