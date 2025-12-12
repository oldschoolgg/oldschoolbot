import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['src/index.ts', 'src/node/index.ts'];

export default createTsdownConfig({
	entry
});
