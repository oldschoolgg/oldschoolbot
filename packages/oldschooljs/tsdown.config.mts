import { createTsupConfig } from '../../scripts/tsupconfig.ts';

const entry = ['./src/index.ts', './src/hiscores/index.ts'];

export default createTsupConfig({
	entry,
	copy: [{ from: 'src/assets', to: 'dist/assets' }]
});
