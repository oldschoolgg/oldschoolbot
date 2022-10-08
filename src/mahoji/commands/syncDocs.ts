import { syncDocs } from '../../lib/docsActivity';
import { OSBMahojiCommand } from '../lib/util';

export const syncDocsCommand: OSBMahojiCommand = {
	name: 'sync_docs',
	description: 'Sync wiki articles',
	options: [],
	run: async () => {
		syncDocs();
		return 'Docs updated';
	}
};
