import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';

import { BitField } from '../../constants';
import { allCLItemsFiltered } from '../../data/Collections';
import { prisma } from '../../settings/prisma';
import { ItemBank } from '../../types';
import { rateLimit } from '../util';

const GetParamsSchema = Type.Object(
	{
		userID: Type.String({ minLength: 15, maxLength: 25 })
	},
	{ additionalProperties: false }
);

export const publicUserRoute = (server: FastifyInstance) =>
	server.route<{ Params: Static<typeof GetParamsSchema> }>({
		method: 'GET',
		url: '/user/:userID',
		schema: {
			params: GetParamsSchema
		},
		async handler(request, reply) {
			const user = await prisma.user.findFirst({
				where: {
					id: request.params.userID,
					bitfield: {
						has: BitField.WebsiteDataConsentGiven
					}
				}
			});
			if (!user) return { user: null };
			const newUser = await prisma.newUser.findFirst({
				where: {
					id: user.id
				}
			});
			if (!newUser) return { user: null };

			const cl = user.collectionLogBank as ItemBank;
			reply.send({
				user: {
					cl,
					username: newUser.username,
					missingCLItems: allCLItemsFiltered.filter(i => !cl[i])
				}
			});
		},
		config: {
			...rateLimit(2, '1 seconds')
		}
	});
