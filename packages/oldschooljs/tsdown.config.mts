import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['./src/index.ts', './src/hiscores/index.ts'];

export default createTsdownConfig({
	entry,
	copy: [{ from: 'src/assets', to: 'dist/assets' }]
});
