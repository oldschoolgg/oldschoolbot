import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['src/index.ts', 'src/lib/GeneralBank.ts'];

export default createTsdownConfig({
	entry
});
