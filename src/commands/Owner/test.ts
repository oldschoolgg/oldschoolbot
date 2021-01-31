import { graphql } from '@octokit/graphql';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

const graphqlWithAuth = graphql.defaults({
	headers: {
		authorization: `token XXX`
	}
});

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {});
	}

	async run(msg: KlasaMessage) {
		const res: any = await graphqlWithAuth(
			`
		{
        viewer {
          sponsorshipsAsMaintainer(includePrivate: true, first: 100) {
            totalCount
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
            nodes {
              id
              privacyLevel
              createdAt
              tier {
                name
                createdAt
              }
              sponsorEntity {
                ... on User {
                  id
                  login
                }
              }
            }
          }
          id
        }
      }


      `
		);
		const data = res.viewer.sponsorshipsAsMaintainer.nodes.map((node: any) => ({
			user: node.sponsorEntity.login,
			tier: node.tier.name,
			createdAt: node.tier.createdAt
		}));
		return msg.channel.send(JSON.stringify(data, null, 4));
	}
}
