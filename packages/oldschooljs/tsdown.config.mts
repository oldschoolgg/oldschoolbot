import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['./src/index.ts'];

export default createTsdownConfig({
	entry,
	unbundle: true,
	external: [],
	copy: ['src/assets'],
	minify: false
});
