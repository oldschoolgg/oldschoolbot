import '../globalSetup';

import { runStartupScripts } from '../../src/lib/startupScripts';

export async function setup() {
	await runStartupScripts();
}
