import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['./src/index.ts'];

export default createTsdownConfig({
	entry,
	unbundle: true,
	skipNodeModulesBundle: true,
	external: [],
	noExternal: [],
	copy: ['src/assets']
});
