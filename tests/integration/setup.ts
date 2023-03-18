import '../globalSetup';
import '../../src/lib/util/transactItemsFromBank';

import { runStartupScripts } from '../../src/lib/startupScripts';

export async function setup() {
	await runStartupScripts();
}
