import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

const entry = ['./src/index.ts'];

export default createTsdownConfig({
	entry,
	skipNodeModulesBundle: false,
	unbundle: false,
	minify: false,
	outputOptions: {
		advancedChunks: {
			groups: [
				{
					name: 'libs',
					test: /node_modules/
				}
			]
		}
	}
});
