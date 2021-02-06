import { graphql } from '@octokit/graphql';
import { createHmac } from 'crypto';

import { client } from '../..';

export { v4 as uuidv } from 'uuid';

import { clientSecret, githubToken } from '../../config';
import { PerkTier } from '../constants';

export function rateLimit(max: number, timeWindow: string) {
	return {
		rateLimit: {
			max,
			timeWindow
		}
	};
}

export function verifyGithubSecret(body: string, signature?: string | string[]): boolean {
	if (!signature) {
		return false;
	}
	const hmac = createHmac('sha1', clientSecret);
	hmac.update(body);
	const calculated = `sha1=${hmac.digest('hex')}`;
	return signature === calculated;
}

export const graphqlWithAuth = graphql.defaults({
	headers: {
		authorization: `token ${githubToken}`
	}
});

export function parseStrToTier(str: string) {
	switch (str) {
		case '$3 a month':
			return PerkTier.Two;
		case '$6 a month':
			return PerkTier.Three;
		case '$14 a month':
			return PerkTier.Four;
		case '$23 a month':
			return PerkTier.Five;
		case '$46 a month':
			return PerkTier.Six;
		case '$99 a month':
			return PerkTier.Six;
		default: {
			throw new Error(`Unmatched patron tier: ${str}`);
		}
	}
}

interface Sponsor {
	githubID: string;
	githubName: string;
	tier: PerkTier;
	createdAt: Date;
	private: boolean;
}

export async function fetchSponsors() {
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
			  }
              sponsorEntity {
                ... on User {
                  databaseId
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
	const data: Sponsor[] = res.viewer.sponsorshipsAsMaintainer.nodes
		.map((node: any) => ({
			githubID: node.sponsorEntity.databaseId,
			githubName: node.sponsorEntity.login as string,
			tier: parseStrToTier(node.tier.name),
			createdAt: new Date(node.createdAt),
			private: node.privacyLevel !== 'PUBLIC'
		}))
		.sort((a: any, b: any) => b.createdAt - a.createdAt);

	return data;
}

export async function getUserFromGithubID(githubID: string) {
	const result = await client.query<{ id: string }[]>(
		`SELECT id FROM users WHERE github_id = '${githubID}';`
	);
	if (result.length === 0) return null;
	return client.users.fetch(result[0].id);
}
