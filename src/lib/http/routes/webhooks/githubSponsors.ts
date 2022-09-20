import { TextChannel } from 'discord.js';

import { syncLinkedAccounts } from '../../../../mahoji/mahojiSettings';
import { boxFrenzy } from '../../../boxFrenzy';
import { Channel } from '../../../constants';
import { addPatronLootTime } from '../../../doubleLoot';
import { patreonTask } from '../../../patreon';
import { sendToChannelID } from '../../../util/webhook';
import { GithubSponsorsWebhookData } from '../../githubApiTypes';
import { FastifyServer } from '../../types';
import { getUserFromGithubID, parseStrToTier, verifyGithubSecret } from '../../util';

const githubSponsors = (server: FastifyServer) =>
	server.route({
		method: 'POST',
		url: '/webhooks/github_sponsors',
		async handler(request, reply) {
			const isVerified = verifyGithubSecret(JSON.stringify(request.body), request.headers['x-hub-signature']);
			if (!isVerified) {
				throw reply.badRequest();
			}
			const data = request.body as GithubSponsorsWebhookData;
			const user = await getUserFromGithubID(data.sender.id.toString());
			// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
			switch (data.action) {
				case 'created': {
					const tier = parseStrToTier(data.sponsorship.tier.name);
					if (!tier) return;
					let effectiveTier = tier - 1;
					sendToChannelID(Channel.NewSponsors, {
						content: `${data.sender.login}[${data.sender.id}] became a Tier ${effectiveTier} sponsor.`
					});
					if (user) {
						await patreonTask.givePerks(user.id, tier);
					}

					addPatronLootTime(tier, user);

					for (const id of [Channel.BSOChannel, Channel.BSOGeneral]) {
						boxFrenzy(
							globalClient.channels.cache.get(id) as TextChannel,
							`🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
${data.sender.login} became a Github sponsor, as a reward for everyone, here is a box frenzy, guess any of the items in the image for a mystery box.
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉`,
							tier * 3
						);
					}
					break;
				}
				case 'tier_changed':
				case 'pending_tier_change': {
					const from = parseStrToTier(data.changes!.tier.from.name);
					const to = parseStrToTier(data.sponsorship.tier.name);
					if (!from || !to) return;
					sendToChannelID(Channel.NewSponsors, {
						content: `${data.sender.login}[${data.sender.id}] changed their sponsorship from Tier ${
							from - 1
						} to Tier ${to - 1}.`
					});
					if (user) {
						await patreonTask.changeTier(user.id, from, to);
					}
					break;
				}
				case 'cancelled': {
					const tier = parseStrToTier(data.sponsorship.tier.name);
					if (!tier) return;
					if (user) {
						await patreonTask.removePerks(user.id);
					}

					sendToChannelID(Channel.NewSponsors, {
						content: `${data.sender.login}[${data.sender.id}] cancelled being a Tier ${tier - 1} sponsor. ${
							user ? 'Removing perks.' : "Cant remove perks because couldn't find discord user."
						}`
					});

					break;
				}
			}
			syncLinkedAccounts();
			return reply.send({});
		},
		config: {}
	});

export default githubSponsors;
