import { createTsdownConfig } from '../../scripts/createTsdownConfig.ts';

export default createTsdownConfig({
	entry: {
		index: 'src/index.ts',
		defaultWorker: 'src/strategies/sharding/defaultWorker.ts'
	}
});
