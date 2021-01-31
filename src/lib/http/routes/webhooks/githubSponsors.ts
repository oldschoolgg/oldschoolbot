import { client } from '../../../..';
import { sendToChannelID } from '../../../util/webhook';
import { GithubSponsorsWebhookData } from '../../githubApiTypes';
import { FastifyServer } from '../../types';
import { verifyGithubSecret } from '../../util';

const githubSponsors = (server: FastifyServer) =>
	server.route({
		method: 'POST',
		url: '/webhooks/github_sponsors',
		async handler(request, reply) {
			const isVerified = verifyGithubSecret(
				JSON.stringify(request.body),
				request.headers['x-hub-signature']
			);
			if (!isVerified) {
				throw reply.badRequest();
			}
			const data = request.body as GithubSponsorsWebhookData;
			console.log(JSON.stringify(data, null, 4));
			console.log(`Received webhook from Github sponsors`);
			sendToChannelID(client, '357422607982919680', {
				content: `${data.sender.login}[${data.sender.id}] became a sponsor for ${data.sponsorship.sponsor}.`
			});
			return reply.send({});
		},
		config: {}
	});

export default githubSponsors;
