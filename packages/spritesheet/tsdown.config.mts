import { createTsupConfig } from '../../scripts/tsupconfig.ts';

const entry = ['src/index.ts'];
export default createTsupConfig({
	entry
});
