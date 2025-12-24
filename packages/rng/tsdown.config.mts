import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['./src/index.ts', './src/crypto.ts'];

export default createTsdownConfig({
	entry
});
