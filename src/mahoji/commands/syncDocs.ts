import { syncDocs } from '../../lib/docsActivity';
import { deferInteraction } from '../../lib/util/interactionReply';
import { OSBMahojiCommand } from '../lib/util';

export const syncDocsCommand: OSBMahojiCommand = {
	name: 'sync_docs',
	description: 'Sync wiki articles',
	options: [],
	run: async ({ interaction }) => {
		await deferInteraction(interaction);
		await syncDocs();
		return 'Docs updated';
	}
};
